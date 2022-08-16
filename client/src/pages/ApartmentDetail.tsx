import React from "react";
import { Image, Box, Flex, Text, Link, Button, Center } from "@chakra-ui/react";
import { Link as RouterLink, useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { format, parseISO } from "date-fns";

import { Navbar } from "../components/Navbar";
import { Loader } from "../components/Loader";
import { RootState } from "../redux";
import {
  getApartmentDetails,
  updateApartment,
  deleteApartment,
  setSelectedApartment,
} from "../redux/slices/apartments";
import { PATHS } from "../routes/config";
import { Role } from "../types";

const ApartmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [isFetching, setIsFetching] = React.useState(true);
  const dispatch = useDispatch();
  const apartmentDetails = useSelector(
    (state: RootState) => state.apartments.selectedApartment
  );
  const user = useSelector((state: RootState) => state.auth.data);

  React.useEffect(() => {
    const fetchRestaurant = async (id: string) => {
      await dispatch(getApartmentDetails(id));
      setIsFetching(false);
    };
    fetchRestaurant(id);
  }, [id, dispatch]);

  const onAvailabilityClick = async () => {
    await dispatch(
      updateApartment(id, {
        available: !apartmentDetails?.available,
      })
    );

    history.push(PATHS.home);
  };

  const onApartmentDelete = async () => {
    await dispatch(deleteApartment(id));

    history.push(PATHS.home);
    dispatch(setSelectedApartment(null));
  };

  return (
    <>
      <Navbar />

      {isFetching ? (
        <Loader size="lg" />
      ) : !apartmentDetails ? (
        <Center w="100%" h="100%">
          <Flex flexDirection="column" alignItems="center">
            <Text fontSize="24px" fontWeight="bold" mb="5">
              Apartment not found!
            </Text>
            <Button
              bg="primary"
              fontWeight="bold"
              color="white"
              borderRadius="0"
              w="100px"
              onClick={() => history.push("/")}
            >
              Home
            </Button>
          </Flex>
        </Center>
      ) : (
        <Box mt="4">
          <Image
            width="1020px"
            height="500px"
            mx="auto"
            src={apartmentDetails?.photo}
          />

          <Flex
            width="80%"
            mx="auto"
            mt="6"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Flex alignItems="center">
                <Text fontSize="48px" fontWeight="bold">
                  {apartmentDetails?.name}
                </Text>
                <Text ml="7" fontSize="18px" fontWeight="bold">
                  {format(
                    parseISO(apartmentDetails?.createdAt as string),
                    "do LLLL, yyyy"
                  )}
                </Text>
              </Flex>
              <Text fontSize="24px">{apartmentDetails?.address}</Text>
            </Box>

            {(user?.role === Role.admin ||
              apartmentDetails?.realtor?.id === user?.id) && (
              <Flex alignItems="center">
                <Link
                  as={RouterLink}
                  to={`/edit-apartment/${apartmentDetails?.id}`}
                  bg="primary"
                  px="6"
                  py="2"
                  color="white"
                  fontWeight="bold"
                  mr="4"
                >
                  Edit
                </Link>
                <Button
                  bg="transparent"
                  border={
                    apartmentDetails?.available
                      ? "1px solid #21b074"
                      : "1px solid #C53030"
                  }
                  color={apartmentDetails?.available ? "primary" : "red.600"}
                  borderRadius="0"
                  mr="4"
                  onClick={onAvailabilityClick}
                >
                  {apartmentDetails?.available ? "Available" : "Rented"}
                </Button>
                <Button
                  bg="red.600"
                  color="white"
                  fontWeight="bold"
                  borderRadius="0"
                  onClick={onApartmentDelete}
                >
                  Delete
                </Button>
              </Flex>
            )}
          </Flex>

          <Flex
            width="80%"
            mx="auto"
            justifyContent="space-between"
            alignItems="flex-start"
            mt="5"
          >
            <Text width="50%" fontSize="18px">
              {apartmentDetails?.description}
            </Text>

            <Flex border="1px solid #ddd" borderRadius="5" py="6" px="8">
              <Box px="7" borderRight="1px solid #ddd">
                <Text fontSize="20px" fontWeight="light">
                  Monthly Rent
                </Text>
                <Text fontSize="26px" fontWeight="bold">
                  $ {apartmentDetails?.rent}
                </Text>
              </Box>

              <Box px="7" borderRight="1px solid #ddd">
                <Text fontSize="20px" fontWeight="light">
                  Rooms
                </Text>
                <Text fontSize="26px" fontWeight="bold">
                  {apartmentDetails?.rooms} Rooms
                </Text>
              </Box>

              <Box px="7">
                <Text fontSize="20px" fontWeight="light">
                  Square Feet
                </Text>
                <Text fontSize="26px" fontWeight="bold">
                  {apartmentDetails?.floorArea} sq ft
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Box>
      )}
    </>
  );
};

export default ApartmentDetail;
