import {
  Flex,
  Link,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Avatar,
  Text,
  MenuDivider,
  Badge,
} from "@chakra-ui/react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouteLink } from "react-router-dom";
import { ROLE_COLORS, ROLE_LABELS } from "../constants";
import { RootState } from "../redux";
import { logout } from "../redux/slices/auth";
import { PATHS } from "../routes/config";
import { Role } from "../types";
import BrandLogo from "./BrandLogo";

export const Navbar = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const onLogout = () => {
    dispatch(logout());
  };

  return (
    <Flex
      bg="primary"
      height="14"
      alignItems="center"
      justifyContent="space-between"
    >
      <Link
        as={RouteLink}
        to={PATHS.home}
        ml="5"
        _hover={{ textDecoration: "none" }}
      >
        <BrandLogo fontSize="25" color="white" />
      </Link>

      <Flex mr="5" alignItems="center">
        {auth?.data?.role === Role.admin && (
          <Link
            as={RouteLink}
            to={PATHS.users}
            color="white"
            fontWeight="bold"
            mr="5"
          >
            Users
          </Link>
        )}
        {[Role.admin, Role.realtor].includes(auth.data?.role as Role) && (
          <Link
            as={RouteLink}
            to={PATHS.addApartment}
            color="white"
            fontWeight="bold"
            mr="5"
          >
            List a property
          </Link>
        )}
        <Menu>
          <MenuButton
            as={Avatar}
            aria-label="Profile menu"
            size="sm"
            name={auth.data?.name}
            src={auth.data?.photo}
            cursor="pointer"
          />
          <MenuList minW="260px">
            <MenuItem disabled>
              <Flex
                width="100%"
                alignItems="center"
                justifyContent="space-between"
              >
                <Flex flexDirection="column">
                  <Text fontSize="16" fontWeight="bold">
                    {auth.data?.name}
                  </Text>
                  <Text fontSize="14" fontWeight="light">
                    {auth.data?.email}
                  </Text>
                </Flex>
                <Badge
                  height="min-content"
                  colorScheme={ROLE_COLORS[auth.data?.role!]}
                  width="min-content"
                  mt="2"
                >
                  {ROLE_LABELS[auth.data?.role!]}
                </Badge>
              </Flex>
            </MenuItem>
            <MenuDivider />
            <MenuItem
              as={RouteLink}
              to={`/profile`}
              icon={<FiUser size={18} />}
              fontWeight="bold"
            >
              Profile
            </MenuItem>
            <MenuDivider />
            <MenuItem
              icon={<FiLogOut size={18} />}
              fontWeight="bold"
              onClick={onLogout}
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};
