import React, { useState } from "react";
import { Dropdown, Button } from "monday-ui-react-core";

const Column = ({
  existingBoardColumns,
  monday,
  context,
  setBoardColumns,
  openModal,
  setModalContent,
  setModalType
}) => {
  // https://community.monday.com/t/difficulty-in-deleting-some-columns/47627
  // https://community.monday.com/t/can-you-delete-a-board-column-through-graphql/26976
  // https://community.monday.com/t/ability-to-delete-columns-through-the-api/23359/6
  // after refresh its coming back again
  const [selectedColumns, setSelectedColumns] = useState([]);

  const handleChange = (i) => {
    setSelectedColumns(i);
  };
  
  const handleConfirmDelete = () => {
    setModalContent(selectedColumns.map((column) => column.label).join(', '));
    setModalType('Column');
    openModal();
  };

  const handleDelete = async () => {
    try {
      for (const column of selectedColumns) {
        const deleteColumnQuery = `
          mutation {
            delete_column(board_id: ${context.boardId}, column_id: "${column.value}") {
              id
            }
          }
        `;

        // Log the query for debugging
        console.log("Deleting column with query:", deleteColumnQuery);

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
      alert("Columns deleted successfully!");
    } catch (error) {
      console.error("Error deleting columns:", error);
    }

    // after successful remove the deleted from options
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
        placeholder="Select columns to delete"
        multi
        multiline
        onChange={handleChange}
        // remove mandatory fields from option, ex: name
        options={existingBoardColumns}
        className="dropdown-stories-styles_with-chips"
      />

      {/* need confirmation modal */}
      {/* display loader so user dont navigate away from the page */}
      {/* display success or fail alert */}
      {/* <Button disabled={selectedColumns.length === 0} onClick={handleDelete}>Delete Columns</Button> */}
      <Button
        disabled={selectedColumns.length === 0}
        onClick={handleConfirmDelete}
      >
        Delete Columns
      </Button>
    </div>
  );
};

export default Column;
