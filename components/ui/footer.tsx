import Link from "next/link"
import { Home } from "lucide-react"
import { Button } from "./button"

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
      <div className="container flex justify-center">
        <Link href="/">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="h-5 w-5 mr-2" />
            Início
          </Button>
        </Link>
      </div>
    </footer>
  )
}
