// app/add-points/page.tsx
"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"

export default function AddPointsPage() {
  const { user, userData } = useAuth()
  const [pointsToAdd, setPointsToAdd] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddPoints = async () => {
    if (!user || pointsToAdd <= 0) return
    setLoading(true)
    try {
      // Placeholder for payment processing (e.g., Stripe integration)
      // In a real app, integrate with a payment gateway here
      const newPoints = (userData?.points || 0) + pointsToAdd
      await updateDoc(doc(db, "users", user.uid), { points: newPoints })
      toast({
        title: "Points added",
        description: `Successfully added ${pointsToAdd} points.`,
      })
    } catch (error) {
      console.error("Error adding points:", error)
      toast({
        title: "Failed to add points",
        description: "There was an error adding points.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Add Points</h1>
        <div className="space-y-4 max-w-md">
          <Input
            type="number"
            value={pointsToAdd}
            onChange={(e) => setPointsToAdd(Number(e.target.value))}
            placeholder="Enter points to add"
            min="1"
          />
          <p className="text-sm text-gray-600">
            Note: Payment integration is not implemented. This is a placeholder.
          </p>
          <Button onClick={handleAddPoints} disabled={loading || pointsToAdd <= 0}>
            {loading ? "Processing..." : "Add Points"}
          </Button>
        </div>
      </div>
    </div>
  )
}