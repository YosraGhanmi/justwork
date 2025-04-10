"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Mic } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const emotions = [
  { emoji: "😊", label: "Happy", color: "bg-yellow-100 border-yellow-300" },
  { emoji: "😌", label: "Calm", color: "bg-blue-100 border-blue-300" },
  { emoji: "😐", label: "Neutral", color: "bg-slate-100 border-slate-300" },
  { emoji: "😕", label: "Confused", color: "bg-purple-100 border-purple-300" },
  { emoji: "😞", label: "Sad", color: "bg-indigo-100 border-indigo-300" },
  { emoji: "😠", label: "Angry", color: "bg-red-100 border-red-300" },
  { emoji: "😰", label: "Anxious", color: "bg-teal-100 border-teal-300" },
  { emoji: "🥱", label: "Tired", color: "bg-gray-100 border-gray-300" },
]

export default function CheckInPage() {
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (selectedEmotion !== null) {
      setSubmitted(true)

      // Reset after showing thank you message
      setTimeout(() => {
        setSubmitted(false)
        setSelectedEmotion(null)
        setNotes("")
      }, 3000)
    }
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-rose-50 to-blue-50 p-4 pb-20">
      <div className="flex items-center mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-rose-600">Daily Check-In</h1>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center flex-1 text-center"
        >
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-2xl font-medium text-rose-600 mb-2">Thank you for sharing</h2>
          <p className="text-slate-600">
            Your feelings matter, and tracking them is an important step in your wellness journey.
          </p>
        </motion.div>
      ) : (
        <>
          <Card className="mb-6 border-none shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <h2 className="text-xl font-medium text-center text-slate-700 mb-4">How are you feeling today?</h2>
              <div className="flex overflow-x-auto pb-2 gap-3">
                {emotions.map((emotion, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                      selectedEmotion === index ? "transform scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setSelectedEmotion(index)}
                  >
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2 border-2 ${
                        emotion.color
                      } ${selectedEmotion === index ? "border-4 shadow-lg" : "shadow-sm"}`}
                    >
                      {emotion.emoji}
                    </div>
                    <span className="text-sm text-slate-700">{emotion.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-none shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <h2 className="text-xl font-medium text-center text-slate-700 mb-4">Would you like to share more?</h2>
              <div className="relative">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write about your feelings or what happened today..."
                  className="min-h-[120px] bg-white/60 border-slate-200 focus-visible:ring-rose-400"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-3 right-3 rounded-full bg-white/80 hover:bg-white"
                >
                  <Mic className="h-5 w-5 text-rose-500" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={selectedEmotion === null}
              className={`rounded-full px-8 py-6 h-auto text-lg shadow-md transition-all duration-300 ${
                selectedEmotion !== null ? "bg-rose-500 hover:bg-rose-600 hover:shadow-lg" : "bg-slate-300"
              }`}
            >
              Submit Check-In
            </Button>
          </div>
        </>
      )}
    </main>
  )
}
