import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--bg-color)", overflow: "hidden" }}>
          <Sidebar />
          <main style={{ flex: 1, marginTop: "2vh", marginBottom: "2vh", marginRight: "2vw", borderRadius: "40px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            
            {/* Just call it. No props needed! */}
            <Header /> 

            <div style={{ flex: 1, padding: "20px 40px", overflowY: "auto" }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}