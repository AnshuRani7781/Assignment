import "./../styles/InboxHeader.css"; // Import your CSS for styling
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import "boxicons";
import { useSelector, useDispatch } from "react-redux";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import { app } from "../firebaseConfig";
import { setTeamMembers } from "./../store/teamMembersSlice";
// import EmojiPicker from "emoji-picker-react";
import loadingGif from "./../assets/a28a042da0a1ea728e75d8634da98a4e.gif";
import loadingImage from "./../assets/talking-1988-ezgif.com-gif-to-webm-converter.webm";
import { useNavigate } from "react-router-dom";
import { BsFileFont } from "react-icons/bs";
import { IoIosOptions } from "react-icons/io";

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import SignOut from "./SignOut";
import ColorPicker from "./ColorPicker";
import { MdArrowBackIosNew } from "react-icons/md";
import { MdDeleteOutline, MdClose } from "react-icons/md";
import { toast } from "react-toastify";

const DashBoard = () => {
  const db = getFirestore(app);
  const user = useSelector((state) => state.auth.user);
  const teamMembers = useSelector((state) => state.teamMembers.teamMembers);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [recentChats, setRecentChats] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const [sidebarActive, setSidebarActive] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [timeStampColor, setTimeStampColor] = useState(" #718096");
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  // Handle sidebar state on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarActive(false); // Reset sidebar state on larger screens
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  //set user active on refresh event
  useEffect(() => {
    const setUserActive = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { status: "active" }, { merge: true });
        //console.log("User status set to active.");
      } catch (error) {
        toast.error(error);
      }
    };
    // Set user to active on component mount
    setUserActive();
    // Optional cleanup logic for component unmount
    return () => {
      // Handle unmount behavior here if needed
    };
  }, [user, db]);
  //set user inactive in tab close
  const setUserInactive = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { status: "inactive" }, { merge: true });
      //   console.log("User status set to inactive on tab close.");
    } catch (error) {
      toast.error(error);
      //  console.error("Error setting user status to inactive:", error);
    }
  };
  // Handle tab close or navigation away from the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      setUserInactive(); // Mark user as inactive in Firestore
    };
    // Attach the event listener
    window.addEventListener("beforeunload", handleBeforeUnload);
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, db]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  //to update in database which user is typing  in the chat window
  const handleTyping = async (isTyping) => {
    if (!selectedChatRoom) return;
    try {
      const chatRoomRef = doc(db, "chatrooms", selectedChatRoom.id);
      await updateDoc(chatRoomRef, {
        [`typing.${user.uid}`]: isTyping,
      });
    } catch (error) {
      toast.error(error.message);
      //  console.error("Error updating typing status:", error);
    }
  };
  // to make sure typing status is updated properly
  const handleInputChange = () => {
    //   setMessage(e.target.value); // Assume `setMessage` updates the input value state
    // Notify Firestore that the user is typing
    if (!isTyping) {
      setIsTyping(true);
      handleTyping(true);
    }
    // Stop typing after 3 seconds of inactivity
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      setIsTyping(false);
      handleTyping(false);
    }, 3000);
    setTypingTimeout(timeout);
  };
  // Handle typing timeout event when typing is disabled
  useEffect(() => {
    if (!selectedChatRoom) return;
    const chatRoomRef = doc(db, "chatrooms", selectedChatRoom.id);
    const unsubscribe = onSnapshot(chatRoomRef, (snapshot) => {
      const data = snapshot.data();
      if (data?.typing) {
        const typingUsers = Object.entries(data.typing)
          .filter(([uid, isTyping]) => isTyping && uid !== user.uid)
          .map(([uid]) => uid);
        setTypingUsers(typingUsers); // Assume this is a state to store typing users
      }
    });

    return () => unsubscribe();
  }, [selectedChatRoom, user, db]);
  // Function to fetch delete chats from Firestore
  const handleDeleteChat = async () => {
    if (selectedChatRoom) {
      try {
        const chatRoomRef = doc(db, "chatrooms", selectedChatRoom.id);
        // Delete all messages in the chat room
        const messagesRef = collection(chatRoomRef, "messages");
        const messagesSnapshot = await getDocs(messagesRef);
        messagesSnapshot.forEach(async (messageDoc) => {
          await deleteDoc(doc(messagesRef, messageDoc.id)); // Delete each message
        });
        // Finally, delete the chat room itself
        await deleteDoc(chatRoomRef);
        // Update state to remove the deleted chat room
        setRecentChats((prevChats) =>
          prevChats.filter((chat) => chat.uid !== selectedChatRoom.uid)
        );
        setChatMessages([]);
        setSelectedChatRoom(null); // Clear selected chat room after deletion
      } catch (error) {
        console.error("Error deleting chat:", error);
        setError("Failed to delete chat");
      }
    }
  };
  // function to handle the toggle of the options menu
  const handleIconClick = () => {
    setDropdownVisible((prev) => !prev);
  };
  // Function to handle the toggle of the font list and also the font change
  const handleFontChange = async (e) => {
    const newFont = e.target.value;
    setDropdownVisible(false);

    try {
      const chatRoomRef = doc(db, "chatrooms", selectedChatRoom.id);
      await updateDoc(chatRoomRef, { font: newFont });
      setSelectedChatRoom((prev) => ({
        ...prev,
        font: newFont,
      }));
    } catch (error) {
      // console.error("Error updating chatroom font:", error);
      toast.error(error.message);
      alert("Failed to update font. Please try again.");
    }
  };
  // to navigate to home page when user is not logged in
  useEffect(() => {
    // Ensure user is authenticated
    if (!user) {
      navigate("/");
      return;
    }

    // Create a custom history state
    const dashboardState = { page: "dashboard" };
    window.history.replaceState(dashboardState, "");

    // Handler for back button
    const handleBackNavigation = (event) => {
      // Prevent default back navigation
      event.preventDefault();

      // If somehow back is pressed, go to a specific route
      setUserInactive();
      navigate("/");
      sessionStorage.clear();
    };

    // Add event listeners
    window.addEventListener("popstate", handleBackNavigation);

    // Modify browser history to prevent back navigation
    const blockBack = () => {
      window.history.pushState(dashboardState, "", window.location.href);
    };

    // Additional listeners to ensure back is blocked
    window.addEventListener("popstate", blockBack);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handleBackNavigation);
      window.removeEventListener("popstate", blockBack);
    };
  }, [navigate, user]);

  // Function to handle font change from the database to the app using state
  useEffect(() => {
    if (selectedChatRoom?.id) {
      const chatRoomRef = doc(db, "chatrooms", selectedChatRoom.id);

      const unsubscribe = onSnapshot(chatRoomRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const chatRoomData = docSnapshot.data();
          setSelectedFont(chatRoomData.font || "Arial"); // Default to Arial if no font is set
        }
      });
      return () => unsubscribe();
    }
  }, [selectedChatRoom?.id, db]);

  // eslint-disable-next-line no-unused-vars
  const auth = getAuth();
  // Fetch team members from Firestore and store them in redux storage
  useEffect(() => {
    let unsubscribe; // For cleanup
    const fetchTeamMembers = async () => {
      try {
        // Attach a snapshot listener to the "users" collection
        unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
          const fetchedUsers = snapshot.docs
            .map((doc) => ({
              uid: doc.id,
              name: doc.data().name,
              email: doc.data().email,
              avatar: doc.data().avatar || "https://placehold.co/40x40",
              status: doc.data().status || "inactive", // Include user status
            }))
            .filter((member) => member.uid !== user.uid); // Exclude the current user

          // Dispatch the updated team members list to Redux store
          dispatch(setTeamMembers(fetchedUsers));
          setLoading(false);
        });
      } catch (error) {
        // Handle error
        setError(error.message);
        setLoading(false);
      }
    };

    if (user) {
      fetchTeamMembers();
    }

    // Cleanup the snapshot listener when the component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, db, dispatch]);

  // Fetch chat rooms from Firestore and store them in Redux

  // clean up the
  //how is this function diff from line244
  useEffect(() => {
    if (selectedChatRoom?.id) {
      // Reference to the chat room document in Firestore
      const chatRoomRef = doc(db, "chatrooms", selectedChatRoom.id);

      // Set up a listener to get the latest font data
      const unsubscribe = onSnapshot(chatRoomRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const chatRoomData = docSnapshot.data();
          if (chatRoomData.font) {
            // console.log("font:", chatRoomData.font);
            setSelectedFont(chatRoomData.font); // Update the font in state
          }
        }
      });

      // Cleanup listener on component unmount or chat room change
      return () => unsubscribe();
    }
  }, [selectedChatRoom?.id, db]);

  // Function to  get message from firestore server chat room
  useEffect(() => {
    let unsubscribe = null;

    if (selectedChatRoom?.id) {
      // Set up a listener for the current chat room
      const chatMessagesQuery = query(
        collection(db, "chatrooms", selectedChatRoom.id, "messages"),
        orderBy("timestamp", "asc")
      );

      unsubscribe = onSnapshot(chatMessagesQuery, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChatMessages(messages);
      });
    }

    // Cleanup function to unsubscribe when the component unmounts or chat room changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedChatRoom, db]);
  //Function to change chat room colors
  useEffect(() => {
    if (selectedChatRoom?.id) {
      // Listen for changes to the selected chat room
      const chatRoomRef = doc(db, "chatrooms", selectedChatRoom.id);
      const unsubscribe = onSnapshot(chatRoomRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const chatRoomData = docSnapshot.data();
          if (chatRoomData.color !== selectedChatRoom.color) {
            // Update local state with the latest color from Firestore
            setSelectedChatRoom((prev) => ({
              ...prev,
              color: chatRoomData.color,
            }));
          }
          if (chatRoomData.textColor !== selectedChatRoom.textColor) {
            setSelectedChatRoom((prev) => ({
              ...prev,
              textColor: chatRoomData.textColor,
            }));
            //console.log("color" + chatRoomData.textColor);
          }
        }
      });

      // Cleanup listener on unmount or chat room change
      return () => unsubscribe();
    }
  }, [
    selectedChatRoom?.id,
    db,
    selectedChatRoom?.textColor,
    selectedChatRoom?.color,
  ]);
  //console.log(useSelector((state) => state.auth.user));

  // to keep the team members sorted in the team members LIST  and on search arrange a/c
  const sortedTeamMembers = [...teamMembers].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
  //console.log(sortedTeamMembers);
  const filteredAndSortedTeamMembers = searchQuery.trim()
    ? teamMembers
        .filter(
          (member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          // Check name matches
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          const query = searchQuery.toLowerCase();

          const nameAIndex = nameA.indexOf(query);
          const nameBIndex = nameB.indexOf(query);

          // Prioritize matches at the beginning of the name
          if (nameAIndex !== nameBIndex) return nameAIndex - nameBIndex;

          // If name matches equally, compare email matches
          const emailA = a.email.toLowerCase();
          const emailB = b.email.toLowerCase();

          const emailAIndex = emailA.indexOf(query);
          const emailBIndex = emailB.indexOf(query);

          return emailAIndex - emailBIndex;
        })
    : sortedTeamMembers;
  // Show all team members when search is empty

  // open chat room on clicking
  const handleMemberClick = async (member) => {
    try {
      if (!user) {
        return <div>Please log in to access your dashboard.</div>;
      }
      if (!user?.uid || !member?.uid) {
        //  console.error("User or member UID is undefined");
        return;
      }

      // Generate a consistent unique key for the chat room based on participant IDs
      const participantIds = [user.uid, member.uid].sort().join("-");
      // console.log("Generated participantIds:", participantIds);

      if (!participantIds) {
        // console.error("Invalid participantIds");
        return;
      }

      // Query for an existing chat room using the unique participantIds
      const chatRoomQuery = query(
        collection(db, "chatrooms"),
        where("participantIds", "==", participantIds)
      );

      const querySnapshot = await getDocs(chatRoomQuery);

      if (!querySnapshot.empty) {
        // Chat room exists
        const chatRoom = querySnapshot.docs[0].data();
        // console.log("Chat room exists:", chatRoom);

        setSelectedChatRoom({
          id: querySnapshot.docs[0].id,
          ...chatRoom,
        });
        setSelectedMember(member);

        // Fetch and listen to messages in the chat room
        const chatMessagesQuery = query(
          collection(db, "chatrooms", querySnapshot.docs[0].id, "messages"),
          orderBy("timestamp", "asc")
        );

        onSnapshot(chatMessagesQuery, (snapshot) => {
          const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChatMessages(messages);
        });
      } else {
        // No existing chat room, create a new one
        const newChatRoomRef = await addDoc(collection(db, "chatrooms"), {
          participantIds: participantIds, // Unique identifier for this chat room
          participants: [user.uid, member.uid], // Array of participant IDs
          color: "#ffffff",
          font: "Arial",
          textColor: "#000000",
          createdAt: serverTimestamp(),
        });
        await setDoc(
          doc(db, "chatrooms", newChatRoomRef.id),
          {
            typing: {
              [user.uid]: false, // Initially, no one is typing
              [member.uid]: false,
            },
          },
          { merge: true } // Ensure it doesn’t overwrite other fields
        );
        // console.log("Created new chat room:", newChatRoomRef.id);

        setSelectedChatRoom({
          id: newChatRoomRef.id,
          participants: [user.uid, member.uid],
        });
        setSelectedMember(member);
        setChatMessages([]); // No messages in a new chat room
      }
    } catch (error) {
      // console.error("Error fetching or creating chat room:", error);
      toast(error);
    }
  };
  // store all members who is currently having a chat room with the user
  useEffect(() => {
    let unsubscribe;

    const fetchRecentChats = () => {
      try {
        const chatListeners = teamMembers.map((member) => {
          const participantIds = [user.uid, member.uid].sort().join("-");

          // Query to listen for changes in chatrooms for the current user and team member
          const chatRoomQuery = query(
            collection(db, "chatrooms"),
            where("participantIds", "==", participantIds)
          );

          // Attach a snapshot listener to the query
          return onSnapshot(chatRoomQuery, (querySnapshot) => {
            if (!querySnapshot.empty) {
              setRecentChats((prevChats) => {
                if (!prevChats.some((chat) => chat.uid === member.uid)) {
                  return [...prevChats, member];
                }
                return prevChats;
              });
            }
          });
        });

        // Combine all listeners for cleanup
        unsubscribe = () => {
          chatListeners.forEach((unsub) => unsub());
        };
      } catch (error) {
        // Handle errors
        setError(error.message);
      }
    };

    if (teamMembers.length > 0) {
      fetchRecentChats();
    }

    // Cleanup all listeners when component unmounts or dependencies change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [teamMembers, user, db]);
  // Fetch chat messages for the selected chat room
  //send message to the server and return results
  const sendMessage = async () => {
    if (newMessage.trim() === "") {
      return; // Do not send empty messages
    }
    // console.log(selectedChatRoom.id);
    // console.log(selectedChatRoom.participantIds);

    if (!selectedChatRoom) {
      // console.error("No chat room selected.");
      return;
    }

    try {
      const chatRoomId = selectedChatRoom.id;
      const receiverId = selectedChatRoom.participantIds
        .replace(user.uid, "")
        .trim();

      if (!receiverId) {
        // console.error("Receiver ID could not be determined.");
        return;
      }

      await addDoc(collection(db, "chatrooms", chatRoomId, "messages"), {
        text: newMessage,
        senderId: user.uid,
        receiverId: receiverId,
        timestamp: serverTimestamp(),
      });

      // Clear the input field after sending
      setNewMessage("");
    } catch (error) {
      // console.error("Error sending message:", error);
      toast(error);
    }
  };
  // to add emoji with the message and close the emojicon
  // const handleEmojiClick = (emojiObject) => {
  //   setNewMessage((prev) => prev + emojiObject.emoji);
  //   setShowEmojiPicker(false);
  // };
  // console.log(selectedMember);
  // to return to home page when user not logged in
  useEffect(() => {
    if (!user) {
      // Navigate to home after sign-out
      navigate("/");
    }
  }, [user, navigate]); // Depend on user and navigate

  if (loading) {
    return (
      // loading page
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f8f8", // Optional background color
        }}
      >
        <img
          src={loadingGif}
          alt="Loading..."
          style={{ minHeight: "50%", minWidth: "50%", objectFit: "fill" }}
        />
      </div>
    );
  }
  // if error is encountered
  if (error)
    return <div style={{ width: "100vw", height: "100vh" }}>error</div>;

  //dashboard
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarActive ? "active" : ""}`}>
        {sidebarActive && (
          <box-icon
            name="x"
            onClick={() => setSidebarActive(!sidebarActive)}
          ></box-icon>
        )}
        <h2 className="app-title">Chatter</h2>
        {/* search box */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search for team members..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Team Members */}
        <h3 style={{ marginBottom: "10px" }}>Team Members</h3>
        <div className="team-members   scrollable">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : filteredAndSortedTeamMembers.length > 0 ? (
            filteredAndSortedTeamMembers.map((member) => (
              <div
                key={member.uid}
                className="team-member"
                onClick={() => handleMemberClick(member)}
                style={{
                  backgroundColor:
                    selectedMember?.uid === member.uid ? "#f1f5f9" : "#f9f9f9",
                }}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="avatar"
                  style={
                    member.status === "active"
                      ? { border: "2px solid #4dc9e6" }
                      : {}
                  }
                />
                <div>
                  <p>{member.name}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No team members found</p>
          )}
        </div>
        {/* Recent Chats */}
        <h3>Recent Chats</h3>
        <div className="recent-chats scrollable">
          {recentChats.length > 0 ? (
            recentChats.map((member) => (
              <div
                key={member.uid}
                className="team-member"
                onClick={() => handleMemberClick(member)}
                style={{
                  backgroundColor:
                    selectedMember?.uid === member.uid ? "#f1f5f9" : "#f9f9f9",
                }}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="avatar"
                  style={
                    member.status === "active"
                      ? { border: "2px solid #4dc9e6" }
                      : {}
                  }
                />

                <div className="recent-chat-info">
                  <p>{member.name}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No recent chats found</p>
          )}
        </div>
      </div>
      {/* Main Chat Section */}
      <div className="main-chat">
        <div className="chat-header">
          <div className="header-container">
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* Menu Icon */}
              <div className="menu-icon">
                <box-icon
                  name="menu"
                  onClick={() => setSidebarActive(!sidebarActive)}
                ></box-icon>
              </div>

              {/* Header or Selected Member Profile */}
              {selectedMember == null ? (
                <h2>Messages</h2>
              ) : (
                <div className="profile">
                  <span
                    className="back"
                    style={{ marginRight: "10px" }}
                    onClick={() => setSelectedMember(null)}
                  >
                    <MdArrowBackIosNew />
                  </span>
                  <img
                    src="http://placehold.co/40x40"
                    alt="Profile"
                    className="profile-picture"
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="profile-name">{selectedMember.name}</span>
                    {/* to show typing or not  */}
                    {typingUsers.includes(selectedMember.uid) && (
                      <span
                        style={{
                          paddingTop: "5px",
                          paddingLeft: "10px",
                          fontSize: "14px",
                          color: "gray",
                        }}
                      >
                        typing...
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Chat Header Right Section */}
            <div className="chat-header-right">
              {selectedMember == null ? (
                user ? (
                  <div className="profile">
                    <img
                      src="http://placehold.co/40x40"
                      alt="profile of user"
                      className="profile-picture"
                    />
                    <span className="profile-name">{user.name}</span>
                    <SignOut />
                  </div>
                ) : (
                  loading
                )
              ) : isOpen ? (
                <span className="option-container">
                  <IoIosOptions
                    size={24}
                    style={{ cursor: "pointer" }}
                    onClick={handleToggle}
                  />
                </span>
              ) : (
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
                          <option value="Times New Roman">
                            Times New Roman
                          </option>
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
              )}
            </div>
          </div>
          {/* //{selectedChatRoom && <p>Chat Room: {selectedChatRoom.id}</p>} */}
        </div>
        {/* to show home section or the chat window  */}
        {selectedMember == null && (
          <div
            style={{
              height: "90vh",
              width: "100%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgb(246, 242, 225)", // Optional background color
            }}
          >
            <video
              src={loadingImage}
              autoPlay
              loop
              muted
              alt="start chat "
              width={600}
              style={{ objectFit: "contain" }}
            ></video>
          </div>
        )}
        {/* Chat Messages */}
        {selectedMember !== null && (
          <ChatMessages
            selectedChatRoom={selectedChatRoom}
            chatMessages={chatMessages}
            user={user}
            selectedFont={selectedFont}
            timeStampColor={timeStampColor}
          />
        )}
        {/* Message Input  area  */}
        {selectedMember !== null && (
          <ChatInput
            selectedMember={selectedMember}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            handleInputChange={handleInputChange}
          />
        )}
      </div>
    </div>
  );
};
export default DashBoard;
//block
