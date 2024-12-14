import React, { useState } from "react";
import { Container, Input, Button, Stack, Text } from "@chakra-ui/react";
import { BASE_URL } from "../App";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(""); // For token input (second step)
  const [newPassword, setNewPassword] = useState(""); // For new password (second step)
  const [isTokenSent, setIsTokenSent] = useState(false); // Step indicator
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Step 1: Request reset token
  const requestResetToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsTokenSent(true);
        setSuccess("Reset token sent to your email.");
        setError("");
        console.log("Token for testing:", data.token); // Log token for local testing
      } else {
        setError(data.error || "Failed to send reset token");
        setSuccess("");
      }
    } catch (err) {
      setError("An error occurred while requesting reset token");
      setSuccess("");
    }
  };

  // Step 2: Confirm reset and update password
  const resetPassword = async () => {
    try {
      const response = await fetch(`${BASE_URL}/confirm-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, new_password: newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setError("");
        setTimeout(() => navigate("/"), 3000); // Redirect to login after success
      } else {
        setError(data.error || "Failed to reset password");
        setSuccess("");
      }
    } catch (err) {
      setError("An error occurred while resetting password");
      setSuccess("");
    }
  };

  return (
    <Container>
      <Stack spacing={3}>
        <Text fontSize="lg">Reset Your Password</Text>

        {!isTokenSent ? (
          // Step 1: Request reset token
          <>
            <Input
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={requestResetToken}>Send Reset Token</Button>
          </>
        ) : (
          // Step 2: Reset password
          <>
            <Input
              placeholder="Enter the reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Input
              placeholder="Enter your new password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button onClick={resetPassword}>Reset Password</Button>
          </>
        )}

        {error && <Text color="red.500">{error}</Text>}
        {success && <Text color="green.500">{success}</Text>}
      </Stack>
    </Container>
  );
};

export default ResetPassword;
