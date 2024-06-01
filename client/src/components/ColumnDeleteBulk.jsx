import React from "react";
import { Dropdown } from "monday-ui-react-core";

const Column = ({ existingBoardColumns }) => {
  const handleChange = (i) => {
    console.log(i, "i");
  };

  return (
    <div>
      <Dropdown
        multi
        multiline
        onChange={handleChange}
        options={existingBoardColumns}
        className="dropdown-stories-styles_with-chips"
      />
    </div>
  );
};

export default Column;
