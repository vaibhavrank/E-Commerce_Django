# Generated by Django 5.2.2 on 2025-06-12 10:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_alter_order_options_remove_orderitem_price_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='razorpay_order_id',
            field=models.CharField(blank=True, help_text="Razorpay's generated order ID", max_length=255, null=True),
        ),
    ]
