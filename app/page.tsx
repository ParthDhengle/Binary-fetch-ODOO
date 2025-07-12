import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Recycle, Users, Star } from "lucide-react"
import { ItemCarousel } from "@/components/item-carousel"
import { CategoryGrid } from "@/components/category-grid"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sustainable Fashion Through
            <span className="text-primary block">Community Exchange</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Give your clothes a second life and discover unique pieces from your community. Swap, redeem with points,
            and make fashion sustainable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/browse">
                Start Swapping <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 bg-transparent">
              <Link href="/browse">Browse Items</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Recycle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
              <p className="text-gray-600">Reduce waste by giving clothes a second life through community exchange.</p>
            </CardContent>
          </Card>
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Connect with like-minded people who share your passion for sustainable fashion.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Star className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Point System</h3>
              <p className="text-gray-600">Earn points by listing items and redeem them for pieces you love.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Items Carousel */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Items</h2>
        <ItemCarousel />
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <CategoryGrid />
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Sustainable Fashion Journey?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of users making fashion more sustainable.</p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
            <Link href="/register">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
