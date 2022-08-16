import React from "react";
import { Box, SimpleGrid, Center, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";

import { ApartmentFilters } from "./ApartmentFilters";
import { ApartmentCard } from "./ApartmentCard";
import { Apartment } from "../types";
import { RootState } from "../redux";
import { Loader } from "./Loader";

interface IApartmentList {
  name: string;
  setName: (name: string) => void;
  rent: number[];
  setRent: (rent: number[]) => void;
  floorArea: string;
  setFloorArea: (floorArea: string) => void;
  rooms: string;
  setRooms: (rooms: string) => void;
  handleSearchClick: () => Promise<void>;
  handleClearFilters: () => Promise<void>;
  onCardClick: (apartment: Apartment) => void;
  handleNearbyClick: () => Promise<void>;
  isNearbyActive: boolean;
}

export const ApartmentList = React.memo((props: IApartmentList) => {
  const { onCardClick, ...restProps } = props;
  const apartmentsState = useSelector((state: RootState) => state.apartments);
  const { data: apartments, status, selectedApartment } = apartmentsState;
  const isLoading = status === "pending";

  return (
    <Box
      w="100%"
      mt="4"
      px="5"
      maxWidth="930px"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <ApartmentFilters {...restProps} />

      {isLoading ? (
        <Center w="100%" h="100%">
          <Loader size="lg" />
        </Center>
      ) : apartments.length === 0 ? (
        <Center w="100%" h="100%">
          <Text
            data-testid="empty-list-message"
            fontSize="24px"
            fontWeight="700"
          >
            The list is empty.
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={2} spacingY="120px" spacingX="50px">
          {apartments.map((apartment) => (
            <ApartmentCard
              key={apartment.id}
              isSelected={selectedApartment?.id === apartment?.id}
              apartment={apartment}
              onCardClick={onCardClick}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
});
