import { Center } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router";

import AuthForm from "../components/AuthForm";
import { RootState } from "../redux";
import { signup } from "../redux/slices/auth";
import { PATHS } from "../routes/config";
import { UserCredentials } from "../types";

const Signup = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (signupPayload: UserCredentials) => {
    await dispatch(signup(signupPayload));
  };

  if (authState.isAuthenticated) {
    return <Redirect to={PATHS.home} />;
  }

  return (
    <Center h="100%" w="100%" flexDirection="column">
      <AuthForm handleSubmit={handleSubmit} />
    </Center>
  );
};

export default Signup;
