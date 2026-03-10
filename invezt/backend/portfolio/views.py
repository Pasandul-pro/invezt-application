from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, F, FloatField
from django.db.models.functions import Coalesce
from .models import Portfolio
from .serializers import PortfolioSerializer
from .services.cse_api import CSEAPIService
import logging

logger = logging.getLogger(__name__)

class PortfolioListCreateView(generics.ListCreateAPIView):
    """
    List all portfolios for current user or create new portfolio
    """
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PortfolioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a portfolio instance
    """
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Update price before returning portfolio details"""
        instance = self.get_object()
        # Update price in background (don't wait for it)
        instance.update_current_price()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def portfolio_summary(request):
    """
    Get comprehensive portfolio summary with live prices
    """
    try:
        portfolios = Portfolio.objects.filter(user=request.user)
        
        # Try to update prices (but don't fail if API is down)
        for portfolio in portfolios:
            try:
                portfolio.update_current_price()
            except Exception as e:
                logger.warning(f"Failed to update {portfolio.symbol}: {e}")
        
        # Calculate totals
        total_investment = 0
        total_current = 0
        holdings = []
        
        for portfolio in portfolios:
            investment = float(portfolio.buy_price * portfolio.quantity)
            current = float(portfolio.current_price * portfolio.quantity) if portfolio.current_price else None
            
            total_investment += investment
            if current:
                total_current += current
            
            holdings.append({
                'id': portfolio.id,
                'symbol': portfolio.symbol,
                'quantity': portfolio.quantity,
                'buy_price': float(portfolio.buy_price),
                'current_price': float(portfolio.current_price) if portfolio.current_price else None,
                'investment': investment,
                'current_value': current,
                'profit_loss': float(portfolio.profit_loss) if portfolio.profit_loss else None,
                'profit_loss_percentage': float(portfolio.profit_loss_percentage),
                'day_change': None  # Could be fetched from API if needed
            })
        
        # Calculate overall performance
        total_profit_loss = total_current - total_investment
        total_profit_loss_percentage = (total_profit_loss / total_investment * 100) if total_investment > 0 else 0
        
        return Response({
            'status': 'success',
            'data': {
                'holdings': holdings,
                'summary': {
                    'total_investment': round(total_investment, 2),
                    'total_current_value': round(total_current, 2),
                    'total_profit_loss': round(total_profit_loss, 2),
                    'total_profit_loss_percentage': round(total_profit_loss_percentage, 2),
                    'number_of_stocks': portfolios.count(),
                    'last_updated': portfolios.order_by('-updated_at').first().updated_at if portfolios.exists() else None
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error in portfolio summary: {e}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def refresh_prices(request):
    """
    Manually refresh prices for user's portfolio
    """
    portfolios = Portfolio.objects.filter(user=request.user)
    updated = 0
    failed = 0
    
    for portfolio in portfolios:
        if portfolio.update_current_price():
            updated += 1
        else:
            failed += 1
    
    return Response({
        'message': f'Updated {updated} stocks, {failed} failed',
        'updated': updated,
        'failed': failed
    })