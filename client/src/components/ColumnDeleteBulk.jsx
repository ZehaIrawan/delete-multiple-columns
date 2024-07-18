import React, { useState } from "react";
import { Dropdown, Button, Text,Toast } from "monday-ui-react-core";

const Column = ({
  existingBoardColumns,
  openModal,
  setSelectedItem,
  setModalType,
  selectedItem,
  modalType,
}) => {
  const [error, setError] = useState(false);

  const handleChange = (newSelectedItems) => {
    if (newSelectedItems.length > 5) {
      setError(true);
      return;
    }

    setModalType("Column");
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
        You can only select up to 5 columns.
      </Toast>

      <Text type={Text.types.TEXT1}><strong>Select up to 5 columns.</strong></Text>
      <Dropdown
        value={modalType === "Column" ? selectedItem : []}
        placeholder="Select columns to delete"
        multi
        multiline
        onChange={handleChange}
        options={existingBoardColumns}
        className="dropdown-stories-styles_with-chips"
      />

      <Button
        style={{ marginTop: "0.5rem" }}
        disabled={modalType === "Group" || selectedItem.length === 0}
        onClick={handleConfirmDelete}
      >
        Delete Columns
      </Button>
    </div>
  );
};

export default Column;
