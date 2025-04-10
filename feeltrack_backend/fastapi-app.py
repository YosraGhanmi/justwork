from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
import mysql.connector
import mysql.connector.pooling
import os
import time
import hashlib
import uuid
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
MODEL_NAME = "models/gemini-1.5-pro"
# Configure database connection pool
db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "1996"),
    "database": os.getenv("DB_NAME", "mentalhealthdb"),
}

pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    **db_config
)

# FastAPI app
app = FastAPI(title="Mental Health Support App API")
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str


class MessageCreate(BaseModel):
    content: str
    conversation_id: Optional[int] = None
    user_id: int  # Now we need to explicitly pass the user_id with each request


class MessageResponse(BaseModel):
    message_id: int
    content: str
    is_user: bool
    positive_reframe: Optional[str] = None
    timestamp: datetime


class ConversationResponse(BaseModel):
    conversation_id: int
    title: str
    created_at: datetime
    updated_at: datetime


class SupportiveMessageResponse(BaseModel):
    message_id: int
    content: str
    created_at: datetime
    is_read: bool


class UserPreferencesUpdate(BaseModel):
    notification_frequency: Optional[int] = None
    active_hours_start: Optional[str] = None
    active_hours_end: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    theme: Optional[str] = None


# Helper functions
def get_db_connection():
    """Get a connection from the pool."""
    return pool.get_connection()


def hash_password(password: str) -> str:
    """Hash a password for storing."""
    return hashlib.sha256(password.encode()).hexdigest()


# Database operations functions
def create_user(username: str, email: str, password: str):
    """Create a new user in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        hashed_password = hash_password(password)
        cursor.execute(
            "INSERT INTO Users (username, email, password_hash) VALUES (%s, %s, %s)",
            (username, email, hashed_password)
        )
        conn.commit()
        user_id = cursor.lastrowid

        # Also create default user preferences
        cursor.execute(
            "INSERT INTO UserPreferences (user_id) VALUES (%s)",
            (user_id,)
        )
        conn.commit()

        return user_id
    except mysql.connector.Error as err:
        conn.rollback()
        if err.errno == 1062:  # Duplicate entry error
            if "username" in str(err):
                raise HTTPException(status_code=400, detail="Username already exists")
            else:
                raise HTTPException(status_code=400, detail="Email already exists")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        conn.close()


def authenticate_user(username: str, password: str):
    """Authenticate a user by username and password."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT user_id, username, email, password_hash FROM Users WHERE username = %s",
            (username,)
        )
        user = cursor.fetchone()
        if not user:
            return None

        hashed_password = hash_password(password)
        if hashed_password != user["password_hash"]:
            return None

        # Update last login timestamp
        cursor.execute(
            "UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = %s",
            (user["user_id"],)
        )
        conn.commit()

        return {"user_id": user["user_id"], "username": user["username"], "email": user["email"]}
    finally:
        cursor.close()
        conn.close()


