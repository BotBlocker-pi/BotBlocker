from django.contrib import admin
from app.models import User_BB, Social, Profile, Evaluation, GlobalList, Settings, SuspiciousActivity



# Register your models here.
admin.site.register(User_BB)
admin.site.register(Social)
admin.site.register(Profile)
admin.site.register(Evaluation)
admin.site.register(GlobalList)
admin.site.register(Settings)
admin.site.register(SuspiciousActivity)