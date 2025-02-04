import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const carModels = [
  { name: "911", description: "O ícone esportivo", image: "/placeholder.svg?height=200&width=300" },
  { name: "Taycan", description: "O futuro elétrico", image: "/placeholder.svg?height=200&width=300" },
  { name: "Panamera", description: "Luxo e performance", image: "/placeholder.svg?height=200&width=300" },
  { name: "Cayenne", description: "SUV esportivo", image: "/placeholder.svg?height=200&width=300" },
  { name: "Macan", description: "Compacto e ágil", image: "/placeholder.svg?height=200&width=300" },
]

export default function ModelosPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">Nossos Modelos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {carModels.map((model) => (
          <Card key={model.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{model.name}</CardTitle>
              <CardDescription>{model.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <img 
                src={model.image || "/placeholder.svg"} 
                alt={model.name} 
                className="w-full h-48 object-cover mb-4 rounded-md"
              />
              <Button className="w-full mt-auto">Saiba Mais</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}