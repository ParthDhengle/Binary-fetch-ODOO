"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"
import { Package, Star, TrendingUp, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

interface Item {
  id: string
  title: string
  category: string
  condition: string
  imageUrl: string
  status: string
  createdAt: any
}


export default function DashboardPage() {
  const { user, userData, loading } = useAuth()
  const [userItems, setUserItems] = useState<Item[]>([])
  const [swapRequests, setSwapRequests] = useState<any[]>([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchSwapRequests = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "swaps"),
          where("toUser", "==", user.uid),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);
        const requests = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            requesterId: data.requesterId, // Ensure requesterId is present
            ...(data as { [key: string]: any }),
          };
        });

        // Enrich swap requests with requester's name
        const enrichedRequests = await Promise.all(
          requests.map(async (request) => {
            const requesterDoc = await getDoc(doc(db, "users", request.requesterId));
            const requesterData = requesterDoc.data();
            return {
              ...request,
              requesterName: requesterData?.name || "Unknown",
            };
          })
        );
        setSwapRequests(enrichedRequests);
      } catch (error) {
        console.error("Error fetching swap requests:", error);
      }
    };

    if (user) {
      fetchSwapRequests();
    }
  }, [user]);

  useEffect(() => {
    const fetchUserItems = async () => {
      if (!user) return

      try {
        const q = query(collection(db, "items"), where("uploaderId", "==", user.uid))
        const querySnapshot = await getDocs(q)
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[]
        setUserItems(items)
      } catch (error) {
        console.error("Error fetching user items:", error)
      } finally {
        setItemsLoading(false)
      }
    }

    if (user) {
      fetchUserItems()
    }
  }, [user])

  // Handle Accept button
  const handleAccept = async (request: any) => {
    try {
      // Update swap status to "accepted"
      await updateDoc(doc(db, "swaps", request.id), {
        status: "accepted",
      });

      // Update item status to "swapped" in Firestore and local state
      if (request.itemId) {
        await updateDoc(doc(db, "items", request.itemId), {  // Fixed from " wrinkleitems" to "items"
          status: "swapped",
        });
        setUserItems((prev) =>
          prev.map((item) =>
            item.id === request.itemId ? { ...item, status: "swapped" } : item
          )
        );
      }

      // Remove the request from the list
      setSwapRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (error) {
      console.error("Error accepting swap:", error);
    }
  };

  // Handle Decline button
  const handleDecline = async (request: any) => {
    try {
      // Update swap status to "declined"
      await updateDoc(doc(db, "swaps", request.id), {
        status: "declined",
      });

      // Remove the request from the list (no item status change needed)
      setSwapRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (error) {
      console.error("Error declining swap:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const availableItems = userItems.filter((item) => item.status === "available")
  const swappedItems = userItems.filter((item) => item.status === "swapped")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* User Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{userData?.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{userData?.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  <Star className="h-4 w-4 mr-1" />
                  {userData?.points || 0} Points
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Listed</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userItems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Swaps Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{swappedItems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData?.points || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Items Tabs */}
        <Tabs defaultValue="listings" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="listings">My Listings</TabsTrigger>
              <TabsTrigger value="swaps">My Swaps</TabsTrigger>
              <TabsTrigger value="requests">
                Swap Requests
                {swapRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {swapRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <Button asChild>
              <Link href="/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Item
              </Link>
            </Button>
          </div>

          <TabsContent value="listings" className="space-y-4">
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
            ) : availableItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableItems.map((item) => (
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
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge variant="outline">{item.condition}</Badge>
                      </div>
                      <Badge variant={item.status === "available" ? "default" : "secondary"} className="capitalize">
                        {item.status}
                      </Badge>
                      <div className="mt-4">
                        <Button asChild size="sm" className="w-full">
                          <Link href={`/item/${item.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items listed yet</h3>
                <p className="text-gray-600 mb-4">Start by uploading your first item to the community.</p>
                <Button asChild>
                  <Link href="/upload">Upload Your First Item</Link>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="swaps" className="space-y-4">
            {swappedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {swappedItems.map((item) => (
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
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge variant="outline">{item.condition}</Badge>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {item.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No swaps completed yet</h3>
                <p className="text-gray-600">Your completed swaps will appear here.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {swapRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {swapRequests.map((request) => {
                  const item = userItems.find((item) => item.id === request.itemId);
                  return (
                    <Card key={request.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="font-semibold">Swap Request from {request.requesterName}</p>
                          {item ? (
                            <>
                              <div className="aspect-square relative">
                                <Image
                                  src={item.imageUrl || "/placeholder.svg?height=300&width=300"}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <p>Item: {item.title}</p>
                            </>
                          ) : (
                            <p>Item not found</p>
                          )}
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handleAccept(request)}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDecline(request)}>
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending swap requests</h3>
                <p className="text-gray-600">Incoming swap requests will appear here.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}