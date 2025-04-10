"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Mock data for plants
const plantTypes = [
  { name: "Daisy", color: "#FFD166", emoji: "🌼" },
  { name: "Rose", color: "#EF476F", emoji: "🌹" },
  { name: "Tulip", color: "#06D6A0", emoji: "🌷" },
  { name: "Sunflower", color: "#F9C74F", emoji: "🌻" },
]
const Growthreason = [
  "I woke up early today",
  "I had a good night sleep last night",
  "My friends said I did well in school today",
  "I smiled at a stranger today",
  "I worked out today",
  "I had a a good meal today"
]

type Plant = {
  id: number
  type: (typeof plantTypes)[number]
  x: number
  y: number
  size: number
  growthStage: number
}

export default function GardenPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [showNewPlant, setShowNewPlant] = useState(false)

  // Generate initial garden on first render
  useEffect(() => {
    const initialPlants: Plant[] = []

    // Create 5-8 random plants
    const plantCount = Math.floor(Math.random() * 4) + 5

    for (let i = 0; i < plantCount; i++) {
      initialPlants.push({
        id: i,
        type: plantTypes[Math.floor(Math.random() * plantTypes.length)],
        x: Math.random() * 80 + 10, // 10-90% of width
        y: Math.random() * 70 + 15, // 15-85% of height
        size: Math.random() * 0.5 + 0.8, // 0.8-1.3 size multiplier
        growthStage: Math.floor(Math.random() * 3) + 1, // 1-3 growth stage
      })
    }

    setPlants(initialPlants)
  }, [])

  const addNewPlant = () => {
    setShowNewPlant(true)

    // After animation, add the plant permanently
    setTimeout(() => {
      const newPlant: Plant = {
        id: plants.length,
        type: plantTypes[Math.floor(Math.random() * plantTypes.length)],
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 15,
        size: 0.8,
        growthStage: 1,
      }

      setPlants([...plants, newPlant])
      setShowNewPlant(false)
    }, 2000)
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 pb-20">
      <div className="flex items-center mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-rose-600">Your Garden</h1>
      </div>

      <Card className="mb-6 border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <h2 className="text-xl font-medium text-center text-slate-700 mb-2">Your Emotional Garden</h2>
          <p className="text-slate-600 text-center mb-4">
            Each check-in plants a new flower. Watch your garden grow as you nurture your emotional health.
          </p>
        </CardContent>
      </Card>

      <div className="flex-1 relative bg-gradient-to-b from-green-100 to-green-200 rounded-xl shadow-inner overflow-hidden mb-6">
        {/* Sky */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-blue-200 to-transparent"></div>

        {/* Sun */}
        <div className="absolute top-5 right-8 w-12 h-12 rounded-full bg-yellow-300 shadow-lg"></div>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-green-700/30 to-transparent"></div>

        {/* Plants */}
        {plants.map((plant) => (
          <motion.div
            key={plant.id}
            className="absolute"
            style={{
              left: `${plant.x}%`,
              bottom: `${plant.y - 10}%`,
              transform: `scale(${plant.size})`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: plant.size }}
            transition={{ duration: 0.5 }}
          >
           <div className="flex flex-col items-center">
      <div className="relative group flex flex-col items-center">
        <div className="text-4xl">{plant.type.emoji}</div>
        <div   className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-white bg-green-600 px-6 py-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          {Growthreason[Math.floor(Math.random() * Growthreason.length)]}
        </div>
        </div>
              <div className="w-1 bg-green-700" style={{ height: `${plant.growthStage * 15}px` }}></div>
            </div>
          </motion.div>
        ))}

        {/* New plant animation */}
        {showNewPlant && (
          <motion.div
            className="absolute left-1/2 bottom-1/2 text-4xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1, y: 50 }}
            transition={{ duration: 1.5 }}
          >
            {plantTypes[Math.floor(Math.random() * plantTypes.length)].emoji}
          </motion.div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={addNewPlant}
          className="rounded-full bg-rose-500 hover:bg-rose-600 px-8 py-6 h-auto text-lg shadow-md transition-all duration-300 hover:shadow-lg"
        >
          Plant New Flower
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-slate-600">
        <p>You have {plants.length} plants in your garden. Keep checking in to see it flourish!</p>
      </div>
    </main>
  )
}
