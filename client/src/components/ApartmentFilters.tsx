import {
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuList,
  Text,
  MenuItem,
  Select,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { VscTrash } from "react-icons/vsc";
import { BiCurrentLocation } from "react-icons/bi";

import { Slider } from "../components/Slider";
import { MAX_PRICE_RANGE } from "../constants";

interface IApartmentFilter {
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
  handleNearbyClick: () => Promise<void>;
  isNearbyActive: boolean;
}

export const ApartmentFilters = ({
  name,
  setName,
  rent,
  setRent,
  floorArea,
  setFloorArea,
  rooms,
  setRooms,
  handleSearchClick,
  handleClearFilters,
  handleNearbyClick,
  isNearbyActive,
}: IApartmentFilter) => {
  return (
    <Flex mb="6">
      <Input
        outline="1px solid #21b074"
        placeholder="Search by name"
        width="200px"
        borderRadius="0"
        color="primary"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        data-testid="name-filter"
      />

      <Menu closeOnSelect={false}>
        <MenuButton
          as={Text}
          border="1px solid #21b074"
          color="primary"
          cursor="pointer"
          textAlign="center"
          fontSize="14px"
          display="grid"
          placeItems="center"
          px="2"
          ml="5"
          h="40px"
          width="120px"
        >
          {`$${rent[0]} - $${rent[1]}`}
        </MenuButton>
        <MenuList minW="400px">
          <MenuItem h="70px" _active={{ bg: "white" }} _focus={{ bg: "white" }}>
            <Slider
              min={0}
              max={MAX_PRICE_RANGE}
              values={rent}
              setValues={(value) => {
                setRent(value);
              }}
            />
          </MenuItem>
        </MenuList>
      </Menu>

      <Select
        value={rooms}
        onChange={(e) => {
          setRooms(e.target.value);
        }}
        placeholder="Rooms"
        outline="1px solid #21b074"
        borderRadius="0"
        width="120px"
        color="primary"
        ml="5"
      >
        <option value="1">1 Room</option>
        <option value="2">2 Rooms</option>
        <option value="3">3 Rooms</option>
        <option value="4">4+ Rooms</option>
      </Select>

      <Input
        ml="5"
        outline="1px solid #21b074"
        placeholder="Area by sq. ft."
        width="130px"
        borderRadius="0"
        color="primary"
        type="number"
        value={floorArea}
        onChange={(e) => setFloorArea(e.target.value)}
      />

      <Button
        bg="primary"
        color="white"
        borderRadius="0"
        ml="5"
        onClick={handleSearchClick}
      >
        Search
      </Button>

      <IconButton
        variant="outline"
        colorScheme="teal"
        aria-label="Clear Filters"
        fontSize="20px"
        borderRadius="0"
        icon={<VscTrash />}
        ml="5"
        onClick={handleClearFilters}
      />

      <IconButton
        variant="outline"
        colorScheme="teal"
        aria-label="Nearby"
        fontSize="20px"
        borderRadius="0"
        bg={isNearbyActive ? "primary" : "white"}
        color={isNearbyActive ? "white" : "primary"}
        icon={<BiCurrentLocation />}
        ml="5"
        onClick={handleNearbyClick}
        _hover={{
          backgroundColor: isNearbyActive ? "#21b074" : "white",
          color: isNearbyActive ? "white" : "#21b074",
        }}
      />
    </Flex>
  );
};
