/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";

const ChatMessages = ({
  selectedChatRoom,
  chatMessages,
  user,
  selectedFont,
  timeStampColor,
}) => {
  const chatContainerRef = useRef(null);

  // Scroll to the bottom of the chat container when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]); // Dependency on chatMessages ensures it scrolls on updates

  return (
    <div
      className="chat-messages scrollable"
      ref={chatContainerRef} // Attach the ref to the container
      style={{
        backgroundColor: selectedChatRoom?.color || "#ffffff", // Default white
        padding: "10px",
        borderRadius: "8px",
        fontFamily: selectedFont,
        color: selectedChatRoom?.textColor || "#000000",
        overflowY: "auto", // Add scrolling
        // Fixed height for the chat area
      }}
    >
      {chatMessages.map((message, index) => (
        <div
          key={index}
          className={`message ${
            message.senderId === user.uid ? "sent" : "received"
          }`}
        >
          <p className="message-text">{message.text}</p>
          <span
            className="message-time"
            style={{
              color: message.senderId === user.id ? "#000000" : "#ffffff",
            }}
          >
            {new Date(message.timestamp?.toDate()).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
