import React from "react";
import {
  Flex,
  Text,
  Box,
  Avatar,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Checkbox,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { MdSave } from "react-icons/md";

import { Loader } from "../components/Loader";
import { Navbar } from "../components/Navbar";
import { RootState } from "../redux";
import { Layout } from "../components/Layout";
import { httpClient } from "../utils/httpClient";
import { showError } from "../utils/toast";
import { updateProfile } from "../redux/slices/auth";
import { checkIfEmpty } from "../utils/checkIfEmpty";
import { useParams } from "react-router-dom";
import { addUser, getUserDetails, updateUser } from "../redux/slices/users";
import { Role } from "../types";

const Profile = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const usersState = useSelector((state: RootState) => state.users);
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [photo, setPhoto] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isRealtor, setIsRealtor] = React.useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const isEditing = Boolean(id);
  const isAdding = history.location.pathname.includes("add-user");

  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({
    name: "",
    email: "",
    password: "",
  });

  React.useEffect(() => {
    function setInitialState() {
      const matchedUser = usersState.selectedUser;
      const status = usersState.status;

      if (isEditing && !matchedUser) {
        if (auth.isAuthenticated) {
          if (status !== "rejected") {
            dispatch(getUserDetails(id));
          } else {
            history.push("/users");
          }
        } else {
          history.push("/signin");
        }
      }

      if (isEditing && matchedUser) {
        setName(matchedUser?.name);
        setEmail(matchedUser?.email);
        setPhoto(matchedUser.photo);
      }

      if (isAdding) {
      } else if (!isEditing) {
        const loggedInUser = auth?.data;

        setName(loggedInUser?.name || "");
        setEmail(loggedInUser?.email || "");
        setPhoto(loggedInUser?.photo || "");
      }
    }

    setInitialState();
  }, [
    isEditing,
    usersState.selectedUser,
    usersState.status,
    auth.isAuthenticated,
    auth.data,
    dispatch,
    id,
    history,
    isAdding,
  ]);

  const onSave = async () => {
    setIsSaving(true);
    let values: typeof errors = {
      name,
      email,
    };

    if (isAdding) {
      values = {
        ...values,
        password,
      };
    }

    const emptyFields = checkIfEmpty(values);

    if (emptyFields) {
      setErrors(emptyFields);
      setIsSaving(false);
      return;
    }

    if (isAdding) {
      await dispatch(
        addUser({
          email,
          name,
          password,
          photo: photo ? photo : undefined,
          role: isRealtor ? Role.realtor : Role.client,
        })
      );
      setIsSaving(false);
      history.push("/users");
      return;
    }

    if (isEditing) {
      await dispatch(updateUser(id, { email, name, photo }));
      setIsSaving(false);
      history.push("/users");
      return;
    }

    await dispatch(
      updateProfile({
        name,
        email,
        photo,
      })
    );
    setIsSaving(false);
  };

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    try {
      setIsUpdatingPhoto(true);
      const file = e.target.files && e.target.files[0];

      if (!file) {
        setIsUpdatingPhoto(false);
        return;
      }

      const formData = new FormData();
      formData.append("photo", file);

      const res = await httpClient.post("/users/avatar", {
        data: formData,
      });

      if (res.status === "success") {
        setPhoto(res.data);
      } else {
        showError(res.data[0] || "Something went wrong");
      }
      setIsUpdatingPhoto(false);
    } catch (error) {
      showError((error as any).message || "Something went wrong");
      setIsUpdatingPhoto(false);
    }
  };

  return (
    <>
      <Navbar />

      <Layout mt="4">
        <Text fontSize="36" mb="8">
          Profile
        </Text>
        <Flex justifyContent="space-between">
          <Flex
            width="35%"
            border="1px solid #ddd"
            borderRadius="2"
            p="6"
            alignItems="center"
            flexDirection="column"
          >
            <Box
              width="200px"
              height="200px"
              borderRadius="100%"
              border="1px solid #ddd"
              position="relative"
              overflow="hidden"
            >
              <Avatar src={photo} size="full" />
              {isUpdatingPhoto ? (
                <Box
                  bg="white"
                  opacity="0.7"
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                >
                  <Loader />
                </Box>
              ) : null}
            </Box>
            <Button
              as="label"
              htmlFor="photo-input"
              mt="8"
              isLoading={isUpdatingPhoto}
            >
              Change photo
            </Button>
            <Input
              hidden
              type="file"
              id="photo-input"
              onChange={onPhotoChange}
            />
          </Flex>
          <Flex
            width="60%"
            border="1px solid #ddd"
            borderRadius="2"
            p="6"
            flexDirection="column"
          >
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel fontWeight="bold">Name</FormLabel>
              <Input
                type="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired mt="6" isInvalid={!!errors.email}>
              <FormLabel fontWeight="bold">Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            {isAdding && (
              <>
                <FormControl mt="6" isRequired isInvalid={!!errors.password}>
                  <FormLabel fontWeight="bold">Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
                <Checkbox
                  mt="6"
                  colorScheme="green"
                  size="lg"
                  checked={isRealtor}
                  onChange={(e) => setIsRealtor(e.target.checked)}
                >
                  <Text fontSize="lg">Realtor</Text>
                </Checkbox>{" "}
              </>
            )}

            <Flex justifyContent="center" mt="16">
              <Button
                bg="primary"
                leftIcon={<MdSave />}
                onClick={onSave}
                disabled={isSaving}
                _hover={{
                  backgroundColor: "green.600",
                }}
              >
                Save
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Layout>
    </>
  );
};

export default Profile;
