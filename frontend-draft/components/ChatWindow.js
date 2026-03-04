// components/ChatWindow.js
export default function ChatWindow({ messages }) {
    return (
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "400px", overflowY: "scroll", background: "#f9f9f9" }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "12px",
                background: msg.role === "user" ? "#4caf50" : "#e0e0e0",
                color: msg.role === "user" ? "white" : "black",
                maxWidth: "80%",
              }}
            >
              {msg.text}
              {msg.audio && <audio controls src={msg.audio} style={{ display: "block", marginTop: "5px" }} />}
            </div>
          </div>
        ))}
      </div>
    );
  }
  