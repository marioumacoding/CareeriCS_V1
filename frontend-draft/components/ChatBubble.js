export default function ChatBubble({ message, sender }) {
    return (
      <div className={`chat-bubble ${sender}`}>
        {message}
      </div>
    );
  }
  