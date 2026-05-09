import MainLayout from "../layouts/MainLayout"

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-zinc-400 mb-2">
            Peso Atual
          </h3>

          <p className="text-4xl font-bold">
            92kg
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-zinc-400 mb-2">
            BF Estimado
          </h3>

          <p className="text-4xl font-bold">
            18%
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-zinc-400 mb-2">
            Treinos Semana
          </h3>

          <p className="text-4xl font-bold">
            6x
          </p>
        </div>
      </div>
    </MainLayout>
  )
}