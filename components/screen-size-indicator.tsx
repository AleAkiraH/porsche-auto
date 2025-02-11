"use client"

export function ScreenSizeIndicator() {
  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-1 right-1 z-50 flex items-center justify-center rounded-full bg-gray-800 px-3 py-1 text-xs font-mono text-white">
      <div className="block xs:hidden">xs (&lt;320px)</div>
      <div className="hidden xs:block sm:hidden">sm (320px)</div>
      <div className="hidden sm:block md:hidden">md (375px)</div>
      <div className="hidden md:block lg:hidden">lg (768px)</div>
      <div className="hidden lg:block xl:hidden">xl (1024px)</div>
      <div className="hidden xl:block 2xl:hidden">2xl (1280px)</div>
      <div className="hidden 2xl:block">3xl (1536px+)</div>
    </div>
  )
}
