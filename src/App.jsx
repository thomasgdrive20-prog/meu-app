import Sidebar from "./components/navigation/Sidebar"

export default function App() {
  return (
    <div className="flex bg-[#0B0F19] min-h-screen text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-5xl font-bold mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <p className="text-zinc-400 mb-2">
              Peso Atual
            </p>

            <h2 className="text-4xl font-bold">
              92kg
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <p className="text-zinc-400 mb-2">
              BF Estimado
            </p>

            <h2 className="text-4xl font-bold">
              18%
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <p className="text-zinc-400 mb-2">
              Treinos Semana
            </p>

            <h2 className="text-4xl font-bold">
              6x
            </h2>
          </div>
        </div>
      </main>
    </div>
  )
}