import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";

export const ConfirmationModal = ({
  isOpen,
  isDeleting,
  onClose,
  onDelete,
  prompt,
  header,
}: {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => void;
  prompt: string;
  header: string;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="18px">{prompt}</Text>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="ghost"
            colorScheme="red"
            onClick={onDelete}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
