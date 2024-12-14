import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, Container, Flex, Text, useColorMode, useColorModeValue, Link } from "@chakra-ui/react";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import CreateUserModal from "./CreateUserModal";

const Navbar = ({ user, setUser, setUsers }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();


  const handleLogout = () => {
    setUser(null); // Clear user state
    setUsers([]); // Clear users list
    console.log("User logged out.");
  };

  return (
    <Container maxW={"1500px"}>
      <Box px={4} my={4} borderRadius={5} bg={useColorModeValue("gray.200", "gray.700")}>
        <Flex h="16" alignItems={"center"} justifyContent={"space-between"}>
          {/* Left side */}
          <Flex alignItems={"center"} justifyContent={"center"} gap={3} display={{ base: "flex" }}>
			<Link onClick={() => navigate("/")}>
            	<img src="/pizzas.png" alt="React logo" width={100} height={100} />
			</Link>
            {user && ( // Show username next to the pizza logo if user is logged in
              <Text fontSize="lg" fontWeight="bold">
                Welcome, {user.username}!
              </Text>
            )}
          </Flex>

          {/* Right side */}
          <Flex gap={3} alignItems={"center"}>

		  <Button onClick={() => navigate("/aboutus")} colorScheme="teal" variant="solid">
              ABOUT US
            </Button>
            
            {user && (
              <Button colorScheme="red" onClick={handleLogout}>
                Logout
              </Button>
            )}
            {user && <CreateUserModal setUsers={setUsers} />}
			<Button onClick={toggleColorMode}>
              {colorMode === "light" ? <IoMoon /> : <LuSun size={20} />}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Container>
  );
};

export default Navbar;