def get_user(user_id: int):
    """Get a user by ID."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT user_id, username, email FROM Users WHERE user_id = %s",
            (user_id,)
        )
        user = cursor.fetchone()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    finally:
        cursor.close()
        conn.close()


def get_conversations(user_id: int):
    """Get all conversations for a user."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT conversation_id, title, created_at, updated_at FROM Conversations WHERE user_id = %s ORDER BY updated_at DESC",
            (user_id,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def create_conversation(user_id: int, title: str = "New Conversation"):
    """Create a new conversation."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO Conversations (user_id, title) VALUES (%s, %s)",
            (user_id, title)
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()


def get_messages(conversation_id: int):
    """Get all messages in a conversation."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT message_id, content, is_user, positive_reframe, timestamp FROM Messages WHERE conversation_id = %s ORDER BY timestamp",
            (conversation_id,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def create_message(conversation_id: int, content: str, is_user: bool, positive_reframe: str = None):
    """Create a new message."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Update the conversation's updated_at timestamp
        cursor.execute(
            "UPDATE Conversations SET updated_at = CURRENT_TIMESTAMP WHERE conversation_id = %s",
            (conversation_id,)
        )
        conn.commit()
        cursor.execute(
            "INSERT INTO Messages (conversation_id, content, is_user, positive_reframe) VALUES (%s, %s, %s, %s)",
            (conversation_id, content, is_user, positive_reframe)
        )
        conn.commit()



        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()


def get_user_preferences(user_id: int):
    """Get user preferences."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM UserPreferences WHERE user_id = %s",
            (user_id,)
        )
        prefs = cursor.fetchone()
        if not prefs:
            # Create default preferences if none exist
            cursor.execute(
                "INSERT INTO UserPreferences (user_id) VALUES (%s)",
                (user_id,)
            )
            conn.commit()
            cursor.execute(
                "SELECT * FROM UserPreferences WHERE user_id = %s",
                (user_id,)
            )
            prefs = cursor.fetchone()
        return prefs
    finally:
        cursor.close()
        conn.close()


def update_user_preferences(user_id: int, preferences: dict):
    """Update user preferences."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Build the SET part of the query dynamically based on what's being updated
        set_parts = []
        params = []
        for key, value in preferences.items():
            if value is not None:
                set_parts.append(f"{key} = %s")
                params.append(value)

        if not set_parts:
            return

        query = f"UPDATE UserPreferences SET {', '.join(set_parts)} WHERE user_id = %s"
        params.append(user_id)

        cursor.execute(query, params)
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def create_supportive_message(user_id: int, content: str):
    """Create a new supportive message."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO SupportiveMessages (user_id, content) VALUES (%s, %s)",
            (user_id, content)
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()


def get_unread_supportive_messages(user_id: int):
    """Get all unread supportive messages for a user."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT message_id, content, created_at, is_read FROM SupportiveMessages WHERE user_id = %s AND is_read = FALSE ORDER BY created_at DESC",
            (user_id,)
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def mark_supportive_message_read(message_id: int):
    """Mark a supportive message as read."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE SupportiveMessages SET is_read = TRUE WHERE message_id = %s",
            (message_id,)
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def get_recent_conversation_summary(user_id: int, limit: int = 10):
    """Get a summary of recent messages for the user."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get the most recent conversation
        cursor.execute(
            "SELECT conversation_id FROM Conversations WHERE user_id = %s ORDER BY updated_at DESC LIMIT 1",
            (user_id,)
        )
        result = cursor.fetchone()
        if not result:
            return "No recent conversations"

        conversation_id = result["conversation_id"]

        # Get the most recent messages from this conversation
        cursor.execute(
            """
            SELECT content, is_user, positive_reframe FROM Messages 
            WHERE conversation_id = %s 
            ORDER BY timestamp DESC LIMIT %s
            """,
            (conversation_id, limit)
        )
        messages = cursor.fetchall()

        # Format the messages into a summary
        summary = ""
        for msg in reversed(messages):  # Process in chronological order
            if msg["is_user"]:
                summary += f"User: {msg['content']}\n"
            else:
                summary += f"AI: {msg['content'][:100]}...\n"

            if msg["is_user"] and msg["positive_reframe"]:
                summary += f"Positive reframe: {msg['positive_reframe']}\n"

        return summary
    finally:
        cursor.close()
        conn.close()


def verify_conversation_owner(conversation_id: int, user_id: int):
    """Verify that a conversation belongs to a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT user_id FROM Conversations WHERE conversation_id = %s",
            (conversation_id,)
        )
        result = cursor.fetchone()
        if not result or result[0] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this conversation")
    finally:
        cursor.close()
        conn.close()


def verify_message_owner(message_id: int, user_id: int):
    """Verify that a supportive message belongs to a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT user_id FROM SupportiveMessages WHERE message_id = %s",
            (message_id,)
        )
        result = cursor.fetchone()
        if not result or result[0] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this message")
    finally:
        cursor.close()
        conn.close()


# Gemini prompt templates
CHATBOT_SYSTEM_PROMPT = """
You are a supportive, empathetic mental health companion in a mobile app. Your role is to:
1. Listen carefully to users' concerns, struggles, and feelings
2. Respond with empathy, understanding, and non-judgmental support
3. Offer a positive perspective whenever possible without invalidating feelings
4. Ask thoughtful questions to help users explore their thoughts and emotions
5. Suggest practical, evidence-based techniques for managing difficult emotions
6. Use a warm, conversational tone that feels supportive and friendly

