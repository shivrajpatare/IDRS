import os
import logging
import firebase_admin
from firebase_admin import credentials, messaging

logger = logging.getLogger(__name__)

def initialize_firebase():
    """Initialize Firebase Admin SDK using GOOGLE_APPLICATION_CREDENTIALS."""
    try:
        # Avoid re-initializing if already done
        if not firebase_admin._apps:
            # We rely on the environment variable GOOGLE_APPLICATION_CREDENTIALS
            # If not set, this will raise an error or we can explicitly pass a path
            cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin SDK initialized successfully.")
            else:
                logger.warning(f"Firebase credentials not found at {cred_path}. Push notifications may fail.")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")

def send_push_notification(token: str, title: str, body: str, data: dict = None) -> bool:
    """Send a push notification to a specific token."""
    if not firebase_admin._apps:
        logger.error("Firebase not initialized. Cannot send notification.")
        return False
        
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=token,
        )
        response = messaging.send(message)
        logger.info(f"Successfully sent message: {response}")
        return True
    except Exception as e:
        logger.error(f"Error sending push notification: {e}")
        return False
