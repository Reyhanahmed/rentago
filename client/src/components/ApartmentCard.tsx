import { Box, Image, Text, Flex } from "@chakra-ui/react";
import { BiBed, BiArea } from "react-icons/bi";
import { AiFillEdit } from "react-icons/ai";
import { Link } from "react-router-dom";

import { Apartment } from "../types";

interface IApartmentCard {
  isSelected?: boolean;
  apartment: Apartment;
  onCardClick: (card: Apartment) => void;
}

export const ApartmentCard = ({
  isSelected,
  apartment,
  onCardClick,
}: IApartmentCard) => {
  const { photo, rent, rooms, floorArea, name, address, available, id } =
    apartment;

  const handleCardClick = () => {
    onCardClick(apartment);
  };

  return (
    <Flex
      position="relative"
      flexDirection="column"
      width="350px"
      alignItems="center"
      onClick={handleCardClick}
    >
      <Image
        src={photo}
        outline="none"
        border="none"
        backgroundSize="cover"
        width="350px"
        height="250px"
        borderRadius="5"
      />

      <Box
        position="absolute"
        bg="white"
        bottom="-90px"
        boxShadow="0px 6px 24px -3px rgba(0,0,0,0.43);"
        borderRadius="5"
      >
        <Box
          w="320px"
          px="3"
          py="2"
          m="0.5"
          border={isSelected ? "3px solid #21b074" : "3px solid transparent"}
          borderRadius="5"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontWeight="700" fontSize="18">
              {`$ ${rent}`}
            </Text>
            <Link to={`/apartment/${id}`}>
              <AiFillEdit size="1.3em" cursor="pointer" />
            </Link>
          </Flex>

          <Box color="#585757" fontSize="14" mt="2">
            <Flex
              alignItems="center"
              borderRight="1px solid #585757"
              display="inline-flex"
              pr="4"
              h="11px"
            >
              <Text display="inline" mr="3">
                {rooms}
              </Text>
              <BiBed />
            </Flex>

            <Flex
              alignItems="center"
              borderRight="1px solid #585757"
              display="inline-flex"
              px="4"
              h="11px"
            >
              <Text display="inline" mr="3">
                {`${floorArea} m`}
                <sup>2</sup>
              </Text>
              <BiArea />
            </Flex>

            <Text
              display="inline"
              color={available ? "green.600" : "red.600"}
              ml="4"
              fontWeight="bold"
            >
              {available ? "Available" : "Rented"}
            </Text>
          </Box>

          <Box pt="4">
            <Text fontWeight="bold" lineHeight="0.89" fontSize="18px">
              {name}
            </Text>
            <Text textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
              {address}
            </Text>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};
