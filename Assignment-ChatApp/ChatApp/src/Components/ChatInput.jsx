/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

import "./../styles/InboxHeader.css";

const ChatInput = ({
  selectedMember,
  newMessage,
  setNewMessage,
  sendMessage,
  handleInputChange,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  // Close emoji picker on clicking outside
  const handleClickOutside = (event) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target) &&
      event.target.closest(".emoji-picker-button") === null // Ensure the button is excluded
    ) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Add emoji to message
  const handleEmojiClick = (emoji) => {
    setNewMessage((prevMessage) => prevMessage + emoji.emoji);
  };

  if (selectedMember === null) return null;

  return (
    <div className="chat-input" style={{ position: "relative" }}>
      {/* Emoji Picker Toggle Button */}
      <button
        data-tooltip-id="emoji-tooltip"
        data-tooltip-content="Select Emoji"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="option-container emoji-picker-button"
        style={{
          marginRight: "10px",
          backgroundColor: "transparent",
          border: "none",
        }}
      >
        <box-icon name="happy" size="md"></box-icon>
      </button>

      {/* Emoji Picker Component */}
      {showEmojiPicker && (
        <div
          className="emoji-picker"
          ref={emojiPickerRef}
          style={{
            position: "absolute",
            bottom: "50px",
            left: "10px",
            zIndex: 100,
            background: "white",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            height: "400px",
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            style={{
              width: "100%", // Responsive width
              height: "100%", // Responsive height
            }}
          />
        </div>
      )}

      {/* Message Input Field */}
      <input
        className="input-field"
        type="text"
        placeholder="Enter your message here..."
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value); // Update the message state
          handleInputChange(); // Trigger typing status logic
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage(); // Send message on Enter key
        }}
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginRight: "10px",
        }}
      />

      {/* Send Button */}
      <button
        data-tooltip-id="send-tooltip"
        data-tooltip-content={
          !newMessage ? "Can't send an empty message" : "Send Message"
        }
        onClick={sendMessage}
        disabled={!newMessage}
        style={{
          backgroundColor: "transparent",
          border: "none",
          cursor: newMessage ? "pointer" : "not-allowed",
        }}
      >
        <box-icon
          name="send"
          size="md"
          color={newMessage ? "#ff4d4d" : "#ccc"} // Change color when disabled
          style={{
            cursor: "inherit", // Ensures it inherits cursor from parent (button)
          }}
        ></box-icon>
      </button>
      <ReactTooltip
        id="send-tooltip"
        place="bottom"
        effect="solid"
        type="dark"
      />
      <ReactTooltip id="emoji-tooltip" place="top" effect="solid" type="info" />
    </div>
  );
};

export default ChatInput;
