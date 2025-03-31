# Generated by Django 5.1.7 on 2025-03-31 15:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='badge',
            field=models.CharField(choices=[('without_verification', 'Without Verification'), ('bot', 'Bot'), ('bot_and_without_verification', 'Bot and Without Verification'), ('empty', 'Empty')], default='empty', max_length=50),
        ),
        migrations.AlterField(
            model_name='settings',
            name='badge',
            field=models.CharField(choices=[('without_verification', 'Without Verification'), ('bot', 'Bot'), ('bot_and_without_verification', 'Bot and Without Verification'), ('empty', 'Empty')], default='empty', max_length=50),
        ),
    ]
