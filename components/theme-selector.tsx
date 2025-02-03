"use client"

import { Button } from "@/components/ui/button"
import { Paintbrush } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const themes = [
  {
    name: "Azul",
    primary: "bg-[#3b82f6]",
    secondary: "bg-[#dbeafe]",
    class: "theme-blue",
  },
  {
    name: "Verde",
    primary: "bg-[#22c55e]",
    secondary: "bg-[#dcfce7]",
    class: "theme-green",
  },
  {
    name: "Roxo",
    primary: "bg-[#8b5cf6]",
    secondary: "bg-[#ede9fe]",
    class: "theme-purple",
  },
  {
    name: "Vermelho",
    primary: "bg-[#ef4444]",
    secondary: "bg-[#fee2e2]",
    class: "theme-red",
  },
]

export function ThemeSelector() {
  const setTheme = (themeClass: string) => {
    document.documentElement.className = themeClass
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Paintbrush className="h-4 w-4" />
          <span className="sr-only">Alterar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem key={theme.name} onClick={() => setTheme(theme.class)}>
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded ${theme.primary}`} />
              <div className={`h-4 w-4 rounded ${theme.secondary}`} />
              <span>{theme.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

