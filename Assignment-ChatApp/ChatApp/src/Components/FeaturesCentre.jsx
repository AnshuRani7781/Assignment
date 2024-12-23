/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { BsFileFont } from "react-icons/bs";
import { MdDeleteOutline, MdClose } from "react-icons/md";
import ColorPicker from "./ColorPicker"; // Assuming you have this component
import "./../styles/InboxHeader.css";

const FeaturesCenter = ({
  db,
  selectedChatRoom,
  setSelectedChatRoom,
  setTimeStampColor,
  handleFontChange,
  selectedFont,
  setSelectedFont,
  handleDeleteChat,
  handleToggle,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleIconClick = () => setIsDropdownVisible((prev) => !prev);

  // Close the centered div

  return (
    <>
      {
        <div
          className="features-center-container"
          style={{
            position: "fixed",
            top: "6%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000, // To ensure it's on  top
            width: "100%",
          }}
        >
          <div
            className="features"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Font Selector */}
            <div style={{ fontFamily: selectedFont }}>
              <div
                className="font-selector"
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "10px",
                }}
              >
                <label
                  htmlFor="font-dropdown"
                  onClick={handleIconClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <BsFileFont />
                </label>
                {isDropdownVisible && (
                  <select
                    id="font-dropdown"
                    className="font-dropdown"
                    value={selectedFont}
                    onChange={handleFontChange}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                )}
              </div>
            </div>

            {/* Color Picker */}
            <ColorPicker
              db={db}
              selectedChatRoom={selectedChatRoom}
              setSelectedChatRoom={setSelectedChatRoom}
              setTimeStampColor={setTimeStampColor}
            />

            {/* Delete Chat Icon */}
            <div
              onClick={handleDeleteChat}
              style={{ width: "40px", padding: "15px" }}
            >
              <span className="option-container">
                <MdDeleteOutline size={20} />
              </span>
            </div>

            {/* Close Icon */}
            <span className="option-container">
              <MdClose
                size={24}
                style={{ cursor: "pointer" }}
                onClick={handleToggle}
              />
            </span>
          </div>
        </div>
      }
    </>
  );
};

export default FeaturesCenter;
