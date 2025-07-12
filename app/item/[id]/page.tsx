// app/item/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, addDoc, updateDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { ArrowLeft, MessageCircle, Star } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Item {
  id: string
  title: string
  description: string
  category: string
  condition: string
  size: string
  imageUrl: string
  status: string
  tags: string[]
  uploaderId: string
  createdAt: any
}

interface UploaderData {
  name: string
  points: number
}

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const [item, setItem] = useState<Item | null>(null)
  const [uploaderData, setUploaderData] = useState<UploaderData | null>(null)
  const [userItems, setUserItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  useEffect(() => {
    const fetchItemAndUserItems = async () => {
      if (!params.id) return

      try {
        // Fetch item details
        const itemDoc = await getDoc(doc(db, "items", params.id as string))
        if (itemDoc.exists()) {
          const itemData = { id: itemDoc.id, ...itemDoc.data() } as Item
          setItem(itemData)

          // Fetch uploader data
          const uploaderDoc = await getDoc(doc(db, "users", itemData.uploaderId))
          if (uploaderDoc.exists()) {
            setUploaderData(uploaderDoc.data() as UploaderData)
          }

          // Fetch user's available items if they can interact
          if (user && user.uid !== itemData.uploaderId) {
            const q = query(
              collection(db, "items"),
              where("uploaderId", "==", user.uid),
              where("status", "==", "available")
            )
            const querySnapshot = await getDocs(q)
            const items = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Item[]
            setUserItems(items)
          }
        } else {
          router.push("/browse")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        router.push("/browse")
      } finally {
        setLoading(false)
      }
    }

    fetchItemAndUserItems()
  }, [params.id, router, user])

  const handleRequestSwap = async (offeredItemId: string) => {
    if (!user || !item) return

    setRequesting(true)
    try {
      await addDoc(collection(db, "swaps"), {
        itemId: item.id,
        requesterId: user.uid,
        toUser: item.uploaderId,
        offeredItemId, // Include the offered item
        status: "pending",
        createdAt: new Date(),
      })

      toast({
        title: "Swap request sent!",
        description: "The owner will be notified of your request.",
      })
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error requesting swap:", error)
      toast({
        title: "Request failed",
        description: "There was an error sending your swap request.",
        variant: "destructive",
      })
    } finally {
      setRequesting(false)
    }
  }

  const handleRedeemWithPoints = async () => {
  if (!user || !item) return;

  setRequesting(true);
  try {
    const idToken = await user.getIdToken();
    const response = await fetch('/api/redeem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId: item.id, userId: user.uid, idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Redemption failed');
    }

    toast({
      title: "Item redeemed!",
      description: "The item has been redeemed with your points.",
    });
    router.push("/dashboard");
  } catch (error) {
    console.error("Error redeeming item:", error);
    toast({
      title: "Redemption failed",
      description: (error instanceof Error ? error.message : "There was an error redeeming the item."),
      variant: "destructive",
    });
  } finally {
    setRequesting(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) return null

  const isOwner = user?.uid === item.uploaderId
  const canInteract = user && !isOwner && item.status === "available"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden">
              <Image
                src={item.imageUrl || "/placeholder.svg?height=600&width=600"}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="text-sm">{item.category}</Badge>
              <Badge variant="outline" className="text-sm">{item.condition}</Badge>
              <Badge variant="outline" className="text-sm">Size: {item.size}</Badge>
              <Badge variant={item.status === "available" ? "default" : "secondary"} className="text-sm capitalize">
                {item.status}
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{item.description}</p>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{uploaderData?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{uploaderData?.name || "Anonymous"}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-1" />
                      {uploaderData?.points || 0} points
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {canInteract && (
              <div className="space-y-3">
                <Button onClick={() => setIsModalOpen(true)} disabled={requesting} className="w-full" size="lg">
                  Request Swap
                  <MessageCircle className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  onClick={handleRedeemWithPoints}
                  disabled={requesting}
                  variant="outline"
                  className="w-full bg-transparent"
                  size="lg"
                >
                  {requesting ? "Redeeming..." : "Redeem with Points (50)"}
                  <Star className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {isOwner && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">This is your item</p>
                <p className="text-blue-600 text-sm">You can manage it from your dashboard.</p>
              </div>
            )}

            {!user && (
              <Button asChild className="w-full" size="lg">
                <Link href="/login">Login to Request Swap</Link>
              </Button>
            )}
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select an Item to Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {userItems.length > 0 ? (
                userItems.map((userItem) => (
                  <div key={userItem.id} className="flex items-center space-x-4">
                    <Image
                      src={userItem.imageUrl || "/placeholder.svg?height=100&width=100"}
                      alt={userItem.title}
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                    <div>
                      <p className="font-semibold">{userItem.title}</p>
                      <p className="text-sm text-gray-600">{userItem.category}</p>
                    </div>
                    <Button
                      variant={selectedItemId === userItem.id ? "default" : "outline"}
                      onClick={() => setSelectedItemId(userItem.id)}
                    >
                      {selectedItemId === userItem.id ? "Selected" : "Select"}
                    </Button>
                  </div>
                ))
              ) : (
                <div>
                  <p>You have no available items to offer.</p>
                  <Button asChild variant="link">
                    <Link href="/upload">Upload an Item</Link>
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (selectedItemId) {
                    handleRequestSwap(selectedItemId)
                  } else {
                    toast({
                      title: "No item selected",
                      description: "Please select an item to offer.",
                      variant: "destructive",
                    })
                  }
                }}
                disabled={!selectedItemId || requesting}
              >
                {requesting ? "Sending..." : "Confirm Swap Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}