import Sidebar from "../components/navigation/Sidebar"
import Topbar from "../components/navigation/Topbar"

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}