Important guidelines:
- Never claim to be a licensed therapist or medical professional
- Don't diagnose conditions or prescribe treatments
- Remind users to seek professional help for serious mental health concerns
- Focus on emotional support and perspective-shifting rather than treatment
- Be authentic and avoid generic, canned responses
- Maintain appropriate boundaries while being empathetic
"""

POSITIVE_REFRAMING_PROMPT = """
I'd like you to help reframe a situation or thought the user has shared in a more positive light. 
Please carefully read their message and create a short positive reframing that:
1. Acknowledges their feelings without dismissing them
2. Identifies potential strengths, growth opportunities, or alternative perspectives
3. Uses a gentle, supportive tone that doesn't feel dismissive
4. Is concise (2-5 sentences)

Here's what the user shared:
"{user_message}"

Provide only the positive reframing without additional explanation or introduction.
"""

SUPPORTIVE_MESSAGE_PROMPT = """
Based on this recent conversation history, generate a short, personalized supportive message that will be sent as a notification to the user. 

Recent conversation themes:
{conversation_summary}

The supportive message should:
1. Be 1-2 sentences maximum 
2. Feel personal and tailored to their specific situation
3. Provide encouragement, validation, or a gentle positive reminder
4. Avoid sounding generic or like a fortune cookie
5. Not ask any questions (this is a one-way notification)

Return only the notification text without any additional context or explanation.
"""


# AI functions
async def generate_ai_response(conversation_history, user_message):
    """Generate an AI response using Gemini."""
    model = genai.GenerativeModel(MODEL_NAME)

    # Build the conversation history in the format Gemini expects
    formatted_history = [
        {"role": "user", "parts": ["START SYSTEM PROMPT\n" + CHATBOT_SYSTEM_PROMPT + "\nEND SYSTEM PROMPT"]}
    ]

    for msg in conversation_history:
        role = "user" if msg["is_user"] else "model"
        formatted_history.append({"role": role, "parts": [msg["content"]]})

    # Add the current user message
    formatted_history.append({"role": "user", "parts": [user_message]})

    try:
        chat = model.start_chat(history=formatted_history[1:])
        response = await chat.send_message_async(formatted_history[0]["parts"][0] + "\n\n" + user_message)
        return response.text
    except Exception as e:
        # Fallback response in case of API errors
        print(f"Error generating AI response: {e}")
        return "I'm having trouble connecting to my thinking system. Could you please try again in a moment?"


async def generate_positive_reframe(user_message):
    """Generate a positive reframing of a user message."""
    model = genai.GenerativeModel(MODEL_NAME)
    prompt = POSITIVE_REFRAMING_PROMPT.format(user_message=user_message)

    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating positive reframe: {e}")
        return None


async def generate_supportive_message(conversation_summary):
    """Generate a supportive message based on conversation history."""
    model = genai.GenerativeModel(MODEL_NAME)
    prompt = SUPPORTIVE_MESSAGE_PROMPT.format(conversation_summary=conversation_summary)

    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating supportive message: {e}")
        return "Remember that you're stronger than you think. Take a moment for yourself today."


# Background tasks
async def schedule_supportive_messages(background_tasks: BackgroundTasks = None):
    """Background task to generate and send supportive messages to users."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get users with notifications enabled who are due for a message
        cursor.execute("""
            SELECT u.user_id, up.notification_frequency, 
                   (SELECT MAX(created_at) FROM SupportiveMessages WHERE user_id = u.user_id) as last_message,
                   up.active_hours_start, up.active_hours_end
            FROM Users u
            JOIN UserPreferences up ON u.user_id = up.user_id
            WHERE up.notifications_enabled = TRUE
        """)
        users = cursor.fetchall()

        current_time = datetime.now().time()

        for user in users:
            # Check if user is within active hours
            active_start = datetime.strptime(str(user["active_hours_start"]), "%H:%M:%S").time()
            active_end = datetime.strptime(str(user["active_hours_end"]), "%H:%M:%S").time()

            # Skip if outside active hours
            if not (active_start <= current_time <= active_end):
                continue

            # Check if it's time for a new message
            last_message_time = user.get("last_message")
            frequency_minutes = user["notification_frequency"]

            if last_message_time is None or (
                    datetime.now() - last_message_time).total_seconds() >= frequency_minutes * 60:
                # Get conversation summary and generate message
                conversation_summary = get_recent_conversation_summary(user["user_id"])

                if conversation_summary != "No recent conversations":
                    supportive_message = await generate_supportive_message(conversation_summary)
                    create_supportive_message(user["user_id"], supportive_message)
    finally:
        cursor.close()
        conn.close()


