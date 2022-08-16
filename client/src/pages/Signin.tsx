import React from "react";
import { Center } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router";

import AuthForm from "../components/AuthForm";
import { UserCredentials } from "../types";
import { signin } from "../redux/slices/auth";
import { RootState } from "../redux";
import { PATHS } from "../routes/config";

const Signin = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const handleSubmit = async ({ email, password }: UserCredentials) => {
    await dispatch(signin({ email, password }));
  };

  if (authState.isAuthenticated) {
    return <Redirect to={PATHS.home} />;
  }

  return (
    <Center h="100%" w="100%" flexDirection="column">
      <AuthForm isSignin handleSubmit={handleSubmit} />
    </Center>
  );
};

export default Signin;
