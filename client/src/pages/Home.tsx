import React from "react";
import { Flex } from "@chakra-ui/react";
import ReactPaginate from "react-paginate";

import { ApartmentList } from "../components/ApartmentList";
import { Navbar } from "../components/Navbar";
import { Map } from "../components/Map";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux";
import {
  getApartments,
  setSelectedApartment,
} from "../redux/slices/apartments";
import { ITEMS_PER_PAGE, MAX_PRICE_RANGE } from "../constants";
import { showError } from "../utils/toast";
import { Apartment, Coordinates } from "../types";

import styles from "../components/Paginate.module.css";

const Home = () => {
  const apartmentsState = useSelector((state: RootState) => state.apartments);
  const dispatch = useDispatch();
  const { data, status, count } = apartmentsState;
  const [page, setPage] = React.useState(0);
  const [rent, setRent] = React.useState([0, MAX_PRICE_RANGE]);
  const [rooms, setRooms] = React.useState("");
  const [name, setName] = React.useState("");
  const [currentPos, setCurrentPos] = React.useState<Coordinates | null>(null);
  const [floorArea, setFloorArea] = React.useState("");
  const [isNearbyActive, setIsNearbyActive] = React.useState(false);
  const isLoading = status === "pending";
  const pageCount = count / ITEMS_PER_PAGE;

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  React.useEffect(() => {
    dispatch(getApartments(1));
  }, [dispatch]);

  React.useEffect(() => {
    if (map && apartmentsState?.selectedApartment) {
      const { location } = apartmentsState?.selectedApartment;

      setTimeout(() => {
        map.panTo({
          lat: location?.lat,
          lng: location?.long,
        });
      }, 1200);
    }
  }, [map, apartmentsState?.selectedApartment]);

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(resolve);
      } else {
        reject("Geolocation is not supported by your browser.");
      }
    });
  };

  const getFilters = async () => {
    const parsedFloorArea = Number(floorArea);
    const parsedRooms = Number(rooms);

    if (isNaN(parsedFloorArea)) {
      showError("Floor Area should be in number");
      return;
    }

    if (isNaN(parsedRooms)) {
      showError("Rooms should be in number");
      return;
    }

    let filters = {
      name,
      rent,
      rooms: parsedRooms,
      floorArea: parsedFloorArea,
    };

    if (isNearbyActive) {
      try {
        const position = await getCurrentPosition();
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        setCurrentPos({
          lat,
          long,
        });
        if (map) {
          map.panTo({
            lat: lat,
            lng: long,
          });
        }
        return {
          ...filters,
          lat,
          long,
        };
      } catch (error) {
        showError(error as string);
      }
    }

    return filters;
  };

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onCardClick = (apartment: Apartment) => {
    dispatch(setSelectedApartment(apartment));
    if (map) {
      map?.panTo({
        lat: apartment?.location?.lat,
        lng: apartment?.location?.long,
      });
    }
  };

  const handlePageClick = async (page: { selected: number }) => {
    const { selected } = page;
    const filters = await getFilters();

    if (!filters) return;

    await dispatch(getApartments(selected + 1, filters));
    setPage(selected);
  };

  const handleSearchClick = async () => {
    const filters = await getFilters();

    if (!filters) return;

    setPage(0);
    await dispatch(getApartments(1, filters));
  };

  const handleClearFilters = async () => {
    setName("");
    setRent([0, MAX_PRICE_RANGE]);
    setFloorArea("");
    setRooms("");
    setIsNearbyActive(false);
    setCurrentPos(null);
    await dispatch(getApartments(1));
  };

  const handleNearbyClick = async () => {
    const nearby = !isNearbyActive;
    if (!nearby) {
      setIsNearbyActive(nearby);
      setCurrentPos(null);
      return;
    }

    setIsNearbyActive(nearby);
  };

  return (
    <>
      <Navbar />
      <Flex width="100%">
        <ApartmentList
          {...{
            rent,
            setRent,
            name,
            setName,
            floorArea,
            setFloorArea,
            rooms,
            setRooms,
            handleSearchClick,
            handleClearFilters,
            onCardClick,
            handleNearbyClick,
            isNearbyActive,
          }}
        />
        <Map
          apartments={data}
          onLoad={onLoad}
          onUnmount={onUnmount}
          currentLocation={currentPos}
        />
      </Flex>

      {pageCount > 1 && data.length !== 0 && !isLoading && (
        <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
          breakLabel={"..."}
          pageClassName={styles.pageNumber}
          breakClassName={"break-me"}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          forcePage={page}
          containerClassName={styles.pagination}
          activeClassName={styles.active}
          pageLinkClassName="paginate-link"
        />
      )}
    </>
  );
};

export default Home;
