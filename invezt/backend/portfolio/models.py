from django.db import models
from django.contrib.auth.models import User
from .services.cse_api import CSEAPIService
import logging

logger = logging.getLogger(__name__)

class Portfolio(models.Model):
    """
    Portfolio model to track user's stock investments
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')
    symbol = models.CharField(max_length=20, help_text="Stock symbol (e.g., JKH.N0000)")
    quantity = models.IntegerField(help_text="Number of shares")
    buy_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Purchase price per share")
    current_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Current market price")
    profit_loss = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Total profit/loss")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'symbol']  # Prevent duplicate entries for same stock
    
    def __str__(self):
        return f"{self.user.username} - {self.symbol} ({self.quantity} shares)"
    
    def update_current_price(self):
        """
        Fetch and update current price from CSE API
        Returns True if successful, False otherwise
        """
        try:
            # Get current price from API
            current_price = CSEAPIService.get_stock_price(self.symbol)
            
            if current_price:
                # Update the model
                self.current_price = current_price
                self.calculate_profit_loss()
                self.save(update_fields=['current_price', 'profit_loss', 'updated_at'])
                logger.info(f"Updated {self.symbol} price to {current_price}")
                return True
            else:
                logger.warning(f"Could not fetch price for {self.symbol}")
                return False
                
        except Exception as e:
            logger.error(f"Error updating price for {self.symbol}: {e}")
            return False
    
    def calculate_profit_loss(self):
        """
        Calculate profit/loss based on current price
        """
        if self.current_price and self.buy_price:
            self.profit_loss = (self.current_price - self.buy_price) * self.quantity
        else:
            self.profit_loss = None
    
    @property
    def profit_loss_percentage(self):
        """
        Calculate profit/loss percentage
        """
        if self.buy_price and self.current_price and self.buy_price > 0:
            return ((self.current_price - self.buy_price) / self.buy_price) * 100
        return 0
    
    @property
    def investment_value(self):
        """
        Total investment amount
        """
        return self.buy_price * self.quantity
    
    @property
    def current_value(self):
        """
        Current market value of holdings
        """
        if self.current_price:
            return self.current_price * self.quantity
        return None
    
    def save(self, *args, **kwargs):
        """
        Override save to calculate profit_loss when current_price is set
        """
        if self.current_price:
            self.calculate_profit_loss()
        super().save(*args, **kwargs)