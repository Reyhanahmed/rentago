import React from "react";
import { Box } from "@chakra-ui/react";
import { GoogleMap, Marker, InfoWindow, Circle } from "@react-google-maps/api";

import { Apartment, Coordinates } from "../types";
import { InfoCard } from "./InfoCard";
import { MAP_CENTER, NEAREST_APARTMENT_RANGE } from "../constants";

interface IMap {
  apartments: Apartment[];
  onLoad: (map: google.maps.Map) => void;
  onUnmount: (map: google.maps.Map) => void;
  currentLocation: Coordinates | null;
}

export const Map = React.memo(
  ({ apartments, onLoad, onUnmount, currentLocation }: IMap) => {
    const [selectedMarker, setSelectedMarker] = React.useState<
      number | undefined
    >();

    const onMarkerClick = (id: number) => {
      setSelectedMarker(id);
    };

    const onInfoWindowCloseClick = () => {
      setSelectedMarker(undefined);
    };

    return (
      <Box w="100%">
        <GoogleMap
          zoom={11}
          center={MAP_CENTER}
          mapContainerStyle={{ height: `calc(100vh - 56px)`, width: "100%" }}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {currentLocation ? (
            <>
              <Circle
                // optional
                center={{
                  lat: currentLocation.lat,
                  lng: currentLocation.long,
                }}
                radius={NEAREST_APARTMENT_RANGE}
                options={{
                  strokeColor: "#FF0000",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: "#FF0000",
                  fillOpacity: 0.35,
                  clickable: false,
                  draggable: false,
                  editable: false,
                  visible: true,
                  radius: NEAREST_APARTMENT_RANGE,
                  zIndex: 1,
                }}
              />
              <Marker
                key={"currentLocation"}
                position={{
                  lat: currentLocation.lat,
                  lng: currentLocation.long,
                  // lat: 40.844248,
                  // lng: -73.938828,
                }}
                icon={{
                  path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
                  fillColor: "#4285f4",
                  fillOpacity: 1.0,
                  strokeWeight: 3,
                  scale: 0.5,
                  strokeColor: "white",
                  // strokeOpacity: 0.4,
                }}
              />
            </>
          ) : null}
          {apartments.map((apartment) => {
            const { location, id, available } = apartment;
            return (
              <Marker
                key={id}
                position={{
                  lat: location.lat,
                  lng: location.long,
                }}
                icon={{
                  path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
                  fillColor: available ? "#2F855A" : "#C53030",
                  fillOpacity: 1.0,
                  strokeWeight: 12,
                  scale: 0.8,
                  strokeColor: available ? "#2F855A" : "#C53030",
                  strokeOpacity: 0.4,
                }}
                onClick={() => onMarkerClick(id)}
              >
                {selectedMarker === id && (
                  <InfoWindow
                    key={id}
                    onCloseClick={onInfoWindowCloseClick}
                    position={{
                      lat: location.lat,
                      lng: location.long,
                    }}
                  >
                    <InfoCard apartment={apartment} />
                  </InfoWindow>
                )}
              </Marker>
            );
          })}
        </GoogleMap>
      </Box>
    );
  }
);
