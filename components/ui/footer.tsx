import Link from "next/link"
import { Home } from "lucide-react"
import { Button } from "./button"

export function Footer() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Link href="/">
        <Button 
          size="icon"
          className="h-10 w-10 rounded-full bg-black/80 hover:bg-black text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Home className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
