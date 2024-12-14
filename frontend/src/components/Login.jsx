import React, { useState, useEffect } from "react";
import { Container, Input, Button, Stack, Text, Link } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000/api";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for a success message passed via state from registration
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
    }
  }, [location.state]);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include session in request
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user); // Update user state in parent component
        navigate("/users"); // Redirect to user dashboard
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
        <Text fontSize="sm">
          Forgot your password?{" "}
          <Link color="blue.500" onClick={() => navigate("/reset-password")}>
            Reset it here
          </Link>
        </Text>
        <Text fontSize="sm">
          Don't have an account?{" "}
          <Link color="blue.500" onClick={() => navigate("/register")}>
            Register as a new User
          </Link>
        </Text>
      </Stack>
    </Container>
  );
};

export default Login;
