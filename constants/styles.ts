
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
    primary: "bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200",
    secondary: "bg-gradient-to-r from-rose-400 to-red-500 text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200"
  },
  cards: {
    default: "bg-white hover:shadow-lg transition-shadow duration-200"
  }
}

export const layoutClasses = {
  pageWrapper: "min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden",
  backgroundEffects: `
    absolute inset-0 overflow-hidden
    before:absolute before:-top-1/2 before:-right-1/2 before:w-[800px] before:h-[800px] 
    before:rounded-full before:bg-gradient-to-br before:from-blue-100/50 before:to-transparent before:blur-3xl
    after:absolute after:-bottom-1/2 after:-left-1/2 after:w-[800px] after:h-[800px] 
    after:rounded-full after:bg-gradient-to-tr after:from-red-100/50 after:to-transparent after:blur-3xl
  `,
  container: "container relative mx-auto p-4 sm:p-6"
}
