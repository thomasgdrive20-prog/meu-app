export default function Topbar() {
  return (
    <header className="h-20 border-b border-white/10 backdrop-blur-xl flex items-center justify-between px-6">
      <div>
        <h2 className="text-2xl font-bold">
          Dashboard
        </h2>

        <p className="text-zinc-400 text-sm">
          Bem-vindo ao Atlas Fitness
        </p>
      </div>

      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
    </header>
  )
}