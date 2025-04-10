"use client"


import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Mic } from "lucide-react"
import Link from "next/link"


export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen p-4 bg-gradient-to-b from-rose-50 to-blue-50">
      <div className="w-full max-w-md mx-auto mt-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-rose-600">FeelTrack</h1>
          <p className="text-slate-600 mt-2">Your emotional wellness companion</p>
        </div>


        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <h2 className="text-xl font-medium text-center text-slate-700 mb-4">Hi, how are you feeling today?</h2>
            <p className="text-slate-600 text-center mb-6">
              Take a moment to check in with yourself and share how you're doing.
            </p>
            <form
              action="/chat"
              method="get"
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                const input = e.currentTarget.elements.namedItem("message") as HTMLInputElement
                if (!input.value.trim()) {
                  e.preventDefault()
                }
              }}
            >
              <div className="relative">
                <textarea
                  name="message"
                  placeholder="Share how you're feeling or ask me anything..."
                  className="w-full p-4 pr-12 rounded-xl border-none bg-slate-50/80 focus:ring-rose-400 focus-visible:ring-rose-400 min-h-[100px] text-slate-700 shadow-inner"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button type="button" className="text-rose-400 hover:text-rose-500">
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="rounded-full bg-rose-500 hover:bg-rose-600 text-white px-6 py-6 h-auto flex items-center gap-2 shadow-md transition-all duration-300 hover:shadow-lg self-center"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Start Chatting</span>
              </Button>
            </form>
          </CardContent>
        </Card>


        <div className="grid grid-cols-2 gap-4">
          <Link href="/check-in" className="w-full">
            <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <div className="text-3xl mb-2">😊</div>
                <h3 className="text-lg font-medium text-slate-700">Daily Check-in</h3>
                <p className="text-sm text-slate-500 mt-1">Track how you feel</p>
              </CardContent>
            </Card>
          </Link>


          <Link href="/weekly" className="w-full">
            <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="text-lg font-medium text-slate-700">Weekly Wrap</h3>
                <p className="text-sm text-slate-500 mt-1">See your progress</p>
              </CardContent>
            </Card>
          </Link>


          <Link href="/notifications" className="w-full">
            <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <div className="text-3xl mb-2">🔔</div>
                <h3 className="text-lg font-medium text-slate-700">Reminders</h3>
                <p className="text-sm text-slate-500 mt-1">Gentle nudges</p>
              </CardContent>
            </Card>
          </Link>


          <Link href="/garden" className="w-full">
            <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <div className="text-3xl mb-2">🌱</div>
                <h3 className="text-lg font-medium text-slate-700">Your Gardennn</h3>
                <p className="text-sm text-slate-500 mt-1">Watch it grow</p>
              </CardContent>
            </Card>
          </Link>




          <Link href="/stories" className="w-full col-span-2">
            <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="text-lg font-medium text-slate-700">Stories</h3>
                <p className="text-sm text-slate-500 mt-1">Moments worth remembering</p>
        
              </CardContent>
            </Card>
          </Link>



        </div>


        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Remember, taking care of your emotional health is a journey. We're here with you every step of the way.</p>
        </div>
      </div>
    </main>
  )
}
