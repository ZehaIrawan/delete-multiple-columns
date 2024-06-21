import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  Text,
  Heading
} from "monday-ui-react-core";

const CustomModal = ({ isModalOpen, closeModal,modalContent,modalType }) => {
  return (
    <div>
      <Modal
        show={isModalOpen}
        contentSpacing
        id="story-book-modal"
        onClose={closeModal}
        title={`Delete this ${modalType}?`}
        triggerElement={null}
        width={"700px"}
      >
        <ModalContent>
          <Text type={Heading.types.h2}>{modalContent}</Text>
        </ModalContent>
        <ModalFooter className="modal-footer">
          <Button kind={Button.kinds.SECONDARY} onClick={closeModal}>
            Cancel
          </Button>
          <Button kind={Button.kinds.PRIMARY} onClick={closeModal}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CustomModal;
