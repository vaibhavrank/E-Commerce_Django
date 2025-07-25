# Generated by Django 5.2.2 on 2025-06-10 09:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_category_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_main', models.BooleanField(default=False)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='accounts.product')),
            ],
            options={
                'constraints': [models.UniqueConstraint(condition=models.Q(('is_main', True)), fields=('product',), name='unique_main_image_for_product')],
            },
        ),
    ]
