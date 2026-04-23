from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        # In a real app we might route to specific channels using Redis pubsub.
        # Here we just broadcast to all, and clients can filter by channel if needed,
        # or we just send the raw text if clients expect simple strings.
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()
