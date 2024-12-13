import React, { useState } from "react";
import { Container, Stack, Text } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import UserGrid from "./components/UserGrid";
import Login from "./components/Login";
import RegisterGuest from "./components/RegisterGuest";

// Set BASE_URL depending on the environment
export const BASE_URL =
  import.meta.env.MODE === "development" ? "http://127.0.0.1:5000/api" : "/api";

function App() {
  const [user, setUser] = useState(null); // State for managing logged-in user
  const [users, setUsers] = useState([]); // State for managing the list of users

  return (
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
          <Text as={"span"} bgGradient={"linear(to-r, cyan.400, blue.500)"} bgClip={"text"}>
            My Besties
          </Text>
          🚀
        </Text>

        {/* Conditional rendering of components */}
        {!user && (
          <>
            <Login setUser={setUser} />
            <RegisterGuest setUser={setUser} />
          </>
        )}

        {user && <UserGrid users={users} setUsers={setUsers} />} {/* UserGrid with user data */}
      </Container>
    </Stack>
  );
}

export default App;
