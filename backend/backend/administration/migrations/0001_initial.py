# Generated by Django 5.2.2 on 2025-06-24 06:00

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Coupon',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=50, unique=True)),
                ('discount_percent', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('discount_amount', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('min_order_value', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('is_active', models.BooleanField(default=True)),
                ('expiry_date', models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='AdminLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(max_length=255)),
                ('model', models.CharField(max_length=100)),
                ('object_id', models.CharField(max_length=100)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('admin', models.ForeignKey(limit_choices_to={'is_staff': True}, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
