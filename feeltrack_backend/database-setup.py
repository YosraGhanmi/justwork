import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection configuration
config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "1996"),
}

DB_NAME = os.getenv("DB_NAME", "mentalhealthdb")

# Create database and tables
def setup_database():
    # Connect to MySQL server
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    
    # Create database if it doesn't exist
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    cursor.execute(f"USE {DB_NAME}")
    
    # Create Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    )
    """)
    
    # Create Conversations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Conversations (
        conversation_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(100) DEFAULT 'New Conversation',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    )
    """)
    
    # Create Messages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        is_user BOOLEAN NOT NULL,
        content TEXT NOT NULL,
        positive_reframe TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES Conversations(conversation_id) ON DELETE CASCADE
    )
    """)
    
    # Create SupportiveMessages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS SupportiveMessages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    )
    """)
    
    # Create UserPreferences table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS UserPreferences (
        user_id INT PRIMARY KEY,
        notification_frequency INT DEFAULT 120,
        active_hours_start TIME DEFAULT '08:00:00',
        active_hours_end TIME DEFAULT '22:00:00',
        notifications_enabled BOOLEAN DEFAULT TRUE,
        theme VARCHAR(20) DEFAULT 'light',
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    )
    """)
    
    print("Database and tables created successfully!")
    
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    setup_database()
