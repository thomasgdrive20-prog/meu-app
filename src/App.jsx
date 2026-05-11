import Sidebar from "./components/navigation/Sidebar"

export default function App() {
  return (
    <div
      style={{
        display: "flex",
        background: "#0B0F19",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <Sidebar />

      <main style={{ padding: "40px", flex: 1 }}>
        <h1 style={{ fontSize: "48px", marginBottom: "30px" }}>
          Dashboard
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "#161B22",
              padding: "30px",
              borderRadius: "20px",
            }}
          >
            <p>Peso Atual</p>
            <h2>92kg</h2>
          </div>

          <div
            style={{
              background: "#161B22",
              padding: "30px",
              borderRadius: "20px",
            }}
          >
            <p>BF Estimado</p>
            <h2>18%</h2>
          </div>

          <div
            style={{
              background: "#161B22",
              padding: "30px",
              borderRadius: "20px",
            }}
          >
            <p>Treinos Semana</p>
            <h2>6x</h2>
          </div>
        </div>
      </main>
    </div>
  )
}