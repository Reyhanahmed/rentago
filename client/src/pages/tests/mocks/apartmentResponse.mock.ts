import { Apartment } from "../../../types";
import { loggedInUser, otherUser } from "./users.mock";

export const apartmentsMock = [
  {
    id: 1,
    name: "Another apartment",
    description: "Apartment in new york",
    floorArea: 1100,
    rent: 1400,
    rooms: 2,
    address: "New York, NY, USA",
    photo:
      "https://res.cloudinary.com/reyhanahmed/image/upload/v1631569029/apartment.jpeg.jpg",
    available: true,
    location: {
      lat: 40.7127753,
      long: -74.0059728,
    },
    createdAt: "2021-09-18T10:23:15.014Z",
    updatedAt: "2021-09-18T10:23:15.014Z",
    realtor: loggedInUser,
  },

  {
    id: 2,
    name: "Some apartment",
    description: "Great Apartment",
    floorArea: 800,
    rent: 1000,
    rooms: 1,
    address: "New York, NY, USA",
    photo:
      "https://res.cloudinary.com/reyhanahmed/image/upload/v1631569029/apartment.jpeg.jpg",
    available: true,
    location: {
      lat: 40.7127753,
      long: -74.0059728,
    },
    createdAt: "2021-09-18T10:23:15.014Z",
    updatedAt: "2021-09-18T10:23:15.014Z",
    realtor: otherUser,
  },

  {
    id: 3,
    name: "ABC view",
    description: "Excellent view",
    floorArea: 1700,
    rent: 2500,
    rooms: 3,
    address: "New York, NY, USA",
    photo:
      "https://res.cloudinary.com/reyhanahmed/image/upload/v1631569029/apartment.jpeg.jpg",
    available: true,
    location: {
      lat: 40.7127753,
      long: -74.0059728,
    },
    createdAt: "2021-09-18T10:23:15.014Z",
    updatedAt: "2021-09-18T10:23:15.014Z",
    realtor: otherUser,
  },

  {
    id: 4,
    name: "Manhattan towers",
    description: "Apartment in great neighbourhood",
    floorArea: 2200,
    rent: 3000,
    rooms: 4,
    address: "New York, NY, USA",
    photo:
      "https://res.cloudinary.com/reyhanahmed/image/upload/v1631569029/apartment.jpeg.jpg",
    available: true,
    location: {
      lat: 40.7127753,
      long: -74.0059728,
    },
    createdAt: "2021-09-18T10:23:15.014Z",
    updatedAt: "2021-09-18T10:23:15.014Z",
    realtor: otherUser,
  },

  {
    id: 5,
    name: "Emaar",
    description: "Built by emaar",
    floorArea: 700,
    rent: 900,
    rooms: 2,
    address: "New York, NY, USA",
    photo:
      "https://res.cloudinary.com/reyhanahmed/image/upload/v1631569029/apartment.jpeg.jpg",
    available: true,
    location: {
      lat: 40.7127753,
      long: -74.0059728,
    },
    createdAt: "2021-09-18T10:23:15.014Z",
    updatedAt: "2021-09-18T10:23:15.014Z",
    realtor: otherUser,
  },
];

export const getApartmentsResponse = (apartments: Apartment[]) => {
  return {
    status: "success",
    statusCode: 200,
    data: {
      apartments,
      count: apartments.length,
    },
  };
};
