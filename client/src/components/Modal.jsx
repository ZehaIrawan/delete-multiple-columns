import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  Text,
  Heading,
} from "monday-ui-react-core";

const CustomModal = ({
  isModalOpen,
  closeModal,
  selectedItem,
  modalType,
  context,
  setBoardColumns,
  setBoardGroups,
  monday,
  setSelectedItem,
  setIsSuccesfullyDelete,
  setIsDeleting,
}) => {
  const handleDeleteConfirm = () => {
    if (modalType === "Column") {
      handleDeleteColumns();
    } else if (modalType === "Group") {
      handleDeleteGroups();
    }
    closeModal();
  };

  const handleDeleteColumns = async () => {
    try {
      for (const column of selectedItem) {
        const deleteColumnQuery = `
          mutation {
            delete_column(board_id: ${context.boardId}, column_id: "${column.value}") {
              id
            }
          }
        `;

        // Log the query for debugging
        console.log("Deleting column with query:", deleteColumnQuery);
        setIsDeleting(true);

        const response = await monday.api(deleteColumnQuery);

        // Log the response for debugging
        console.log("Delete response:", response);
      }

      // After deleting columns, fetch the updated list of columns
      const boardResponse = await monday.api(`
        query {
          boards(ids: ${context.boardId}) {
            columns {
              id
              title
            }
          }
        }
      `);

      // Log the response for debugging
      console.log("Updated columns:", boardResponse.data.boards[0].columns);

      // Update the local state with the new list of columns
      setBoardColumns(
        boardResponse.data.boards[0].columns.map((column) => ({
          value: column.id,
          label: column.title,
        })),
      );

      setIsDeleting(false);
      setIsSuccesfullyDelete(true);
    } catch (error) {
      console.error("Error deleting columns:", error);
    }

    // after successful remove the deleted from options
  };

  const handleDeleteGroups = async () => {
    try {
      for (const column of selectedGroups) {
        const deleteGroupMutation = `
          mutation {
            delete_group(board_id: ${context.boardId}, column_id: "${column.value}") {
              id
            }
          }
        `;

        // Log the query for debugging
        console.log("Deleting column with query:", deleteGroupMutation);

        const response = await monday.api(deleteGroupMutation);

        // Log the response for debugging
        console.log("Delete response:", response);
      }

      // After deleting columns, fetch the updated list of columns
      const boardResponse = await monday.api(`
        query {
          boards(ids: ${context.boardId}) {
            groups {
              id
              title
            }
          }
        }
      `);

      // Log the response for debugging
      console.log("Updated columns:", boardResponse.data.boards[0].groups);

      // Update the local state with the new list of columns
      setBoardGroups(
        boardResponse.data.boards[0].columns.map((column) => ({
          value: column.id,
          label: column.title,
        })),
      );
    } catch (error) {
      console.error("Error deleting columns:", error);
    }

    // after successful remove the deleted from options
  };

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
          <Text type={Heading.types.h2}>
            {selectedItem.map((column) => column.label).join(", ")}
          </Text>
        </ModalContent>
        <ModalFooter className="modal-footer">
          <Button kind={Button.kinds.SECONDARY} onClick={closeModal}>
            Cancel
          </Button>
          <Button kind={Button.kinds.PRIMARY} onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CustomModal;
