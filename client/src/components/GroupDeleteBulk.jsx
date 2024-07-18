import React, { useState } from "react";
import { Dropdown, Button, Text, Toast } from "monday-ui-react-core";

const Column = ({
  existingBoardGroups,
  monday,
  context,
  selectedItem,
  openModal,
  setSelectedItem,
  setModalType,
  modalType,
  boardGroups,
}) => {
  const [error, setError] = useState(false);

  const handleChange = (newSelectedItems) => {
    if (newSelectedItems.length > 5) {
      setError(true);
      return;
    }

    setModalType("Group");
    setSelectedItem(newSelectedItems);
  };

  const handleConfirmDelete = () => {
    openModal();
  };


  return (
    <div>
       <Toast
        open={error}
        type={Toast.types.NEGATIVE}
        onClose={() => setError(false)}
        autoHideDuration={1_500}
        className="monday-storybook-toast_wrapper custom-toast-error"
      >
        You can only select up to 5 groups.
      </Toast>
      <Text type={Text.types.TEXT1}><strong>Select up to 5 groups.</strong></Text>
      <Dropdown
        value={modalType === "Group" ? selectedItem : []}
        placeholder="Select groups to delete"
        multi
        multiline
        onChange={handleChange}
        options={existingBoardGroups}
        className="dropdown-stories-styles_with-chips"
      />

      <Button
        style={{ marginTop: "0.5rem" }}
        disabled={
          (modalType === "Column" ||
          selectedItem.length === 0 )||
          boardGroups?.length === 1
        }
        onClick={handleConfirmDelete}
      >
        Delete Groups
      </Button>
      {boardGroups?.length === 1 && (
        <Text
          type={Text.types.TEXT1}
          weight={Text.weights.BOLD}
          className="error-msg"
          style={{ marginTop: "0.5rem" }}
        >
          You can't delete the last group
        </Text>
      )}
    </div>
  );
};

export default Column;
