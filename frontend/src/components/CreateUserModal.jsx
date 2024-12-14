import React, { useState } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { BiAddToQueue } from "react-icons/bi";
import { BASE_URL } from "../App";

const CreateUserModal = ({ setUsers }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState({
    name: "",
    role: "",
    description: "",
    gender: "",
  });
  const [image, setImage] = useState(null); // For the uploaded image
  const toast = useToast();

  const handleCreateUser = async (e) => {
    e.preventDefault(); // Prevent page refresh
    setIsLoading(true);

    try {
      // Create form data to send both text inputs and the image
      const formData = new FormData();
      formData.append("name", inputs.name);
      formData.append("role", inputs.role);
      formData.append("description", inputs.description);
      formData.append("gender", inputs.gender);
      if (image) {
        formData.append("image", image);
      }

      const res = await fetch(BASE_URL + "/friends", {
        method: "POST",
        credentials: "include", // Ensure session is included for user-specific operations
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      toast({
        status: "success",
        title: "Yayy! 🎉",
        description: "Friend created successfully.",
        duration: 2000,
        position: "top-center",
      });
      onClose();
      setUsers((prevUsers) => [...prevUsers, data]);

      // Clear inputs and image
      setInputs({
        name: "",
        role: "",
        description: "",
        gender: "",
      });
      setImage(null);
    } catch (error) {
      toast({
        status: "error",
        title: "An error occurred.",
        description: error.message,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={onOpen}>
        <BiAddToQueue size={20} />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={handleCreateUser}>
          <ModalContent>
            <ModalHeader> My new BFF 😍 </ModalHeader>
            <ModalCloseButton />

            <ModalBody pb={6}>
              <Flex alignItems={"center"} gap={4}>
                {/* Full Name */}
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    placeholder="John Doe"
                    value={inputs.name}
                    onChange={(e) =>
                      setInputs({ ...inputs, name: e.target.value })
                    }
                  />
                </FormControl>

                {/* Role */}
                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Input
                    placeholder="Software Engineer"
                    value={inputs.role}
                    onChange={(e) =>
                      setInputs({ ...inputs, role: e.target.value })
                    }
                  />
                </FormControl>
              </Flex>

              {/* Description */}
              <FormControl mt={4}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  resize={"none"}
                  overflowY={"hidden"}
                  placeholder="He's a software engineer who loves to code and build things."
                  value={inputs.description}
                  onChange={(e) =>
                    setInputs({ ...inputs, description: e.target.value })
                  }
                />
              </FormControl>

              {/* Gender */}
              <RadioGroup
                mt={4}
                onChange={(value) => setInputs({ ...inputs, gender: value })}
                value={inputs.gender}
              >
                <Flex gap={5}>
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                </Flex>
              </RadioGroup>

              {/* Image Upload */}
              <FormControl mt={4}>
                <FormLabel>Profile Picture (Optional)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])} // Save the uploaded file
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                type="submit"
                isLoading={isLoading}
              >
                Add
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
};

export default CreateUserModal;
