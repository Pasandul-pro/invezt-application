"""
Django management command to update all portfolio stock prices
Run every hour using cron or Windows Task Scheduler
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from portfolio.models import Portfolio
from portfolio.services.cse_api import CSEAPIService
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Update current prices for all portfolios from CSE API'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--user',
            type=int,
            help='Update prices only for a specific user ID',
        )
    
    def handle(self, *args, **options):
        """
        Main command handler
        """
        start_time = datetime.now()
        self.stdout.write(f"Starting price update at {start_time}")
        
        # Get all unique symbols from portfolios
        if options['user']:
            # Update for specific user
            portfolios = Portfolio.objects.filter(user_id=options['user'])
            self.stdout.write(f"Updating prices for user ID: {options['user']}")
        else:
            # Update all portfolios
            portfolios = Portfolio.objects.all()
            self.stdout.write("Updating prices for all users")
        
        if not portfolios.exists():
            self.stdout.write(self.style.WARNING("No portfolios found to update"))
            return
        
        # Get unique symbols to minimize API calls
        unique_symbols = set(portfolios.values_list('symbol', flat=True))
        self.stdout.write(f"Found {len(unique_symbols)} unique symbols to update")
        
        # Fetch all prices at once (API call with caching)
        all_prices = CSEAPIService.get_all_stock_prices()
        
        if not all_prices:
            self.stdout.write(self.style.ERROR("Failed to fetch prices from CSE API"))
            return
        
        # Update each portfolio
        updated_count = 0
        failed_count = 0
        
        for portfolio in portfolios:
            symbol = portfolio.symbol
            stock_data = all_prices.get(symbol)
            
            if stock_data:
                portfolio.current_price = stock_data['price']
                portfolio.calculate_profit_loss()
                portfolio.save(update_fields=['current_price', 'profit_loss', 'updated_at'])
                updated_count += 1
                self.stdout.write(f"✓ Updated {symbol}: {stock_data['price']}", ending='\r')
            else:
                failed_count += 1
                self.stdout.write(self.style.WARNING(f"✗ Symbol not found: {symbol}"))
        
        # Summary
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        self.stdout.write(self.style.SUCCESS(
            f"\n✅ Update completed in {duration:.2f} seconds\n"
            f"   Updated: {updated_count} portfolios\n"
            f"   Failed: {failed_count} portfolios\n"
            f"   Time: {end_time}"
        ))