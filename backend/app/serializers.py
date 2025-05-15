from datetime import timedelta
from django.utils import timezone
from rest_framework import serializers
from .models import Evaluation, SuspiciousActivity, User_BB, Profile, Social, Settings, Badge
from django.core.cache import cache
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User

from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache
from .models import Evaluation

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_notification(data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "admins",
        {
            "type": "send_notification",
             "data": data,
        }
    )



def create_suspicious_activity_if_needed(target, motive, cache_key, type_account, username):
    if not cache.get(cache_key):
        print(f"[SPAM ALERT] {motive}")
        sa = SuspiciousActivity.objects.create(
            content_type=ContentType.objects.get_for_model(target),
            object_id=target.id,
            motive=motive
        )
        send_notification({
            "id": str(sa.id),
            "username": username,
            "type_account": type_account,
            "reason": motive
        })
        cache.set(cache_key, True, timeout=600)

def detect_anomalies(user_bb, profile):
    now = timezone.now()

    recent_user_votes = Evaluation.objects.filter(
        user=user_bb,
        created_at__gte=now - timedelta(minutes=1)
    ).count()

    if recent_user_votes > 30:
        create_suspicious_activity_if_needed(
            target=user_bb,
            motive=f"{recent_user_votes} votes in 1 minute",
            cache_key=f"spam_alert_user_{user_bb.id}",
            type_account="User",
            username=user_bb.user.username
        )

    recent_profile_votes = Evaluation.objects.filter(
        profile=profile,
        created_at__gte=now - timedelta(minutes=5)
    ).count()

    if recent_profile_votes > 50:
        create_suspicious_activity_if_needed(
            target=profile,
            motive=f"{recent_profile_votes} votes in 5 minutes",
            cache_key=f"spam_alert_profile_{profile.id}",
            type_account=profile.social.social,
            username=profile.username
        )

class EvaluationSerializer(serializers.ModelSerializer):
    user = serializers.CharField()  
    profile = serializers.CharField(write_only=True)  
    rede_social = serializers.CharField(write_only=True)

    class Meta:
        model = Evaluation
        fields = ['user', 'profile', 'rede_social', 'is_bot', 'notas', 'created_at']

    def create(self, validated_data):

        try:
            user = User_BB.objects.get(user__username=validated_data['user'])
        except User_BB.DoesNotExist:
            raise serializers.ValidationError({"user": "User not found"})
       
        try:
            profile = Profile.objects.get(username=validated_data["profile"], social__social=validated_data["rede_social"])
        except Profile.DoesNotExist:
            raise serializers.ValidationError({"profile": "Profile not found"})
        
        

        evaluation = Evaluation.objects.create(
            user=user,
            profile=profile,
            is_bot=validated_data.get('is_bot', False),
            notas=validated_data.get('notas', ''),
            created_at=validated_data.get('created_at', None)
        )


        total_evaluations = Evaluation.objects.filter(profile=profile).count()
        bot_evaluations = Evaluation.objects.filter(profile=profile, is_bot=True).count()
        
        probability = (bot_evaluations / total_evaluations) * 100 if total_evaluations > 0 else 0

        profile.percentage = probability

        profile.save()

        detect_anomalies(user,profile)

        return evaluation
    
class ProfileShortSerializer(serializers.ModelSerializer):
    social = serializers.CharField(source='social.social')

    class Meta:
        model = Profile
        fields = ['username', 'social', 'percentage', 'badge']

class SettingsSerializer(serializers.ModelSerializer):
    badge = serializers.ChoiceField(choices=Badge.choices)
    blocklist = ProfileShortSerializer(many=True)

    class Meta:
        model = Settings
        fields = ['tolerance', 'badge', 'blocklist']


class UserBBSerializer(serializers.ModelSerializer):
    settings = SettingsSerializer()

    class Meta:
        model = User_BB
        fields = ['id', 'user', 'role', 'email', 'settings']

    def update(self, instance, validated_data):
        # Verificar se validated_data não é None
        if validated_data is None:
            return instance

        # Tratar settings de forma mais segura
        settings_data = validated_data.pop('settings', {})
        
        # Verificar se settings_data não é None
        if settings_data is None:
            settings_data = {}

        # Extrair blocklist separadamente e com segurança
        blocklist_data = settings_data.pop('blocklist', [])

        # Update User_BB instance
        instance.role = validated_data.get('role', instance.role)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        # Update Settings instance
        if settings_data:
            settings_instance = instance.settings
            settings_instance.tolerance = settings_data.get('tolerance', settings_instance.tolerance)
            settings_instance.badge = settings_data.get('badge', settings_instance.badge)
            settings_instance.save()

        # Update blocklist
        if blocklist_data:
            blocklist_ids = [profile['id'] for profile in blocklist_data]
            instance.settings.blocklist.set(blocklist_ids)

        return instance
        
    def delete(self, instance):
        # Delete the related Profile instances
        instance.settings.blocklist.clear()
        instance.settings.delete()
        instance.delete()
        return instance
    

from rest_framework import serializers
from .models import SuspiciousActivity, Profile, User_BB

class SuspiciousActivitySerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    type_account = serializers.SerializerMethodField()
    motive = serializers.CharField()
    status = serializers.CharField()

    class Meta:
        model = SuspiciousActivity
        fields = ['id', 'username', 'type_account', 'motive', 'status', 'created_at']

    def get_username(self, obj):
        target = obj.target
        if isinstance(target, Profile):
            return target.username
        elif isinstance(target, User_BB) and target.user:
            return target.user.username
        return "Unknown"

    def get_type_account(self, obj):
        target = obj.target
        if isinstance(target, Profile):
            return target.social.social
        elif isinstance(target, User_BB):
            return "User"
        return "Unknown"

class UserBBDisplaySerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    settings = SettingsSerializer()

    class Meta:
        model = User_BB
        fields = ['id', 'user', 'role', 'email', 'settings']

    def get_user(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "username": obj.user.username,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name
            }
        return None

