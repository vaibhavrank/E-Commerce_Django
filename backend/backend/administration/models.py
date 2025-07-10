from django.db import models
from accounts.models import User
# Create your models here.
class AdminLog(models.Model):
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'is_staff': True})
    action = models.CharField(max_length=255)
    model = models.CharField(max_length=100)
    object_id = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.admin} - {self.action} - {self.model}#{self.object_id}"


class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    expiry_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.code
