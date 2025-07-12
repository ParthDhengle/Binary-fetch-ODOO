"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Upload, ImageIcon } from "lucide-react"

const categories = ["Men", "Women", "Kids", "Accessories", "Shoes", "Formal"]
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"]
const conditions = ["New", "Like New", "Good", "Fair", "Poor"]

export default function UploadPage() {
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    size: "",
    condition: "",
    tags: "",
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !image) return

    setUploading(true)

    try {
      const imageUrl = await uploadToCloudinary(image)
      if (!imageUrl || typeof imageUrl !== "string") {
        throw new Error("Failed to upload image to Cloudinary")
      }
      await addDoc(collection(db, "items"), {
        ...formData,
        imageUrl,
        uploaderId: user.uid,
        status: "available",
        approved: false,
        createdAt: new Date(),
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      })

      toast({
        title: "Item uploaded successfully!",
        description: "Your item is pending approval and will be visible soon.",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error uploading item:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Upload New Item</h1>
          <p className="text-gray-600 mb-8">Your item will be reviewed and approved by an admin before it’s listed.</p>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Image Upload */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Item Photo</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg object-cover"
                    />
                    <div className="flex justify-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image")?.click()}
                      >
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          setImage(null)
                          setImagePreview("")
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <Label htmlFor="image" className="cursor-pointer">
                        <div className="text-sm text-gray-600">Click to upload or drag and drop</div>
                        <div className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</div>
                      </Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Item Details */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Item Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Blue Denim Jacket"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select onValueChange={(value) => handleInputChange("category", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Size</Label>
                    <Select onValueChange={(value) => handleInputChange("size", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Condition</Label>
                  <Select onValueChange={(value) => handleInputChange("condition", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., casual, vintage, summer"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
            <Button type="button" disabled={uploading} size="lg" onClick={handleSubmit}>
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Item
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}