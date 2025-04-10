"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendItem } from "@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Mock data for the weekly mood chart
const weeklyMoodData = [
  { day: "Mon", value: 3, mood: "Neutral" },
  { day: "Tue", value: 2, mood: "Sad" },
  { day: "Wed", value: 4, mood: "Happy" },
  { day: "Thu", value: 3, mood: "Neutral" },
  { day: "Fri", value: 5, mood: "Very Happy" },
  { day: "Sat", value: 4, mood: "Happy" },
  { day: "Sun", value: 4, mood: "Happy" },
]

// Mock data for the emotion distribution
const emotionData = [
  { name: "Happy", value: 3, color: "#FFD166" },
  { name: "Calm", value: 2, color: "#06D6A0" },
  { name: "Neutral", value: 1, color: "#118AB2" },
  { name: "Sad", value: 1, color: "#073B4C" },
]

export default function WeeklyWrapPage() {
  // Calculate most frequent emotion
  const mostFrequentEmotion = emotionData.reduce((prev, current) => (prev.value > current.value ? prev : current))

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-rose-50 to-blue-50 p-4 pb-20">
      <div className="flex items-center mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-rose-600">Weekly Wrap</h1>
      </div>

      <Card className="mb-6 border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <h2 className="text-xl font-medium text-center text-slate-700 mb-4">Your Mood This Week</h2>
          <div className="h-64 w-full">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyMoodData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F9A8D4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F9A8D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6B7280" }} tickLine={false} />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    tickLine={false}
                    tickFormatter={(value) => {
                      const labels = ["Very Sad", "Sad", "Neutral", "Happy", "Very Happy"]
                      return labels[value - 1]
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="bg-white/90 backdrop-blur-sm border-none shadow-lg"
                        items={[
                          {
                            label: "Mood",
                            value: (data) => data.mood,
                            color: "#F9A8D4",
                          },
                        ]}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#F472B6"
                    fillOpacity={1}
                    fill="url(#colorMood)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-center text-slate-700 mb-4">Emotion Distribution</h2>
            <div className="h-48 w-full">
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emotionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {emotionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="bg-white/90 backdrop-blur-sm border-none shadow-lg"
                          items={[
                            {
                              label: "Emotion",
                              value: (data) => data.name,
                            },
                            {
                              label: "Count",
                              value: (data) => data.value,
                            },
                          ]}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <ChartLegend className="mt-2">
              {emotionData.map((item, index) => (
                <ChartLegendItem key={index} label={item.name} color={item.color} />
              ))}
            </ChartLegend>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-center text-slate-700 mb-2">Weekly Insights</h2>
            <div className="space-y-4">
              <div className="p-3 bg-rose-100 rounded-lg">
                <p className="text-sm font-medium text-rose-700">Most frequent emotion</p>
                <p className="text-lg">
                  {mostFrequentEmotion.name} ({mostFrequentEmotion.value} times)
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <p className="text-sm font-medium text-blue-700">Total check-ins</p>
                <p className="text-lg">7 days completed</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <p className="text-sm font-medium text-green-700">Quote of the week</p>
                <p className="text-sm italic">"Self-care is how you take your power back."</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6 text-center">
          <h2 className="text-lg font-medium text-slate-700 mb-2">Your Wellness Journey</h2>
          <p className="text-slate-600 mb-4">
            You're making great progress! Remember that emotional awareness is the first step toward wellbeing.
          </p>
          <Button className="rounded-full bg-rose-500 hover:bg-rose-600 px-6">Download Summary</Button>
        </CardContent>
      </Card>
    </main>
  )
}
