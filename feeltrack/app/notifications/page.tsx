import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Bell } from "lucide-react"
import Link from "next/link"

const notifications = [
  {
    id: 1,
    title: "Morning Check-in",
    description: "Start your day with a moment of reflection",
    time: "8:00 AM",
    enabled: true,
  },
  {
    id: 2,
    title: "Midday Breathing",
    description: "Take a moment to breathe and center yourself",
    time: "12:30 PM",
    enabled: true,
  },
  {
    id: 3,
    title: "Evening Reflection",
    description: "Reflect on your day and prepare for tomorrow",
    time: "8:00 PM",
    enabled: true,
  },
  {
    id: 4,
    title: "Weekly Summary",
    description: "Review your emotional journey for the week",
    time: "Sunday, 6:00 PM",
    enabled: false,
  },
]

export default function NotificationsPage() {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-rose-50 to-blue-50 p-4 pb-20">
      <div className="flex items-center mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-rose-600">Reminders</h1>
      </div>

      <Card className="mb-6 border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-slate-700">Notification Settings</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">All Reminders</span>
              <Switch defaultChecked />
            </div>
          </div>
          <p className="text-slate-600 mb-4">Gentle nudges to help you stay mindful throughout your day.</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="border-none shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-rose-100 p-2 rounded-full mt-1">
                    <Bell className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-700">{notification.title}</h3>
                    <p className="text-sm text-slate-500">{notification.description}</p>
                    <p className="text-xs text-rose-500 mt-1">{notification.time}</p>
                  </div>
                </div>
                <Switch defaultChecked={notification.enabled} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button className="rounded-full bg-rose-500 hover:bg-rose-600 px-6">Add New Reminder</Button>
      </div>
    </main>
  )
}
