import React, { useState } from "react";
import { Container, Input, Button, Stack, Text } from "@chakra-ui/react";

// Replace BASE_URL with your backend's base URL
const BASE_URL = "http://127.0.0.1:5000/api"; // Ensure this matches your backend

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user); // Update user state in parent component
        setSuccess(`Welcome, ${data.user.username}!`);
        setError("");
      } else {
        setError(data.error || "Login failed");
        setSuccess("");
      }
    } catch (err) {
      setError("An error occurred during login");
      setSuccess("");
    }
  };

  return (
    <Container>
      <Stack spacing={3}>
        <Text fontSize="lg">Login</Text>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Text color="red.500">{error}</Text>}
        {success && <Text color="green.500">{success}</Text>}
        <Button onClick={handleLogin}>Login</Button>
      </Stack>
    </Container>
  );
};

export default Login;
