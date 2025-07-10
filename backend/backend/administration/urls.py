from django.urls import path
from administration.views import product_views

urlpatterns = [
    path('products/', product_views.ProductListAPIView.as_view()),
    # path('orders/', order_views.OrderListAPIView.as_view()),
    # path('users/', user_views.UserListAPIView.as_view()),
    # # Add more as needed
]
