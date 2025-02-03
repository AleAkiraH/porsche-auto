'use client'; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Car, Users, WrenchIcon, Search } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo à Porsche Auto Elétrico</h1>
          <p className="mt-2 text-gray-600">Sua oficina especializada em veículos Porsche</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">Novo Serviço</Button>
      </div>

      {/* Métricas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-primary-foreground/80">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Veículos Cadastrados</CardTitle>
            <Car className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-gray-500">+8% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Serviços Realizados</CardTitle>
            <WrenchIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">345</div>
            <p className="text-xs text-gray-500">+23% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Faturamento</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 123.456</div>
            <p className="text-xs text-gray-500">+15% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Serviços */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Serviços Disponíveis</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="rounded-full bg-primary/10 p-3 mr-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Cadastrar Cliente</h3>
                <p className="text-sm text-gray-600">Adicione um novo cliente</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="rounded-full bg-primary/10 p-3 mr-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Buscar Cliente</h3>
                <p className="text-sm text-gray-600">Localize informações de clientes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
            <CardContent className="flex items-center p-6">
              <div className="rounded-full bg-primary/10 p-3 mr-4">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Cadastrar Veículo</h3>
                <p className="text-sm text-gray-600">Registre um novo veículo</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contato */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="text-lg font-semibold">Precisa de ajuda?</h3>
            <p className="text-gray-600">Entre em contato via WhatsApp</p>
          </div>
          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={() => window.open("https://wa.me/5511943099908", "_blank")}
          >
            Contatar via WhatsApp
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

