import { Box, Image, Text, Flex, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { BiBed, BiArea } from "react-icons/bi";

import { Apartment } from "../types";

interface IInfoCard {
  apartment: Apartment;
}

export const InfoCard = ({ apartment }: IInfoCard) => {
  return (
    <Box p="17px 10px 6px 10px">
      <Image borderRadius="5px" w="100%" h="100px" src={apartment.photo} />
      <Box px="3" py="2" m="0.5">
        <Text fontWeight="700" fontSize="14" display="inline">
          {`$ ${apartment.rent}`}
        </Text>

        <Text
          display="inline"
          ml="16"
          fontSize="12"
          fontWeight="bold"
          color={apartment?.available ? "primary" : "red.600"}
        >
          {apartment?.available ? "Available" : "Rented"}
        </Text>

        <Box color="#585757" fontSize="12" mt="2">
          <Flex
            alignItems="center"
            borderRight="1px solid #585757"
            display="inline-flex"
            pr="4"
            h="11px"
          >
            <Text display="inline" mr="3">
              {apartment.rooms}
            </Text>
            <BiBed />
          </Flex>

          <Flex alignItems="center" display="inline-flex" px="4" h="11px">
            <Text display="inline" mr="3">
              {`${apartment.floorArea} m`}
              <sup>2</sup>
            </Text>
            <BiArea />
          </Flex>
        </Box>

        <Link
          as={RouterLink}
          to={`/apartment/${apartment?.id}`}
          fontWeight="bold"
          outline="none"
          pt="3"
          display="inline-block"
          _focus={{
            boxShadow: "none",
          }}
        >
          <Text
            fontWeight="bold"
            lineHeight="0.89"
            fontSize="14px"
            color="#616161"
            mr="2"
          >
            {`${apartment.name} >`}
          </Text>
        </Link>
      </Box>
    </Box>
  );
};
