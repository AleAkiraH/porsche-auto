export const themeColors = {
  gradients: {
    background: "from-white via-gray-50 to-gray-100",
    blue: "from-sky-400 to-blue-500",
    green: "from-emerald-400 to-green-500",
    red: "from-rose-400 to-red-500"
  },
  effects: {
    glow: {
      blue: "shadow-sky-500/50",
      green: "shadow-emerald-500/50",
      red: "shadow-rose-500/50"
    },
    backgroundGlow: {
      blue: "from-blue-100/50 to-transparent",
      red: "from-red-100/50 to-transparent"
    }
  },
  buttons: {
    primary: "bg-red-500 hover:bg-red-600 text-white",
    secondary: "bg-gradient-to-r from-rose-400 to-red-500 text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200"
  },
  cards: {
    default: "bg-white hover:shadow-lg transition-shadow duration-200"
  }
}

export const layoutClasses = {
  pageWrapper: "min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden",
  backgroundEffects: "absolute inset-0 overflow-hidden pointer-events-none",
  container: "container mx-auto p-4 relative"
}
