import React from "react";
import { Container, Box, Typography } from "@mui/material";

const HomePage = () => {
  return (
    <Container
      sx={{
        height: "100vh",
        overflow: "auto",
        scrollSnapType: "y mandatory",
        padding: "0 !important",
        maxWidth: "none !important",
      }}
    >
      {/* Introduction Section */}
      <Box
        sx={{
          height: "100vh",
          scrollSnapAlign: "start",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h2">Welcome to My Portfolio</Typography>
      </Box>

      {/* Elevator Pitch Section */}
      <Box
        sx={{
          height: "100vh",
          scrollSnapAlign: "start",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "secondary.main",
          color: "white",
        }}
      >
        <Typography variant="h3">
          I turn complex problems into elegant solutions
        </Typography>
      </Box>

      {/* About Section */}
      <Box
        sx={{
          height: "100vh",
          scrollSnapAlign: "start",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          padding: 4,
        }}
      >
        <Typography variant="body1" maxWidth="800px" textAlign="center">
          With over X years of experience in web development, I specialize in
          creating responsive, user-friendly applications using modern
          technologies like React, Next.js, and Material UI.
        </Typography>
      </Box>

      {/* Projects Section */}
      <Box
        sx={{
          height: "100vh",
          scrollSnapAlign: "start",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          padding: 4,
        }}
      >
        <Typography variant="h3" gutterBottom>
          My Projects
        </Typography>
        <Typography variant="body1" maxWidth="800px" textAlign="center">
          Here are some of my recent projects...
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
