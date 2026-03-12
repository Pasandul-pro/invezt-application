import os
import time
import requests
import schedule
from pathlib import Path
from pymongo import MongoClient, errors as pymongo_errors

# ── Load from the single master .env at invezt/backend/.env ──────────────────
try:
    from dotenv import load_dotenv
    # One .env to rule them all — shared by backend Node.js AND this Python service
    master_env = Path(__file__).parent.parent / "backend" / ".env"
    load_dotenv(dotenv_path=master_env, override=False)
except ImportError:
    pass  # python-dotenv optional — falls back to system environment variables

# ── Configuration ─────────────────────────────────────────────────────────────
MONGODB_URI        = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/invezt")
CSE_API_URL        = "https://www.cse.lk/api/tradeSummary"
UPDATE_INTERVAL_HR = 1  # update every 1 hour

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
    "Referer": "https://www.cse.lk/"
}

# ── MongoDB connection — retries rather than crashing ─────────────────────────
client     = None
db         = None
collection = None

def connect_mongo(retries: int = 3, delay: int = 5) -> bool:
    """Try to connect to MongoDB. Returns True on success, False on failure."""
    global client, db, collection
    for attempt in range(1, retries + 1):
        try:
            c = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=8000)
            c.admin.command("ping")
            client     = c
            db         = client["invezt"]
            collection = db["marketData"]
            print(f"[CSE Fetcher] ✅ MongoDB connected.")
            return True
        except pymongo_errors.ServerSelectionTimeoutError:
            print(f"[CSE Fetcher] ⚠ MongoDB attempt {attempt}/{retries} failed "
                  f"(IP not whitelisted or network issue).")
            if attempt < retries:
                time.sleep(delay)
        except Exception as exc:
            print(f"[CSE Fetcher] ❌ MongoDB error: {exc}")
            if attempt < retries:
                time.sleep(delay)
    return False


# ── Fetch & store ─────────────────────────────────────────────────────────────
def fetch_market_data():
    """Fetch all CSE trade data and upsert into the marketData collection."""
    global collection

    # Reconnect if connection was lost
    if collection is None:
        print("[CSE Fetcher] No DB connection — attempting reconnect...")
        if not connect_mongo():
            print("[CSE Fetcher] ⚠ Skipping this run — MongoDB unavailable.")
            return

    print(f"[CSE Fetcher] Fetching CSE data at {time.strftime('%H:%M:%S')} ...")
    try:
        response = requests.get(CSE_API_URL, headers=HEADERS, timeout=15)
        print(f"[CSE Fetcher] HTTP {response.status_code}")

        if response.status_code != 200:
            print("[CSE Fetcher] Unexpected status — aborting this run.")
            return

        raw = response.json()

        # CSE API may return a list directly or wrap it in a dict
        if isinstance(raw, list):
            stocks = raw
        elif isinstance(raw, dict):
            stocks = (raw.get("data") or raw.get("content")
                      or raw.get("stocks") or [])
        else:
            stocks = []

        if not stocks:
            print("[CSE Fetcher] ℹ No stock data in response (market may be closed).")
            return

        updated: int = 0
        for stock in stocks:
            symbol = stock.get("symbol") or stock.get("securityCode")
            if not symbol:
                continue

            record = {
                "symbol":           str(symbol).strip().upper(),
                "price":            stock.get("lastTradedPrice"),
                "change":           stock.get("change"),
                "changePercentage": stock.get("changePercentage"),
                "volume":           stock.get("volume"),
                "marketCap":        stock.get("marketCap"),
                "updatedAt":        time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            try:
                collection.update_one(
                    {"symbol": record["symbol"]},
                    {"$set": record},
                    upsert=True
                )
                updated += 1
            except Exception as db_err:
                print(f"[CSE Fetcher] DB write error for {symbol}: {db_err}")
                collection = None  # force reconnect next run
                break

        if updated:
            print(f"[CSE Fetcher] ✅ Upserted {updated} stocks into MongoDB.")

    except requests.exceptions.Timeout:
        print("[CSE Fetcher] ⚠ CSE API request timed out — will retry next cycle.")
    except requests.exceptions.ConnectionError:
        print("[CSE Fetcher] ⚠ Cannot reach CSE API — check internet connection.")
    except Exception as exc:
        print(f"[CSE Fetcher] Unexpected error: {exc}")


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"[CSE Fetcher] Starting — updates every {UPDATE_INTERVAL_HR} hour(s).")

    # Try to connect but DON'T crash if Atlas is unreachable
    connect_mongo()

    # Run immediately (will skip gracefully if no DB)
    fetch_market_data()

    schedule.every(UPDATE_INTERVAL_HR).hours.do(fetch_market_data)

    while True:
        schedule.run_pending()
        time.sleep(30)