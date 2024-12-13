import React, { useState } from "react";
import { Input, Flex } from "@chakra-ui/react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // Pass the query to the parent component
  };

  return (
    <Flex justifyContent="center" mb={4}>
      <Input
        placeholder="Search for a friend..."
        value={query}
        onChange={handleInputChange}
        width="50%"
      />
    </Flex>
  );
};

export default SearchBar;
