from django.db import models
from django.db import utils
from django.contrib.auth.models import User
import uuid

class Role(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    VERIFIER = 'verifier', 'Verifier'
    DEFAULT = 'default', 'Default'

class Badge(models.TextChoices):
    WITHOUT_VERIFICATION = 'without_verification', 'Without Verification'
    BOT = 'bot', 'Bot'
    BOT_AND_WITHOUT_VERIFICATION = 'bot_and_without_verification', 'Bot and Without Verification'
    EMPTY = 'empty', 'Empty'

class SocialType(models.TextChoices):
    INSTAGRAM = 'instagram', 'Instagram'
    LINKEDIN = 'linkedin', 'LinkedIn'
    X = 'x', 'X'



class User_BB(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.DEFAULT)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.user.username
    

class Social(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    social = models.CharField(max_length=50, choices=SocialType.choices)


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    url = models.URLField()
    username = models.CharField(max_length=255)
    badge = models.CharField(max_length=50, choices=Badge.choices, default=Badge.EMPTY)
    social = models.ForeignKey(Social, on_delete=models.CASCADE, related_name='profiles')
    percentage = models.FloatField(default=0)

    def __str__(self):
        return self.username
    
class Evaluation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User_BB, on_delete=models.CASCADE, related_name='evaluations')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='evaluations') 
    is_bot = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    notas = models.TextField()

    def __str__(self):
        return f"Evaluation by {self.user.user.username} for {self.profile.username} and {self.profile.social.social}"
    

class GlobalList(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profiles = models.ManyToManyField(Profile, related_name='global_lists')

class Settings(models.Model):
    user = models.OneToOneField(User_BB, on_delete=models.CASCADE, related_name="settings") 
    tolerance = models.FloatField()
    badge = models.CharField(max_length=50, choices=Badge.choices, default=Badge.EMPTY)
    blocklist = models.ManyToManyField(Profile, related_name='blocked_by')