"""
URL configuration for Backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from app.views import *

urlpatterns = [
]
urlpatterns = [
    path('admin/', admin.site.urls),

    # 
    path('get_probability/', get_probability, name='get_probability'),
    path('avaliacao/', criar_avaliacao, name='criar_avaliacao'),
    path('perfis/', get_perfis, name='get_perfis'),
    path('get_settings/', get_settings, name='get_settings'),
    path('userWasVote/', userWasVote, name='userWasVote'),
    path('update_settings/', update_settings, name='update_settings'),
    path('get_evaluation_history/', get_evaluation_history, name='get_evaluation_history'),
    path('create_user/', createUserBB, name='createUserBB'),
    path("token/", CustomTokenObtainView.as_view(), name="token_obtain"),
    path('protected/',ProtectedView.as_view(),name="ProtectedView"),
    path('post_img/', post_img, name='post_img'),
    path('suspicious-activities/', get_suspicious_activities, name='get_suspicious_activities'),
    path('suspicious-activities/<uuid:activity_id>/resolve/', mark_suspicious_activity_resolved),
    path('users/timeout/apply/', apply_timeout, name='apply-timeout'),
    path('users/timeout/revoke/', revoke_timeout, name='revoke-timeout'),
    path('users/ban/', ban_user, name='ban-user'),
    path('users/unban/', unban_user, name='unban-user'),
    path('users/<uuid:user_id>/timeouts/', get_user_timeouts, name='get-user-timeouts'),

    path('block_profile/', block_profile, name='block_profile'),
    path('unblock_profile/', unblock_profile, name='unblock_profile'),
    path('give_badge/', give_badge, name='change_badge'),


    path('get_users/', get_users, name='get_users'),                       # GET - Listar todos usuários
    path('get_users_detailed/', get_users_detailed, name='get_users_detailed'),
    path('get_user/<uuid:id>/', get_user, name='get_user_by_id'),     # GET - Obter usuário específico
    path('update_user/<uuid:id>/', update_user, name='update_user'),        # PUT - Atualizar usuário
    path('delete_user/<uuid:id>/', delete_user, name='delete_user'),        # DELETE - Remover usuário
    
    path('get_profile/<str:username>/', get_profile, name='get_profile'),  # GET - Obter perfil específico
    path('get_evaluations/', get_evaluations, name='get_evaluations'),
]
