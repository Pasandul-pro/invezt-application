import requests
import schedule
import time
from pymongo import MongoClient

# MongoDB connection (same DB used in MERN backend)
client = MongoClient("mongodb://localhost:27017/")
db = client["invezt"]
collection = db["marketData"]

CSE_API = "https://www.cse.lk/api/tradeSummary"

headers = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json"
}

def fetch_market_data():

    print("Fetching CSE market data...")

    try:

        response = requests.get(CSE_API,headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json",
        "Referer": "https://www.cse.lk/"},
        timeout=10)

        # <<< Add debug logging here >>>
        print("Status Code:", response.status_code)
        print("Response Preview:", response.text[:200])  # shows first 200 characters

        if response.status_code != 200:
            print("Error fetching data")
            return

        data = response.json()

        # clear old data
        collection.delete_many({})

        for stock in data:

            record = {
                "symbol": stock.get("symbol"),
                "price": stock.get("lastTradedPrice"),
                "change": stock.get("change"),
                "volume": stock.get("volume")
            }

            collection.insert_one(record)

        print("Market data updated")

    except Exception as e:
        print("Error:", e)

# update every 1 hour
schedule.every(1).hours.do(fetch_market_data)

fetch_market_data()

while True:
    schedule.run_pending()
    time.sleep(60)