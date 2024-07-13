import React, { useState } from "react";
import { Dropdown, Button, Text } from "monday-ui-react-core";

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
  // https://community.monday.com/t/difficulty-in-deleting-some-columns/47627
  // https://community.monday.com/t/can-you-delete-a-board-column-through-graphql/26976
  // https://community.monday.com/t/ability-to-delete-columns-through-the-api/23359/6
  // after refresh its coming back again

  const handleChange = (i) => {
    setModalType("Group");
    setSelectedItem(i);
  };

  const handleConfirmDelete = () => {
    openModal();
  };

  // Name
  //   error_message: "Cannot delete mandatory column", error_code: "DeleteMandatoryColumnException",…}
  // account_id
  // :
  // 19545076
  // error_code
  // :
  // "DeleteMandatoryColumnException"
  // error_data
  // :
  // {resource_type: "column", column_id: "name", board_id: 1864968034}
  // error_message
  // :
  // "Cannot delete mandatory column"
  // status_code
  // :
  // 200

  // utility_vendor-e3becd67de5320beb968.js:2 There was an error in response from monday.com graphql API:  [{"message":"Field 'delete_column' has an argument conflict: {board_id:\"1864968034\",column_id:\"\\\"parameters753\\\"\"} or {board_id:\"1864968034\",column_id:\"\\\"name\\\"\"}?","locations":[{"line":4,"column":3},{"line":9,"column":3}],"path":[],"extensions":{"code":"fieldConflict","fieldName":"delete_column","conflicts":"{board_id:\"1864968034\",column_id:\"\\\"parameters753\\\"\"} or {board_id:\"1864968034\",column_id:\"\\\"name\\\"\"}"}}]

  // The error indicates that the GraphQL API does not support multiple operations with conflicting arguments in a single mutation request. Therefore, batching deletions in the way previously suggested will not work. Instead, you can send multiple independent mutation requests within a single await call using a promise-based approach to avoid sending multiple separate API calls sequentially.

  return (
    <div>
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
