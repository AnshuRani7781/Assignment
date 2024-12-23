/* eslint-disable react/prop-types */
import { useState } from "react";
import { BsFileFont } from "react-icons/bs";
import "./../styles/InboxHeader.css";
const FontSelector = ({ fonts = [], onFontChange }) => {
  const [selectedFont, setSelectedFont] = useState(fonts[0] || "Arial");
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const handleFontChange = (event) => {
    const newFont = event.target.value;
    setSelectedFont(newFont);
    if (onFontChange) {
      onFontChange(newFont); // Callback for parent component
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  return (
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
          className="option-container"
          htmlFor="font-dropdown"
          onClick={toggleDropdown}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <BsFileFont size={20} />
        </label>
        {isDropdownVisible && (
          <select
            id="font-dropdown"
            className="font-dropdown"
            value={selectedFont}
            onChange={handleFontChange}
            style={{
              marginLeft: "10px",
              padding: "5px",
              fontFamily: selectedFont,
            }}
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default FontSelector;
