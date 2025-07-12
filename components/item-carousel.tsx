"use client"

import { useEffect, useState } from "react"
import { collection, query, where, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

interface Item {
  id: string
  title: string
  category: string
  condition: string
  imageUrl: string
  status: string
}

export function ItemCarousel() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const q = query(
          collection(db, "items"),
          where("status", "==", "available"),
          where("approved", "==", true),
          limit(6),
        )
        const querySnapshot = await getDocs(q)
        const itemsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[]
        setItems(itemsData)
      } catch (error) {
        console.error("Error fetching items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedItems()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Link key={item.id} href={`/item/${item.id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-square relative">
              <Image
                src={item.imageUrl || "/placeholder.svg?height=300&width=300"}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{item.title}</h3>
              <div className="flex justify-between items-center">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge variant="outline">{item.condition}</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
