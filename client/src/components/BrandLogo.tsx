import { Text } from "@chakra-ui/react";

interface IBrandLogo {
  fontSize?: string;
  color?: string;
}

const BrandLogo = ({ fontSize = "40", color = "primary" }: IBrandLogo) => (
  <Text fontWeight={700} fontFamily="logo" color={color} fontSize={fontSize}>
    rentago
  </Text>
);

export default BrandLogo;
