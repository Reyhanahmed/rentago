import React from "react";

import {
  Flex,
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
  VStack,
  Avatar,
  Text,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Link,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { CloseIcon, SearchIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiEdit, BiTrash } from "react-icons/bi";
import ReactPaginate from "react-paginate";
import { Link as RouteLink } from "react-router-dom";

import { Layout } from "../components/Layout";
import { Navbar } from "../components/Navbar";
import { Loader } from "../components/Loader";
import { RootState } from "../redux";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { ITEMS_PER_PAGE, ROLE_COLORS, ROLE_LABELS } from "../constants";
import {
  deleteUser,
  getUsers,
  setSelectedUser as dispatchSelectedUser,
} from "../redux/slices/users";
import { User } from "../types";
import styles from "../components/Paginate.module.css";

const Users = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const usersState = useSelector((state: RootState) => state.users);
  const [search, setSearch] = React.useState("");
  const [hasSearched, setHasSearched] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [page, setPage] = React.useState(0);
  const { onClose, onOpen, isOpen } = useDisclosure();
  const pageCount = usersState.count / ITEMS_PER_PAGE;

  React.useEffect(() => {
    setIsFetching(true);
    dispatch(getUsers());
    setIsFetching(false);
  }, [setIsFetching, dispatch]);

  const handleSearch = () => {
    setHasSearched(true);
    setIsFetching(true);
    dispatch(getUsers(1, search));
    setIsFetching(false);
  };

  const handleReset = async () => {
    setIsFetching(true);
    setHasSearched(false);
    setSearch("");
    await dispatch(getUsers());
    setIsFetching(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await dispatch(deleteUser(selectedUser?.id!));
    setIsDeleting(false);
    setSelectedUser(null);
    onClose();
  };

  const handlePageClick = async (page: { selected: number }) => {
    const { selected } = page;

    await dispatch(getUsers(selected + 1, search));
    setPage(selected);
  };

  const onEditClick = (user: User) => () => {
    dispatch(dispatchSelectedUser(user));
    history.push(`/users/${user.id}`);
  };

  return (
    <>
      <Navbar />
      <Layout>
        <Flex width="50%" mx="auto" mb="6" alignItems="center">
          <InputGroup size="lg" mt="3">
            <Input
              placeholder="Search by name"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />

            <InputRightElement width={hasSearched ? "6rem" : "3rem"}>
              {hasSearched ? (
                <IconButton
                  aria-label="reset"
                  icon={<CloseIcon boxSize="15" />}
                  onClick={handleReset}
                  bg="transparent"
                  mr="2"
                />
              ) : null}
              <IconButton
                aria-label="search"
                icon={<SearchIcon />}
                onClick={handleSearch}
              />
            </InputRightElement>
          </InputGroup>

          <Link
            bg="primary"
            color="white"
            borderRadius="0"
            as={RouteLink}
            to="/add-user"
            width="80px"
            height="40px"
            textAlign="center"
            lineHeight="40px"
            mt="3"
            ml="3"
          >
            Add
          </Link>
        </Flex>
        {isFetching ? (
          <Loader size="lg" />
        ) : (
          <VStack spacing="10">
            {usersState.data.map((user) => (
              <Flex
                key={user.id}
                bg="#f6f6f6"
                width="60%"
                mx="auto"
                borderRadius="6"
                p="4"
                justifyContent="space-between"
              >
                <Flex alignItems="center">
                  <Avatar
                    border="1px solid #f9f9f9"
                    src={user.photo}
                    size="xl"
                    mr="8"
                  />
                  <Flex flexDirection="column">
                    <Text fontSize="18" fontWeight="bold">
                      {user.name}
                    </Text>
                    <Text fontSize="14">{user.email}</Text>
                    <Badge
                      width="min-content"
                      colorScheme={ROLE_COLORS[user.role]}
                      mt="2"
                      fontSize="12"
                    >
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </Flex>
                </Flex>
                <Flex alignItems="center">
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<BsThreeDotsVertical />}
                      aria-label="User options"
                      size="md"
                      cursor="pointer"
                      bg="transparent"
                    />
                    <MenuList>
                      <MenuItem
                        icon={<BiEdit size="18" />}
                        onClick={onEditClick(user)}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        color="red"
                        icon={<BiTrash size="18" color="red" />}
                        onClick={() => {
                          setSelectedUser(user);
                          onOpen();
                        }}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              </Flex>
            ))}
            {pageCount > 1 && usersState.data.length !== 0 && !isFetching && (
              <Flex position="relative" width="60%" mx="auto">
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
                  containerClassName={`${styles.pagination} ${styles.paginate_users}`}
                  activeClassName={styles.active}
                />
              </Flex>
            )}
          </VStack>
        )}
        <ConfirmationModal
          onClose={onClose}
          isOpen={isOpen}
          isDeleting={isDeleting}
          onDelete={handleDelete}
          header="Delete user"
          prompt="Are you sure you want to delete this user?"
        />
      </Layout>
    </>
  );
};

export default Users;
