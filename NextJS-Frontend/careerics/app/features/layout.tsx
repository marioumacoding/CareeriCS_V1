import Sidebar from "@/components/ui/sidebar";
import BG from "@/components/ui/folder"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ 
            display: "flex",
            height: "100vh",
            backgroundColor: "var(--bg-color)", 
            overflow: "hidden" }}>

          <Sidebar />

           <div style={{ flex: 1, padding: "2vh" }}>
               <BG>
               {children}
               </BG>
            </div>
            
        </div>
      </body>
    </html>
  );
}