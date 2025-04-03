from rest_framework import serializers
from .models import Evaluation, User_BB, Profile, Social, Settings, Badge

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
        settings_data = validated_data.pop('settings')
        blocklist_data = settings_data.pop('blocklist', None)

        # Update the User_BB instance
        instance.role = validated_data.get('role', instance.role)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        # Update the Settings instance
        settings_instance = instance.settings
        settings_instance.tolerance = settings_data.get('tolerance', settings_instance.tolerance)
        settings_instance.badge = settings_data.get('badge', settings_instance.badge)
        settings_instance.save()

        # Update the blocklist
        if blocklist_data is not None:
            blocklist_ids = [profile['id'] for profile in blocklist_data]
            settings_instance.blocklist.set(blocklist_ids)

        return instance
    
    def delete(self, instance):
        # Delete the related Profile instances
        instance.settings.blocklist.clear()
        instance.settings.delete()
        instance.delete()
        return instance