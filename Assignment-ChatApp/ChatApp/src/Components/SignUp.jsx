

import "./../styles/Signup.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const onLoginClick = () => {
    navigate("/Login");
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const db = getFirestore(app);
  const auth = getAuth(app); 

  const validateForm = () => {
    let isValid = true;
    const nameRegex = /^[A-Za-z]+$/; // Regular expression to allow only letters
    if (!firstName.trim()) {
      toast.error("First Name is required.");
      isValid = false;
    } else if (!nameRegex.test(firstName)) {
      toast.error("First Name must contain only letters.");
      isValid = false;
    }
    if (!lastName.trim()) {
      toast.error("Last Name is required.");
      isValid = false;
    } else if (!nameRegex.test(lastName)) {
      toast.error("Last Name must contain only letters.");
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      toast.error("Email is required.");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      toast.error("Invalid email format.");
      isValid = false;
    }
    if (!password) {
      toast.error("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      isValid = false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      isValid = false;
    }
    return isValid;
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Stop form submission if validation fails
    }
    setError(""); // Clear previous errors
    setLoading(true); // Show loading state

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update the user's profile with first and last name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });
      //console.log(userCredential);

      dispatch(
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName,
          status: "active", // Add status field for user status (e.g., active, blocked, etc.)
        })
      );

      const userRef = doc(db, "users", userCredential.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName,
          avatar: "https://placehold.co/40x40",
          createdAt: new Date().toISOString(),
          status: "active",
        });
        //console.log("New user added to Firestore");
      }

      //console.log("User signed up:", userCredential.user);
      //console.log("User full name:", userCredential.user.displayName);
      navigate("/DashBoard");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        // Specific check for email already in use error
        toast.error("Email is already in use! Please try another email.");
      } else {
        // Handle other errors generically
        toast.error(`Error: ${error.message}`);
      }
      //console.error("Error signing up:", error.message);
    } finally {
      setLoading(false); // Remove loading state
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignUp}>
          <div className="row">
            <input
              type="text"
              placeholder="First Name"
              required
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              required
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="input-group">
            <input
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="signup-btn" disabled={loading}>
            {" "}
            {loading ? "Signing in..." : "Sign Up"}
          </button>
        </form>

        <p className="signin-link" style={{ color: "#fff" }}>
          Already have an account?{" "}
          <button
            className="btn"
            onClick={onLoginClick}
            style={{
              padding: "10px",
              border: "none",
              fontSize: "15px",
            }}
          >
            <span className=" option-container"> Login </span>
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
