from rest_framework import serializers
from .models import Portfolio

class PortfolioSerializer(serializers.ModelSerializer):
    """
    Serializer for Portfolio model
    """
    profit_loss_percentage = serializers.FloatField(read_only=True)
    investment_value = serializers.FloatField(read_only=True)
    current_value = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 
            'symbol', 
            'quantity', 
            'buy_price', 
            'current_price', 
            'profit_loss',
            'profit_loss_percentage',
            'investment_value',
            'current_value',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['current_price', 'profit_loss', 'created_at', 'updated_at']