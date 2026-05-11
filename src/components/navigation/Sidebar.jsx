export default function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        background: "#111827",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          marginBottom: "40px",
        }}
      >
        Atlas Fitness
      </h1>

      <div style={{ marginBottom: "20px" }}>
        Dashboard
      </div>

      <div style={{ marginBottom: "20px" }}>
        Treinos
      </div>

      <div style={{ marginBottom: "20px" }}>
        Nutrição
      </div>

      <div>
        Progressão
      </div>
    </div>
  )
}