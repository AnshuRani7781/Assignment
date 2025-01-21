/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import loadingImage from "./../assets/png-transparent-online-chat-conversation-icon-talk-s-text-speech-balloon-monochrome-thumbnail-removebg-preview.png";
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
        backgroundColor:
          chatMessages.length > 0
            ? selectedChatRoom?.color || "#ffffff" // Use selected chat room color if available, otherwise default to white
            : "#ffffff", // Default to white if there are no chat messages
        padding: "10px",
        borderRadius: "8px",
        fontFamily: selectedFont,
        color: selectedChatRoom?.textColor || "#000000",
        overflowY: "auto", // Add scrolling
        // Fixed height for the chat area
      }}
    >
      {chatMessages.length > 0 ? (
        chatMessages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.senderId === user.uid ? "sent" : "received"
            }`}
          >
            <p className="message-text">{message.text}</p>
            <span
              // className="message-time"
              className={`message-timestamp ${
                message.senderId === user.uid ? "sent" : "received"
              }`}
            >
              {new Date(message.timestamp?.toDate()).toLocaleTimeString()}
            </span>
          </div>
        ))
      ) : (
        <div
          style={{
            width: "100%",
            backgroundColor: "#FFFF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
            overflow: "hidden",
          }}
        >
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "0px",
              color: "gray",
              padding: "20px",
              textAlign: "center",
            }}
          >
            The chatroom is empty start the coversation
          </p>
          <img
            className="start-conversation"
            src={loadingImage}
            alt="start chat "
            width={300}
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
