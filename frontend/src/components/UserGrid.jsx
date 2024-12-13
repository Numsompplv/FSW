import React, { useEffect, useState } from "react";
import { Flex, Grid, Spinner, Text } from "@chakra-ui/react";
import UserCard from "./UserCard";
import { BASE_URL } from "../App";
import SearchBar from "./SearchBar";

const UserGrid = ({ users, setUsers }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]); // For search filtering

  // Fetch friends on component mount
  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await fetch(BASE_URL + "/friends", {
          method: "GET",
          credentials: "include", // Include session to fetch user-specific friends
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }
        setUsers(data); // Set all friends from the backend
        setFilteredUsers(data); // Initialize filtered users with all friends
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getUsers();
  }, [setUsers]);

  // Function to handle search queries
  const handleSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(lowerQuery)
    );
    setFilteredUsers(filtered); // Update the displayed users based on the search
  };

  // Ensure `filteredUsers` is updated when `users` changes
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  return (
    <>
      {/* Show SearchBar only if there are users */}
      {users.length > 0 && <SearchBar onSearch={handleSearch} />}

      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }}
        gap={4}
      >
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} setUsers={setUsers} />
        ))}
      </Grid>

      {isLoading && (
        <Flex justifyContent={"center"}>
          <Spinner size={"xl"} />
        </Flex>
      )}
      {!isLoading && users.length === 0 && (
        <Flex justifyContent={"center"}>
          <Text fontSize={"xl"}>
            <Text as={"span"} fontSize={"2xl"} fontWeight={"bold"} mr={2}>
              Poor you! 🥺
            </Text>
            No friends found.
          </Text>
        </Flex>
      )}
    </>
  );
};

export default UserGrid;
