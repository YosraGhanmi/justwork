# Mental Health Support App Backend

This is the backend for a mental health and emotional wellbeing support application, created for the AI Hackathon (April 8-10, 2025). The app features a supportive AI chatbot that provides positive reframing and periodic supportive messages to users.

## Features

- 🤖 **AI Chatbot**: An empathetic AI chatbot that listens to users' concerns and provides supportive responses
- ✨ **Positive Reframing**: Automatically reframes users' messages from a positive perspective
- 🔔 **Supportive Notifications**: Sends periodic supportive messages based on recent conversation history
- 🔐 **User Authentication**: Secure JWT-based authentication system
- ⚙️ **User Preferences**: Customizable notification frequency and active hours

## Tech Stack

- **FastAPI**: Modern, high-performance web framework for building APIs
- **MySQL**: Database for storing user data, conversations, and messages
- **Google Gemini API**: Generative AI model for chatbot responses and supportive messages
- **JWT**: Secure authentication mechanism

## Project Structure

```
mental-health-app/
├── main.py                 # FastAPI application with API endpoints
├── setup_database.py       # Script to set up MySQL database and tables
├── .env                    # Environment variables (create from .env.template)
├── .env.template           # Template for environment variables
└── requirements.txt        # Python dependencies
```

## Database Schema

The application uses the following database tables:

- **Users**: Stores user account information
- **Conversations**: Tracks conversation sessions for each user
- **Messages**: Stores individual messages in conversations, including AI responses and positive reframings
- **SupportiveMessages**: Stores generated supportive messages for notifications
- **UserPreferences**: Stores user preferences for notifications and app settings

## Getting Started

### Prerequisites

- Python 3.8+
- MySQL 5.7+
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mental-health-app
   ```

2. Create a virtual environment and install dependencies:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Create an `.env` file from the template:
   ```
   cp .env.template .env
   ```

4. Edit the `.env` file with your database credentials and Gemini API key.

5. Set up the database:
   ```
   python setup_database.py
   ```

6. Start the FastAPI server:
   ```
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`. You can explore the API documentation at `http://localhost:8000/docs`.

## API Endpoints

### Authentication

- `POST /register`: Register a new user
- `POST /token`: Login and obtain JWT token

### Conversations

- `GET /conversations`: List all conversations for the current user
- `POST /conversations`: Create a new conversation
- `GET /conversations/{conversation_id}/messages`: Get all messages in a conversation
- `POST /conversations/message`: Send a message and get AI response

### Supportive Messages

- `GET /supportive-messages`: Get unread supportive messages
- `PUT /supportive-messages/{message_id}/read`: Mark a supportive message as read

### User Preferences

- `GET /preferences`: Get user preferences
- `PUT /preferences`: Update user preferences

## Prompting Strategy

The application uses carefully crafted prompts to guide the AI's responses:

1. **Chatbot System Prompt**: Instructs the AI to be supportive, empathetic, and non-judgmental
2. **Positive Reframing Prompt**: Guides the AI to reframe user messages in a positive light
3. **Supportive Message Prompt**: Directs the AI to generate short, personalized supportive messages

## Requirements File

Create a `requirements.txt` file with the following dependencies:

```
fastapi
uvicorn
python-multipart
python-jose[cryptography]
passlib[bcrypt]
mysql-connector-python
python-dotenv
google-generativeai
```

## Extending the Application

Here are some ideas for future enhancements:

1. **Mood Tracking**: Add functionality to track user's mood over time
2. **Meditation Resources**: Integrate guided meditation audio or scripts
3. **Crisis Resources**: Add emergency resources for users in distress
4. **Multiple Personalities**: Allow users to choose different AI personalities
5. **Journaling Features**: Add structured journaling prompts and templates

## Mobile App Integration

This backend is designed to be integrated with a mobile app frontend. To connect the mobile app:

1. Configure your mobile app to make API requests to the endpoints described above
2. Implement JWT authentication in your mobile app
3. Create UI components for chat interface, notification display, and settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.
