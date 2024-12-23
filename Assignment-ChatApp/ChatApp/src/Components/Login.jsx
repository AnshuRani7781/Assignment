/* eslint-disable no-unused-vars */

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, setRememberMe } from "../store/authSlice";
import { toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import "./../styles/Login.css";
import "boxicons";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { app } from "../firebaseConfig";
const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSignUpClick = () => navigate("/signup");

  const auth = getAuth(app);
  const db = getFirestore(app);
  const googleProvider = new GoogleAuthProvider();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMeState] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Show loading state
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Check if the user document exists
      if (userSnap.exists()) {
        const userData = userSnap.data();
        // Check if the user is already active
        if (userData.status === "active") {
          toast.error("You are already logged in from another session.");
          setLoading(false); // Stop loading state
          return; // Exit the function to prevent further execution
        }
        // Check the status field and update if necessary
        else {
          // If no status or if the status is inactive, set it to active
          await setDoc(
            userRef,
            { status: "active" },
            { merge: true } // Use merge to avoid overwriting other fields
          );

          // Dispatch user data to Redux store
          dispatch(
            setUser({
              uid: user.uid,
              email: user.email,
              name: user.displayName || "user",
              status: "active", // Make sure the user status in the store is "active"
            })
          );

          dispatch(setRememberMe(rememberMe));
          // updatePersistConfig(rememberMe);
          navigate("/DashBoard");
        }
        // console.log("User logged in:", userCredential.user);
      }
    } catch (error) {
      toast.error("Invalid email or password. Please try again.");
      //setError("Invalid email or password. Please try again.");
      toast.error(error);
    } finally {
      setLoading(false); // Remove loading state
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(""); // Clear previous errors
      setLoading(true); // Show loading state
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().status === "active") {
        const userData = userSnap.data();
        toast.error("You are already logged in from another session.");
        setLoading(false); // Stop loading state
        return; // Exit the function to prevent further execution
      }
      dispatch(
        setUser({
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || "user",
          status: "active",
        })
      );

      // Save user data to Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "Anonymous",
          photoURL: user.photoURL || "",
          createdAt: new Date().toISOString(),
          status: "active",
        },
        { merge: true }
      ); // Merge prevents overwriting if the document already exists

      // console.log(
      //   "User logged in with Google:",
      //   result.user.uid,
      //   result.user.email,
      //   result.user.email);
      dispatch(setRememberMe(rememberMe));
      navigate("/DashBoard");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        // Specific check for email already in use error
        toast.error("Email is already in use! Please try another email.");
      } else {
        // Handle other errors generically
        toast.error(`Error: ${error.message}`);
      }
      //  console.error("Error with Google login:", error.message);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false); // Remove loading state
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        // background: " linear-gradient(to top, #4dc9e6, #210cae)",
      }}
    >
      <div
        className="auth-container"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.3)",
        }}
      >
        <h2>Log In</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              required
              onChange={(e) => setEmail(e.target.value)}
              style={{ outline: "none" }}
            />
          </div>

          <div className="input-group" style={{ position: "relative" }}>
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Password"
              aria-label="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              style={{ position: "absolute", top: "22px", right: "10px" }}
              type="button"
              className="toggle-password"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>

          <div className="options">
            {/* <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMeState(e.target.checked)}
              />{" "}
              Remember me
            </label> */}
          </div>

          <button className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "1rem",
            }}
          >
            Or Sign in with{" "}
            <button
              style={{
                border: "none",
                backgroundColor: "transparent",
                padding: "0",
              }}
              onClick={handleGoogleLogin}
            >
              <span className="option-container">
                {" "}
                <box-icon type="logo" name="google" color="#fff"></box-icon>
              </span>
            </button>
          </p>
        </div>

        <p style={{ fontSize: "16px" }}>
          Don’t have an account?{" "}
          <button
            className="btn"
            onClick={onSignUpClick}
            style={{
              color: "#ffffff",
              textDecoration: "none",
              backgroundColor: "transparent",
              border: "none",
            }}
          >
            <span className="option-container"> Sign up</span>
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
