
import React, { useState } from "react";
import { Container, Input, Button, Stack, Text } from "@chakra-ui/react";
import { BASE_URL } from "../App";

const RegisterGuest = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: "guest" }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
    }
  };

  return (
    <Container>
      <Stack spacing={3}>
        <Text fontSize="lg">Register as Guest</Text>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {error && <Text color="red.500">{error}</Text>}
        <Button onClick={handleRegister}>Register</Button>
      </Stack>
    </Container>
  );
};

export default RegisterGuest;
