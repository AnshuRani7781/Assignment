/* eslint-disable react/prop-types */
import { doc, updateDoc } from "firebase/firestore";
// colorUtils.js (getTextColor function)
const getTextColor = (backgroundColor) => {
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  return luminance > 186 ? "#000000" : "#FFFFFF";
};

const getUndertoneColor = (backgroundColor) => {
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance to determine lightness/darkness
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // If luminance is high (light background), return black with opacity
  if (luminance > 186) {
    return `rgba(0, 0, 0, 0.6)`; // Black with 30% opacity
  }

  // If luminance is low (dark background), return white with opacity
  return `rgba(255, 255, 255, 0.6)`; // White with 30% opacity
};

const ColorPicker = ({
  db,
  selectedChatRoom,
  setSelectedChatRoom,
  setTimeStampColor,
}) => {
  // Local state for timestamp undertone color

  const handleBackgroundColorChange = async (e) => {
    const newColor = e.target.value;

    // Calculate the text color based on the new background color
    const newTextColor = getTextColor(newColor);
    const newTimestampColor = getUndertoneColor(newColor); // Get the undertone color for timestamp

    // Update the timestamp color in the local state
    setTimeStampColor(newTimestampColor);

    try {
      const chatRoomRef = doc(db, "chatrooms", selectedChatRoom.id);
      // Update Firestore with both the background and text colors
      await updateDoc(chatRoomRef, {
        color: newColor, // Background color
        textColor: newTextColor, // Text color
      });
      // Update local state with both the background and text colors
      setSelectedChatRoom((prev) => ({
        ...prev,
        color: newColor,
        textColor: newTextColor,
      }));
    } catch (error) {
      console.error("Error updating background or text color:", error);
    }
  };

  return (
    <div className="color-picker" style={{}}>
      <label htmlFor="backgroundColorPicker">
        <box-icon
          type="solid"
          name="color"
          color={selectedChatRoom?.color || "#ffffff"}
        ></box-icon>
        <input
          type="color"
          id="backgroundColorPicker"
          value={selectedChatRoom?.color || "#ffffff"}
          onChange={handleBackgroundColorChange}
        />
      </label>
    </div>
  );
};
export default ColorPicker;
