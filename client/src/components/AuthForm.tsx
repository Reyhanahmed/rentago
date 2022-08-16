import React, { FormEvent } from "react";
import {
  Flex,
  Box,
  Center,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
  Text,
  VStack,
  Link,
  HStack,
  Checkbox,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { PATHS } from "../routes/config";
import { UserCredentials, Role } from "../types";
import BrandLogo from "./BrandLogo";
import { useSelector } from "react-redux";
import { RootState } from "../redux";

interface IAuthForm {
  isSignin?: boolean;
  handleSubmit: (credentials: UserCredentials) => Promise<void>;
}

const AuthForm = ({ handleSubmit, isSignin = false }: IAuthForm) => {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isRealtor, setIsRealtor] = React.useState(false);
  const [errors, setErrors] = React.useState({
    password: "",
  });

  const authState = useSelector((state: RootState) => state.auth);

  const isLoading = authState.status === "pending";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const values: UserCredentials = {
      email,
      password,
    };

    if (!isSignin) {
      if (password.length < 6) {
        return setErrors({
          password: "Password should be mininum 6 characters",
        });
      }
      values.name = `${firstName} ${lastName}`;
      values.role = isRealtor ? Role.realtor : Role.client;
    }
    await handleSubmit(values);
  };

  return (
    <Flex width="25%" flexDirection="column" alignItems="center">
      <BrandLogo />

      <Box mt="4" width="100%" border="1px solid #ddd" px="4" py="8">
        <Center>
          <Heading mb="2" as="h2" size="sm" fontWeight="medium">
            {isSignin ? "Sign in to your account" : "Create an account"}
          </Heading>
        </Center>
        <Center>
          <Text mb="4" fontSize="xs">
            Or,{" "}
            <Link
              color="blue"
              as={RouterLink}
              to={isSignin ? PATHS.signup : PATHS.signin}
            >
              {isSignin ? "create an account" : "sign into your account"}
            </Link>
          </Text>
        </Center>
        <VStack as="form" spacing="8" width="100%" onSubmit={onSubmit}>
          {!isSignin && (
            <HStack width="100%">
              <FormControl isRequired>
                <FormLabel fontSize="sm">First Name</FormLabel>
                <Input
                  autoComplete="off"
                  borderRadius="0"
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Last Name</FormLabel>
                <Input
                  autoComplete="off"
                  borderRadius="0"
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </FormControl>
            </HStack>
          )}
          <FormControl isRequired>
            <FormLabel fontSize="sm">Email</FormLabel>
            <Input
              autoComplete="off"
              borderRadius="0"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.password}>
            <FormLabel fontSize="sm">Password</FormLabel>
            <Input
              borderRadius="0"
              type="password"
              name="password"
              value={password}
              onChange={(e) => {
                setErrors({
                  password: "",
                });
                setPassword(e.target.value);
              }}
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          {!isSignin && (
            <Checkbox
              colorScheme="green"
              size="md"
              checked={isRealtor}
              onChange={(e) => setIsRealtor(e.target.checked)}
            >
              <Text fontSize="sm">I am a realtor</Text>
            </Checkbox>
          )}

          <Button
            borderRadius="0"
            bg="primary"
            color="white"
            w="100%"
            type="submit"
            _hover={{
              bg: "primary",
              color: "white",
            }}
            _active={{
              bg: "green.200",
            }}
            isLoading={isLoading}
          >
            {isSignin ? "Sign In" : "Sign up"}
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default AuthForm;
