import React from "react";
import { Flex, Text, Loader, Toast, Button } from "monday-ui-react-core";
import { Heading } from "monday-ui-react-core/next";
import welcomeImage from "../assets/welcome.png";

const OnboardingPage = ({ monday, setIsOnboarded, context }) => {
  const handleOnboard = () => {
    localStorage.setItem(`isOnboarded-${context.user.id}-linked-turbo`, true);
    setIsOnboarded(true);
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>
      <div
        style={{
          backgroundColor: "#2D67BC",
          height: "100%",
          width: "40%",
          padding: "3rem",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Heading
          color="onPrimary"
          type={Heading.types.H1}
          weight={Heading.weights.BOLD}
          ellipsis={false}
        >
          Welcome to Linked Turbo, Find & enrich targeted Linkedin profiles
        </Heading>

        <Text
          ellipsis={false}
          style={{ marginTop: "2rem" }}
          mt="sm"
          color="onPrimary"
          type={Text.types.TEXT1}
        >
          We're thrilled to have you on board and can't wait for you to
          experience the our app.
        </Text>

        <Button
          onClick={handleOnboard}
          variant="filled"
          style={{ marginTop: "2rem", alignSelf: "start" }}
        >
          Get started
        </Button>
      </div>
      <div
        style={{
          width: "60%",
          height: "100%",
          backgroundColor: "#5182CB",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%",display:"flex",justifyContent:"center",alignItems:"flex-start" }}>
                    <img
            src={welcomeImage}
            alt="welcome illustration"
            style={{ width: "60%" }}
          />

        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
