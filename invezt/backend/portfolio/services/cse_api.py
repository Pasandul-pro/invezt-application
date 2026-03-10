"""
CSE API Service - Handles all communication with Colombo Stock Exchange API
"""
import requests
import logging
from datetime import datetime
from django.core.cache import cache

logger = logging.getLogger(__name__)

class CSEAPIService:
    """
    Service class to fetch data from CSE API
    """
    BASE_URL = "https://www.cse.lk/api"
    
    @classmethod
    def get_all_stock_prices(cls):
        """
        Fetch all stock prices from CSE tradeSummary endpoint
        Returns a dictionary with symbol as key and price data as value
        """
        try:
            # Check cache first
            cache_key = 'cse_all_prices'
            cached_data = cache.get(cache_key)
            
            if cached_data:
                logger.info("Returning cached CSE data")
                return cached_data
            
            # Make API request
            logger.info("Fetching fresh data from CSE API")
            response = requests.get(
                f"{cls.BASE_URL}/tradeSummary",
                timeout=10,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Referer': 'https://www.cse.lk/'
                }
            )
            
            # Check if request was successful
            response.raise_for_status()
            
            # Parse JSON response
            data = response.json()
            
            # Create a dictionary for easy lookup
            price_dict = {}
            for item in data:
                try:
                    symbol = item.get('symbol')
                    if symbol:
                        price_dict[symbol] = {
                            'price': float(item.get('lastTradedPrice', 0)),
                            'change': float(item.get('change', 0)) if item.get('change') else 0,
                            'volume': int(item.get('volume', 0)) if item.get('volume') else 0,
                            'open': float(item.get('open', 0)) if item.get('open') else 0,
                            'high': float(item.get('high', 0)) if item.get('high') else 0,
                            'low': float(item.get('low', 0)) if item.get('low') else 0,
                            'timestamp': datetime.now().isoformat()
                        }
                except (ValueError, TypeError) as e:
                    logger.warning(f"Error parsing data for {item.get('symbol')}: {e}")
                    continue
            
            # Cache for 1 hour (3600 seconds)
            cache.set(cache_key, price_dict, 3600)
            logger.info(f"Successfully cached {len(price_dict)} stock prices")
            
            return price_dict
            
        except requests.exceptions.ConnectionError:
            logger.error("Network connection error - cannot reach CSE API")
            return {}
        except requests.exceptions.Timeout:
            logger.error("Request timeout - CSE API is not responding")
            return {}
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error occurred: {e}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error fetching CSE data: {e}")
            return {}
    
    @classmethod
    def get_stock_price(cls, symbol):
        """
        Get current price for a specific stock symbol
        Returns price or None if not found
        """
        if not symbol:
            return None
            
        prices = cls.get_all_stock_prices()
        stock_data = prices.get(symbol)
        
        if stock_data:
            return stock_data.get('price')
        
        logger.warning(f"Symbol {symbol} not found in CSE data")
        return None
    
    @classmethod
    def get_stock_details(cls, symbol):
        """
        Get complete details for a specific stock
        """
        if not symbol:
            return None
            
        prices = cls.get_all_stock_prices()
        return prices.get(symbol)