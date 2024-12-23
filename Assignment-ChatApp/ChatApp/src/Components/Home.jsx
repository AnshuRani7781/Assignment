import { useNavigate, Outlet } from "react-router-dom";
import Typewriter from "./Typewriter"; // Import the Typewriter component
import "./../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate("/login");

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#fff",
        maxHeight: "fitContent",
        position: "relative",
        width: "100%",
        background:
          "linear-gradient(to top, rgb(77, 201, 230), rgb(33, 12, 174))",
      }}
    >
      <div style={{ position: "absolute", top: "-30px", left: "35px" }}>
        <img
          src="https://i.ibb.co/jLYtddL/p8b6nfkj8tzf45g9t46xa20k8e-image-removebg-preview.png"
          alt="logo"
          width="180"
          height="150"
        />
      </div>
      <div className="main-content">
        <div className="text-container" style={{ marginLeft: "1rem" }}>
          <h1>
            Have your best chat
            <Typewriter className="typewriter" style={{ fontsize: "2rem", fontweight: "600" }} />
          </h1>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "300",
              marginBottom: "30px",
            }}
          >
            Fast, easy & unlimited team chat.
          </h3>

          <button
            className="get-started"
            onClick={handleGetStarted}
            style={{
              fontSize: "1.2rem",
              padding: "10px 20px",
              backgroundColor: "#fff",
              color: "#007bff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Get Started
          </button>
        </div>

        {/* Image Content */}
        <div
          className="img-container"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "40px",
            alignItems: "end",
            marginTop: "2rem",
          }}
        >
          <div style={{ position: "relative" }} className="image1">
            <img
              src="https://www.shutterstock.com/image-photo/young-happy-smiling-pretty-woman-260nw-2249452187.jpg"
              alt="User 1"
              style={{
                width: "90%",
                maxWidth: "380px",
                maxHeight: "250px",
                borderRadius: "10px",
                marginRight: "180px",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "100px",
                left: "150px",
                backgroundColor: "#ffa500",
                // padding: "5px",
                borderRadius: "10px",
              }}
            >
              Hi, how&apos;s the report?
            </div>
          </div>
          <div style={{ position: "relative" }} className="image2">
            <img
              src="https://www.qrcaviews.org/wp-content/uploads/2020/03/phone-girl-FI-spring20.jpg"
              alt="User 2"
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "10px",
                marginRight: "2rem",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "120px",
                left: "120px",
                backgroundColor: "grey",
                padding: "5px",
                borderRadius: "10px",
                color: "#fff",
              }}
            >
              I&rsquo;m on it!
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Home;
