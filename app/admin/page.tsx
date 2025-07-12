"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Check, X, Trash2, Users, Package, AlertTriangle } from "lucide-react"

interface Item {
  id: string
  title: string
  description: string
  category: string
  condition: string
  imageUrl: string
  uploaderId: string
  approved: boolean
  status: string
  createdAt: any
}

interface User {
  id: string
  name: string
  email: string
  points: number
  role: string
}

export default function AdminPage() {
  const { user, userData, loading } = useAuth()
  const [pendingItems, setPendingItems] = useState<Item[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/")
    }
  }, [user, userData, loading, router])

  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        const q = query(collection(db, "items"), where("approved", "==", false))
        const querySnapshot = await getDocs(q)
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[]
        setPendingItems(items)
      } catch (error) {
        console.error("Error fetching pending items:", error)
      } finally {
        setItemsLoading(false)
      }
    }

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"))
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[]
        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setUsersLoading(false)
      }
    }

    if (user && userData?.role === "admin") {
      fetchPendingItems()
      fetchUsers()
    }
  }, [user, userData])

  const handleApproveItem = async (itemId: string) => {
    try {
      await updateDoc(doc(db, "items", itemId), {
        approved: true,
      })
      setPendingItems((prev) => prev.filter((item) => item.id !== itemId))
      toast({
        title: "Item approved",
        description: "The item is now visible to all users.",
      })
    } catch (error) {
      console.error("Error approving item:", error)
      toast({
        title: "Error",
        description: "Failed to approve item.",
        variant: "destructive",
      })
    }
  }

  const handleRejectItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, "items", itemId))
      setPendingItems((prev) => prev.filter((item) => item.id !== itemId))
      toast({
        title: "Item rejected",
        description: "The item has been removed.",
      })
    } catch (error) {
      console.error("Error rejecting item:", error)
      toast({
        title: "Error",
        description: "Failed to reject item.",
        variant: "destructive",
      })
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: "banned",
      })
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: "banned" } : user)))
      toast({
        title: "User banned",
        description: "The user has been banned from the platform.",
      })
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        title: "Error",
        description: "Failed to ban user.",
        variant: "destructive",
      })
    }
  }

  const handleResetPoints = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        points: 0,
      })
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, points: 0 } : user)))
      toast({
        title: "Points reset",
        description: "User points have been reset to 0.",
      })
    } catch (error) {
      console.error("Error resetting points:", error)
      toast({
        title: "Error",
        description: "Failed to reset points.",
        variant: "destructive",
      })
    }
  }

  if (loading || !user || userData?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items">
              <Package className="h-4 w-4 mr-2" />
              Pending Items ({pendingItems.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Manage Users ({users.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            {itemsLoading ? (
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
            ) : pendingItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
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
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge variant="outline">{item.condition}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleApproveItem(item.id)} size="sm" className="flex-1">
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectItem(item.id)}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending items</h3>
                <p className="text-gray-600">All items have been reviewed.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {usersLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-gray-600 text-sm">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{user.points} points</Badge>
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : user.role === "banned" ? "destructive" : "secondary"
                              }
                            >
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {user.role !== "banned" && user.role !== "admin" && (
                            <>
                              <Button onClick={() => handleResetPoints(user.id)} variant="outline" size="sm">
                                Reset Points
                              </Button>
                              <Button onClick={() => handleBanUser(user.id)} variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
