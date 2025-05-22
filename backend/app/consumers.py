import json
from channels.generic.websocket import AsyncWebsocketConsumer

# class NotificationConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.user_id = self.scope['url_route']['kwargs']['user_id']
#         self.group_name = f"user_{self.user_id}"

#         await self.channel_layer.group_add(self.group_name, self.channel_name)
#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.group_name, self.channel_name)

#     async def receive(self, text_data):
#         # Apenas para teste/debug
#         await self.send(text_data=json.dumps({"message": "received"}))

#     async def send_notification(self, event):
#         await self.send(text_data=json.dumps({
#             'message': event['message']
#         }))


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'admins'
        print(f"[WS CONNECT] Nova ligação WebSocket para grupo '{self.group_name}' - canal: {self.channel_name}")

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        print(f"[WS DISCONNECT] Canal {self.channel_name} removido do grupo '{self.group_name}'")
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_notification(self, event):
        print(f"[WS NOTIFY] A enviar mensagem para canal {self.channel_name}: {(event['data'])}")
        await self.send(text_data=json.dumps(event["data"]))
        
    async def activity_resolved(self, event):
        await self.send(text_data=json.dumps({
            "event": "resolved",
            "activity_id": event["activity_id"]
        }))
