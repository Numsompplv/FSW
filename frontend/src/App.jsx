import React, { useState } from "react";
import { Stack, Text, Container } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import UserGrid from "./components/UserGrid";
import ResetPassword from "./components/ResetPassword"; // Import ResetPassword component
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

export const BASE_URL =
  import.meta.env.MODE === "development" ? "http://127.0.0.1:5000/api" : "/api";

function App() {
  const [user, setUser] = useState(null); // State for managing logged-in user
  const [users, setUsers] = useState([]); // State for managing the list of friends

  return (
    <Router>
      <Stack minH={"100vh"}>
        {/* Navbar component */}
        <Navbar user={user} setUser={setUser} setUsers={setUsers} />

        <Container maxW={"1200px"} my={4}>
          {/* Header */}
          <Text
            fontSize={{ base: "3xl", md: "50" }}
            fontWeight={"bold"}
            letterSpacing={"2px"}
            textTransform={"uppercase"}
            textAlign={"center"}
            mb={8}
          >
            <Text
              as={"span"}
              bgGradient={"linear(to-r, cyan.400, blue.500)"}
              bgClip={"text"}
            >
              My Besties
            </Text>
            🚀
          </Text>

          <Routes>
            {/* Login Page */}
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/users" /> // Redirect to /users if user is logged in
                ) : (
                  <Login setUser={setUser} />
                )
              }
            />

            {/* Register Page */}
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/users" /> // Redirect to /users if user is logged in
                ) : (
                  <Register />
                )
              }
            />

            {/* Reset Password Page */}
            <Route
              path="/reset-password"
              element={
                user ? (
                  <Navigate to="/users" /> // Redirect to /users if user is logged in
                ) : (
                  <ResetPassword /> // Render ResetPassword component
                )
              }
            />

            {/* User Dashboard (User Grid) */}
            <Route
              path="/users"
              element={
                user ? (
                  <UserGrid users={users} setUsers={setUsers} />
                ) : (
                  <Navigate to="/" /> // Redirect to login if user is not logged in
                )
              }
            />
          </Routes>
        </Container>
      </Stack>
    </Router>
  );
}

export default App;
