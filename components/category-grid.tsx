import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Shirt, Crown, Baby, Watch, Footprints, Briefcase } from "lucide-react"

const categories = [
  { name: "Men", icon: Shirt, href: "/browse?category=Men" },
  { name: "Women", icon: Crown, href: "/browse?category=Women" },
  { name: "Kids", icon: Baby, href: "/browse?category=Kids" },
  { name: "Accessories", icon: Watch, href: "/browse?category=Accessories" },
  { name: "Shoes", icon: Footprints, href: "/browse?category=Shoes" },
  { name: "Formal", icon: Briefcase, href: "/browse?category=Formal" },
]

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link key={category.name} href={category.href}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <category.icon className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold">{category.name}</h3>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
