from django.contrib import admin
from app.models import User_BB, Social, Profile, Evaluation, GlobalList, Settings, SuspiciousActivity,UserTimeout,UserBan



# Register your models here.
admin.site.register(User_BB)
admin.site.register(Social)
admin.site.register(Profile)
admin.site.register(Evaluation)
admin.site.register(GlobalList)
admin.site.register(Settings)
admin.site.register(SuspiciousActivity)
admin.site.register(UserTimeout)
admin.site.register(UserBan)