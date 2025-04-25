from django.urls import path
from app.consumers import NotificationConsumer

websocket_urlpatterns = [
    path("notificacoes/admins/",NotificationConsumer.as_asgi()),
]
