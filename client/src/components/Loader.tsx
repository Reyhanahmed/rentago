import React from "react";
import { Center, Spinner } from "@chakra-ui/react";

interface ILoader {
  size?: "sm" | "md" | "lg" | "xl" | "xs";
}

export const Loader: React.FC<ILoader> = ({ size = "md" }) => {
  return (
    <Center width="100%" height="100%">
      <Spinner color="primary" size={size} />
    </Center>
  );
};
