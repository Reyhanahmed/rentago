import { renderWithProviders } from "../../utils/testUtils";
import ApartmentReducer from "../../redux/slices/apartments";
import AuthReducer from "../../redux/slices/auth";

import Home from "../Home";
import { loggedInUser } from "./mocks/users.mock";
import {
  apartmentsMock,
  getApartmentsResponse,
} from "./mocks/apartmentResponse.mock";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { httpClient } from "../../utils/httpClient";

jest.mock("../../utils/httpClient.ts");

jest.mock("@react-google-maps/api", () => ({
  GoogleMap: () => <div>GoogleMap</div>,
  Marker: () => <div>marker</div>,
  InfoWindow: () => <div>infoWindow</div>,
  Circle: () => <div>circle</div>,
}));

const renderComponent = () =>
  renderWithProviders(Home, {
    initialState: {
      apartments: {
        data: [],
        count: 0,
        status: "idle",
        error: null,
        selectedApartment: null,
      },
      auth: {
        status: "resolved",
        isAuthenticated: true,
        data: loggedInUser,
        error: null,
      },
    },
    reducer: {
      apartments: ApartmentReducer,
      auth: AuthReducer,
    },
  });

describe("Home", () => {
  let getMock: jest.Mock;

  beforeEach(() => {
    getMock = jest.fn(() =>
      Promise.resolve(getApartmentsResponse(apartmentsMock))
    );
    (httpClient.get as jest.Mock) = getMock;
  });

  it("should render", () => {
    renderComponent();
    const nameInput = screen.getByTestId("name-filter");

    expect(nameInput).not.toBeNull();
  });

  describe("when no apartments are available", () => {
    beforeEach(() => {
      (httpClient.get as jest.Mock).mockReturnValue(
        Promise.resolve(getApartmentsResponse([]))
      );
      renderComponent();
    });

    it("should show a message", () => {
      const message = screen.getByTestId("empty-list-message");

      expect(message.textContent).toEqual("The list is empty.");
    });
  });

  describe("when apartments are less than 4", () => {
    let result: ReturnType<typeof renderComponent>;
    beforeEach(() => {
      (httpClient.get as jest.Mock).mockReturnValue(
        Promise.resolve(getApartmentsResponse([]))
      );
      result = renderComponent();
    });

    it("should not show pagination", () => {
      const paginationComponent = result.container.querySelector("ul");

      expect(paginationComponent).toBeNull();
    });
  });

  describe("when apartments are more than 4", () => {
    let result: ReturnType<typeof renderComponent>;
    beforeEach(() => {
      (httpClient.get as jest.Mock).mockReturnValue(
        Promise.resolve(getApartmentsResponse(apartmentsMock))
      );
      result = renderComponent();
    });

    it("should show pagination", () => {
      const paginationComponent = result.container.querySelector("ul");

      expect(paginationComponent).not.toBeNull();
    });

    it("should call api with correct page param when pagination link is clicked", async () => {
      const paginateLinks =
        result.container.getElementsByClassName("paginate-link");

      const secondPage = paginateLinks[1];

      expect(secondPage?.textContent).toEqual("2");

      fireEvent.click(secondPage);

      await waitFor(() => {
        expect((httpClient.get as jest.Mock).mock.calls[1][1]).toMatchObject({
          data: { page: 2 },
        });
      });
    });
  });

  describe("when filters are available", () => {
    beforeEach(() => renderComponent());

    it("should call api with correct filters", async () => {
      const nameFilterInput = screen.getByTestId("name-filter");
      const searchBtn = screen.getByText("Search");

      fireEvent.change(nameFilterInput, { target: { value: "abc" } });

      fireEvent.click(searchBtn);

      await waitFor(() =>
        expect((httpClient.get as jest.Mock).mock.calls[1][1]).toMatchObject({
          data: { name: "abc" },
        })
      );
    });
  });
});
