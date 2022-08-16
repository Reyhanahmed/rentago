import React from "react";
import { Container } from "@chakra-ui/layout";

export const Layout: React.FC<{
  children: React.ReactNode;
  mt?: string;
}> = ({ children, mt = "0" }) => {
  return (
    <Container mt={mt} maxW="container.xl" pb="24">
      {children}
    </Container>
  );
};
