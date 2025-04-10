"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, ArrowLeft } from "lucide-react"
import Link from "next/link"

type Message = {
  id: number
  text: string
  sender: "user" | "bot"
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi there! I'm your FeelTrack companion. How are you feeling today?",
    sender: "bot",
  },
  {
    id: 2,
    text: "Would you like to talk about your day, or perhaps explore some mindfulness exercises?",
    sender: "bot",
  },
]

const quickResponses = [
  { emoji: "😊", text: "I'm feeling good" },
  { emoji: "😐", text: "I'm feeling neutral" },
  { emoji: "😞", text: "I'm feeling down" },
]

export default function ChatPage() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")

  // Handle initial message from home page
  useEffect(() => {
    const initialMessage = searchParams.get("message")
    if (initialMessage && initialMessage.trim()) {
      // Add user message
      const newUserMessage: Message = {
        id: messages.length + 1,
        text: initialMessage,
        sender: "user",
      }

      setMessages([...messages, newUserMessage])

      // Simulate bot response after a short delay
      setTimeout(() => {
        const botResponses = [
          "Thank you for sharing that with me. How does that make you feel?",
          "I understand. Would you like to explore why you might be feeling this way?",
          "That's interesting. Can you tell me more about that?",
          "I'm here to listen. Is there anything specific you'd like to talk about?",
          "It's okay to feel that way. What would help you feel better right now?",
        ]

        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

        const newBotMessage: Message = {
          id: messages.length + 2,
          text: randomResponse,
          sender: "bot",
        }

        setMessages((prevMessages) => [...prevMessages, newBotMessage])
      }, 1000)
    }
  }, [searchParams])



  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    }

    setMessages([...messages, newUserMessage])
    setInput("")

    //send to backend 

    const mg = {
      user_id: 1, // replace with actual user ID
      conversation_id: 1, // or an actual conversation ID if available
      content: input,
    };
  
    try {
      const response = await fetch('http://localhost:8001/conversations/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mg),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

  
      const data = await response.json();
      const res=data[data.length-1].content
      
      const newBotMessage: Message = {
        id: messages.length + 2,
        text: res,
        sender: "bot",
      }
      setMessages((prevMessages) => [...prevMessages, newBotMessage])
      console.log("Received from backend:", data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
   
    


   
  }





  const handleQuickResponse = (text: string) => {
    setInput(text)
  }

  return (
    <main className="flex flex-col h-screen bg-gradient-to-b from-rose-50 to-blue-50 p-4 pb-20">
      <div className="flex items-center mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-rose-600">Your Companion</h1>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === "user"
                  ? "bg-rose-500 text-white rounded-tr-none"
                  : "bg-white text-slate-700 rounded-tl-none shadow-md"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
        {quickResponses.map((response, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-none shadow-sm hover:bg-white"
            onClick={() => handleQuickResponse(response.text)}
          >
            <span>{response.emoji}</span>
            <span>{response.text}</span>
          </Button>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-full bg-white/80 backdrop-blur-sm border-none shadow-md focus-visible:ring-rose-400"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend()
            }
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white"
        >
          <Mic className="h-5 w-5 text-rose-500" />
        </Button>
        <Button onClick={()=>handleSend()} className="rounded-full bg-rose-500 hover:bg-rose-600 shadow-md" size="icon">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </main>
  )
}
