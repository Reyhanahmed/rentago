import React from "react";
import {
  Text,
  Flex,
  Box,
  Button,
  Input,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Image,
  Textarea,
  Select,
} from "@chakra-ui/react";
import GooglePlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-google-places-autocomplete";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { MdAddCircleOutline, MdSave } from "react-icons/md";

import { Layout } from "../components/Layout";
import { Navbar } from "../components/Navbar";
import { Loader } from "../components/Loader";
import { Role } from "../types";
import { RootState } from "../redux";
import { checkIfEmpty } from "../utils/checkIfEmpty";
import { showError } from "../utils/toast";
import { httpClient } from "../utils/httpClient";
import {
  addApartment,
  getApartmentDetails,
  updateApartment,
} from "../redux/slices/apartments";
import { getUsers } from "../redux/slices/users";

interface Values {
  name: string;
  address?: string;
  description: string;
  rooms: string;
  floorArea: string;
  rent: string;
  realtorId?: string;
}

const ApartmentForm = () => {
  const authState = useSelector((state: RootState) => state.auth);
  const apartmentsState = useSelector((state: RootState) => state.apartments);
  const usersState = useSelector((state: RootState) => state.users);
  const isAdmin = authState?.data?.role === Role.admin;
  const isLoading = apartmentsState.status === "pending";
  const dispatch = useDispatch();
  const history = useHistory();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [photo, setPhoto] = React.useState("");
  const [addressInput, setAddressInput] = React.useState("");
  const [address, setAddress] = React.useState<any>(null);
  const [rooms, setRooms] = React.useState("");
  const [floorArea, setFloorArea] = React.useState("");
  const [rent, setRent] = React.useState("");
  const [realtorId, setRealtorId] = React.useState("");
  const [isUpdatingPhoto, setIsUpdatingPhoto] = React.useState(false);
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  React.useEffect(() => {
    if (usersState.data.length === 0 && authState.data?.role === Role.admin) {
      dispatch(getUsers(1));
    }
  }, [dispatch, authState.data, usersState.data]);

  React.useEffect(() => {
    const setInitialState = async () => {
      const matchedApartment = apartmentsState.selectedApartment;
      const status = apartmentsState.status;

      if (isEditing && !matchedApartment) {
        if (authState.isAuthenticated) {
          if (status !== "rejected") {
            await dispatch(getApartmentDetails(id));
          } else {
            history.push("/");
          }
        } else {
          history.push("/signin");
        }
      }

      if (isEditing && matchedApartment) {
        setName(matchedApartment?.name!);
        setDescription(matchedApartment?.description!);
        setPhoto(matchedApartment?.photo!);
        setAddressInput(matchedApartment?.address!);
        setRooms(matchedApartment?.rooms?.toString()!);
        setFloorArea(matchedApartment?.floorArea?.toString()!);
        setRent(matchedApartment?.rent?.toString()!);
        setRealtorId(matchedApartment?.realtor?.id?.toString()!);
      }
    };

    setInitialState();
  }, [
    isEditing,
    history,
    apartmentsState.selectedApartment,
    apartmentsState.status,
    id,
    authState.isAuthenticated,
    dispatch,
  ]);

  const [errors, setErrors] = React.useState<Values>({
    name: "",
    address: "",
    description: "",
    rooms: "",
    floorArea: "",
    rent: "",
    realtorId: "",
  });

  const onApartmentPhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    try {
      setIsUpdatingPhoto(true);
      const file = e.target.files && e.target.files[0];

      if (!file) {
        setIsUpdatingPhoto(false);
        return;
      }

      const formData = new FormData();
      formData.append("photo", file);

      const res = await httpClient.post("/apartments/photo", {
        data: formData,
      });

      if (res.status === "success") {
        setPhoto(res.data);
      } else {
        showError(res.data[0] || "Something went wrong");
      }
      setIsUpdatingPhoto(false);
    } catch (error) {}
  };

  const onAddressChange = (value: any) => {
    setAddress(value);
  };

  const onSave = async () => {
    let valuesToCheck: Values = {
      name,
      description,
      rooms,
      floorArea,
      rent,
    };

    if (!isEditing) {
      valuesToCheck = {
        ...valuesToCheck,
        address: address?.label,
      };
    }

    if (isAdmin) {
      valuesToCheck = {
        ...valuesToCheck,
        realtorId,
      };
    }

    const emptyFields = checkIfEmpty(valuesToCheck);

    if (emptyFields) {
      setErrors(emptyFields);
      return;
    }

    if (isEditing) {
      let loc;
      if (address) {
        const results = await geocodeByAddress(address.label);
        loc = await getLatLng(results[0]);
      }

      await dispatch(
        updateApartment(id, {
          name,
          description,
          rooms: Number(rooms),
          floorArea: Number(floorArea),
          rent: Number(rent),
          address: address && address?.label ? address?.label : undefined,
          photo: photo ? photo : undefined,
          realtorId: isAdmin ? Number(realtorId) : undefined,
          location:
            address && address?.label
              ? {
                  lat: loc?.lat as number,
                  long: loc?.lng as number,
                }
              : undefined,
        })
      );

      history.push("/");

      return;
    }

    const results = await geocodeByAddress(address.label);
    const { lat, lng } = await getLatLng(results[0]);

    await dispatch(
      addApartment({
        address: address.label,
        description,
        floorArea: Number(floorArea),
        rent: Number(rent),
        rooms: Number(rooms),
        name,
        photo: photo ? photo : undefined,
        realtorId: isAdmin ? Number(realtorId) : undefined,
        location: {
          lat,
          long: lng,
        },
      })
    );

    history.push("/");
  };

  return (
    <>
      <Navbar />

      <Layout mt="4">
        <Flex alignItems="center" flexDirection="column">
          <Text fontSize="36" mb="8">
            {false ? "Edit Apartment" : "Add Apartment"}
          </Text>
          <Box
            as="label"
            width="60%"
            height="330px"
            borderRadius="0"
            border="1px dashed #ddd"
            position="relative"
            overflow="hidden"
            cursor="pointer"
            display="flex"
            alignItems="center"
            justifyContent="center"
            htmlFor="apartment-photo"
            mb="6"
          >
            {!isUpdatingPhoto && (
              <Box position="absolute">
                <MdAddCircleOutline size="3em" color="#ddd" />
              </Box>
            )}
            <Image
              outline="none"
              border="none"
              src={photo}
              backgroundSize="cover"
              w="100%"
              height="330px"
              zIndex="2"
            />
            {isUpdatingPhoto && (
              <Box
                bg="white"
                opacity="0.7"
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
              >
                <Loader size="lg" />
              </Box>
            )}
          </Box>
          <Input
            hidden
            type="file"
            id="apartment-photo"
            disabled={isUpdatingPhoto || isLoading}
            onChange={onApartmentPhotoChange}
          />

          <Flex w="70%" flexDirection="column">
            <Flex justifyContent="space-between" alignItems="center">
              <FormControl isRequired mb="4" w="49%" isInvalid={!!errors.name}>
                <FormLabel fontWeight="bold">Name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl
                isRequired
                mb="4"
                w="49%"
                isInvalid={!!errors.address}
              >
                <FormLabel fontWeight="bold">Address</FormLabel>
                <GooglePlacesAutocomplete
                  onLoadFailed={(error) => {}}
                  autocompletionRequest={{
                    componentRestrictions: {
                      country: ["us"],
                    },
                    types: ["geocode"],
                  }}
                  debounce={500}
                  minLengthAutocomplete={3}
                  selectProps={{
                    styles: {
                      control: (provided: any) => ({
                        ...provided,
                        width: "100%",
                      }),
                    },
                    isClearable: true,
                    onChange: onAddressChange,
                    inputValue: addressInput,
                    onInputChange: (value: string) => setAddressInput(value),
                  }}
                />
                <FormErrorMessage>{errors.address}</FormErrorMessage>
              </FormControl>
            </Flex>

            <FormControl isRequired mb="4" isInvalid={!!errors.description}>
              <FormLabel fontWeight="bold">Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please write a brief description"
                resize="none"
              />
              <FormErrorMessage>{errors.description}</FormErrorMessage>
            </FormControl>

            <Flex justifyContent="space-between" alignItems="center">
              <FormControl isRequired mb="4" w="49%" isInvalid={!!errors.rooms}>
                <FormLabel fontWeight="bold">Rooms</FormLabel>
                <Input
                  type="number"
                  name="rooms"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                />
                <FormErrorMessage>{errors.rooms}</FormErrorMessage>
              </FormControl>

              <FormControl
                isRequired
                mb="4"
                w="49%"
                isInvalid={!!errors.floorArea}
              >
                <FormLabel fontWeight="bold">Floor Area in sq. ft.</FormLabel>
                <Input
                  type="number"
                  name="floorArea"
                  value={floorArea}
                  onChange={(e) => setFloorArea(e.target.value)}
                />
                <FormErrorMessage>{errors.floorArea}</FormErrorMessage>
              </FormControl>
            </Flex>

            <FormControl isRequired mb="4" isInvalid={!!errors.rent}>
              <FormLabel fontWeight="bold">Rent</FormLabel>
              <Input
                type="number"
                name="rent"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
              />
              <FormErrorMessage>{errors.rent}</FormErrorMessage>
            </FormControl>

            {isAdmin ? (
              <FormControl isRequired mb="6" isInvalid={!!errors.realtorId}>
                <FormLabel fontWeight="bold">Realtor</FormLabel>
                <Select
                  value={realtorId}
                  onChange={(e) => setRealtorId(e.target.value)}
                >
                  <>
                    <option key={-1} value={""}></option>
                    {usersState.data
                      .filter((user) => user?.role === Role.realtor)
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                  </>
                </Select>
                <FormErrorMessage>{errors.realtorId}</FormErrorMessage>
              </FormControl>
            ) : null}
          </Flex>

          <Button
            leftIcon={<MdSave />}
            bg="primary"
            disabled={isLoading}
            onClick={onSave}
            _hover={{
              backgroundColor: "green.600",
            }}
          >
            Save
          </Button>
        </Flex>
      </Layout>
    </>
  );
};

export default ApartmentForm;
