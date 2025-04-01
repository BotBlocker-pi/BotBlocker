from django.contrib import admin
from app.models import User_BB, Social, Profile, Evaluation, GlobalList, Settings, ProfileBlock

class ProfileBlockInline(admin.TabularInline):
    model = ProfileBlock
    extra = 1  # Número de formulários vazios a exibir

class SettingsAdmin(admin.ModelAdmin):
    inlines = [ProfileBlockInline]
    list_display = ('user', 'tolerance', 'badge')  # Ajuste conforme necessário

# Register your models here.
admin.site.register(User_BB)
admin.site.register(Social)
admin.site.register(Profile)
admin.site.register(Evaluation)
admin.site.register(GlobalList)
admin.site.register(Settings, SettingsAdmin)  # Use a classe SettingsAdmin personalizada