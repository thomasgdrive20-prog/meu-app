export default function Sidebar() {
  return (
    <aside className="w-72 bg-white/5 border-r border-white/10 backdrop-blur-xl p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-10">
        Atlas Fitness
      </h1>

      <nav className="flex flex-col gap-3">
        <button className="bg-blue-600 hover:bg-blue-500 transition-all p-4 rounded-2xl text-left">
          Dashboard
        </button>

        <button className="hover:bg-white/10 transition-all p-4 rounded-2xl text-left">
          Treinos
        </button>

        <button className="hover:bg-white/10 transition-all p-4 rounded-2xl text-left">
          Nutrição
        </button>

        <button className="hover:bg-white/10 transition-all p-4 rounded-2xl text-left">
          Progressão
        </button>
      </nav>
    </aside>
  )
}