import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ 
            display: "flex",
            height: "100vh",
            backgroundColor: "var(--bg-color)", // Black Background
            overflow: "hidden" }}>
          
          <Sidebar />

          {/* MAIN stays transparent so the black background shows behind the header shapes */}
          <main style={{ 
            flex: 1, 
            marginTop: "2vh", 
            marginBottom: "2vh", 
            marginRight: "2vw", 
            display: "flex",
            flexDirection: "column", 
            overflow: "hidden" 
          }}>
            
            {/* 1. Header sits directly on the black background */}
            <Header /> 

            {/* 2. The GREY RECTANGLE starts here */}
            <div style={{ 
              flex: 1, 
              backgroundColor: "var(--bg-grey)", 
              borderBottomLeftRadius: "40px", 
              borderBottomRightRadius: "40px",
              borderTopRightRadius: "40px", 
              padding: "40px", 
              overflowY: "auto",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.5)" 
            }}>
              {children}
            </div>
          </main>

        </div>
      </body>
    </html>
  );
}