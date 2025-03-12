from django.db import models
from django.db import utils
import uuid

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    role = models.CharField(max_length=50, choices=[('admin', 'Admin'),('verfic', 'Verfic'), ('user', 'User')])
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.name

class Settings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings" ) 
    tolerance = models.FloatField()
    badge = models.BooleanField(max_length=50, choices=[("none","none"),("bot","bot"),("not bot","not bot")])
    evaluations = models.ManyToManyField('Evaluation', related_name='settings')
    blocklist = models.ManyToManyField('Profile', related_name='blocked_by')

class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    url = models.URLField()
    evaluation = models.ManyToManyField('Evaluation', related_name='profiles')
    badge = models.CharField(max_length=50, choices=[("none","none"),("bot","bot"),("not bot","not bot")])

class GlobalList(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profiles = models.ManyToManyField(Profile, related_name='global_lists')

class Evaluation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluations')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='evaluations')
    is_bot = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    notas = models.TextField()

    def __str__(self):
        return f"Evaluation by {self.user.name} for {self.profile.url}"
