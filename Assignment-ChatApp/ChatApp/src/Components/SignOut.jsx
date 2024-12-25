import { useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "./../store/authSlice";
import { useNavigate } from "react-router-dom";
import { app } from "../firebaseConfig";
import "./Logout.css";
import { TbLogout } from "react-icons/tb";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
const SignOut = () => {
  const db = getFirestore(app); // Ensure getFirestore is correctly imported and initialized
  const dispatch = useDispatch();
  const auth = getAuth(app); // Explicitly pass the app instance
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user); // Retrieve the user from Redux state

  // Handle sign out logic
  const handleSignOut = async () => {
    if (!user) {
      return;
    }

    try {
      // Set user status to inactive in Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { status: "inactive" }, { merge: true });

      // Firebase Auth sign out
      await signOut(auth);

      // Clear Redux state and local storage
      dispatch(clearUser());
      localStorage.clear();

      // Redirect to Home
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Handle status update for tab close
  const handleTabClose = () => {
    if (!user) return;

    try {
      // Use `navigator.sendBeacon` to ensure status update is sent before tab closes
      const userRef = doc(db, "users", user.uid);
      const userData = { status: "inactive" };
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${process.env.REACT_APP_FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${user.uid}`;
      const body = JSON.stringify({ fields: userData });

      navigator.sendBeacon(firestoreUrl, body);
    } catch (error) {
      console.error("Error updating status on tab close:", error);
    }
  };

  // Setup effect for handling tab close
  useEffect(() => {
    window.addEventListener("beforeunload", handleTabClose);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [user]);

  return (
    <div
      className="log-out"
      data-tooltip-content="logOut"
      data-tooltip-id="logOut-tooltip"
      onClick={handleSignOut}
    >
      <TbLogout />
      <ReactTooltip
        id="logOut-tooltip"
        place="bottom"
        effect="solid"
        type="info"
      />
    </div>
  );
};

export default SignOut;
