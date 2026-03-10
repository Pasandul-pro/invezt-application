from django.urls import path
from . import views

urlpatterns = [
    # Existing endpoints
    path('portfolios/', views.PortfolioListCreateView.as_view(), name='portfolio-list'),
    path('portfolios/<int:pk>/', views.PortfolioDetailView.as_view(), name='portfolio-detail'),
    
    # New endpoints
    path('portfolios/summary/', views.portfolio_summary, name='portfolio-summary'),
    path('portfolios/refresh/', views.refresh_prices, name='refresh-prices'),
]