# API endpoints
@app.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    """Register a new user."""
    user_id = create_user(user.username, user.email, user.password)
    return {"user_id": user_id, "username": user.username, "email": user.email}


@app.post("/login", response_model=UserResponse)
async def login(login_data: UserLogin):
    """Login and return user info."""
    user = authenticate_user(login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    return user


@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user_info(user_id: int):
    """Get user information by ID."""
    return get_user(user_id)


@app.get("/users/{user_id}/conversations", response_model=List[ConversationResponse])
async def list_conversations(user_id: int):
    """Get all conversations for a user."""
    conversations = get_conversations(user_id)
    return conversations


@app.post("/users/{user_id}/conversations", response_model=ConversationResponse)
async def create_new_conversation(
        user_id: int,
        title: str = "New Conversation"
):
    """Create a new conversation."""
    conversation_id = create_conversation(user_id, title)

    # Get the created conversation details
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT conversation_id, title, created_at, updated_at FROM Conversations WHERE conversation_id = %s",
            (conversation_id,)
        )
        conversation = cursor.fetchone()
        return conversation
    finally:
        cursor.close()
        conn.close()


@app.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def list_messages(
        conversation_id: int,
        user_id: int  # Now explicitly passed as a query parameter
):
    """Get all messages in a conversation."""
    # Verify the conversation belongs to the user
    verify_conversation_owner(conversation_id, user_id)

    messages = get_messages(conversation_id)
    return messages


@app.post("/conversations/message", response_model=List[MessageResponse])
async def send_message(
        message: MessageCreate,
        background_tasks: BackgroundTasks
):
    """Send a message and get AI response."""
    user_id = message.user_id

    # Create a new conversation if none specified
    conversation_id = message.conversation_id
    if not conversation_id:
        conversation_id = create_conversation(user_id)
    else:
        # Verify the conversation belongs to the user
        verify_conversation_owner(conversation_id, user_id)

    # Generate positive reframing of user message
    positive_reframe = await generate_positive_reframe(message.content)

    # Save user message
    user_message_id = create_message(conversation_id, message.content, True, positive_reframe)

    # Get conversation history for context
    conversation_history = get_messages(conversation_id)

    # Generate and save AI response
    ai_response = await generate_ai_response(conversation_history, message.content)
    ai_message_id = create_message(conversation_id, ai_response, False)
    # Schedule background task to generate supportive messages
    background_tasks.add_task(schedule_supportive_messages)

    # Get the new messages
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:

        cursor.execute(
            "SELECT message_id, content, is_user, positive_reframe, timestamp FROM Messages WHERE message_id =  %s",
            (ai_message_id,)
        )
        new_messages = cursor.fetchall()
        return new_messages
    finally:
        cursor.close()
        conn.close()


@app.get("/users/{user_id}/supportive-messages", response_model=List[SupportiveMessageResponse])
async def get_supportive_messages(user_id: int):
    """Get unread supportive messages for a user."""
    messages = get_unread_supportive_messages(user_id)
    return messages


@app.put("/supportive-messages/{message_id}/read")
async def mark_message_read(
        message_id: int,
        user_id: int  # Now explicitly passed as a query parameter
):
    """Mark a supportive message as read."""
    # Verify the message belongs to the user
    verify_message_owner(message_id, user_id)

    mark_supportive_message_read(message_id)
    return {"status": "success"}


@app.get("/users/{user_id}/preferences", response_model=dict)
async def get_preferences(user_id: int):
    """Get user preferences."""
    preferences = get_user_preferences(user_id)
    return preferences


@app.put("/users/{user_id}/preferences", response_model=dict)
async def update_preferences(
        user_id: int,
        preferences: UserPreferencesUpdate
):
    """Update user preferences."""
    update_user_preferences(user_id, preferences.dict(exclude_unset=True))
    updated_prefs = get_user_preferences(user_id)
    return updated_prefs


@app.get("/health")
async def health_check():
    """API health check endpoint."""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


# Start the background task to send supportive messages
@app.on_event("startup")
async def startup_event():
    background_tasks = BackgroundTasks()
    background_tasks.add_task(schedule_supportive_messages)


if __name__ == "__main__":
    import uvicorn
    #print(GEMINI_API_KEY)
    uvicorn.run(app, host="0.0.0.0", port=8001)

