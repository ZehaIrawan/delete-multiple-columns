import React, { useEffect, useState } from "react";
import { Checkbox, Text, Flex } from "monday-ui-react-core";

const PersonProfileSettings = ({
  checkedItems,
  setCheckedItems,
  mustHaveColumn,
}) => {
  useEffect(() => {
    localStorage.setItem("personProfileSettings", JSON.stringify(checkedItems));
  }, [checkedItems]);

  const handleCheckboxChange = (value) => {
    setCheckedItems((prev) => ({
      ...prev,
      [value]: !prev[value],
    }));
  };

  return (
    <Flex
      gap={Flex.gaps.SMALL}
      direction={Flex.directions.COLUMN}
      align={Flex.align.START}
    >
      <Text type={Text.types.TEXT1}>
        Cost: <strong>1</strong> credit per profile data lookup
      </Text>

      <Text type={Text.types.TEXT1}>
        Profile fields you want to save to monday.com board columns
      </Text>

      <div className="checkbox-grid">
        {mustHaveColumn.map((column) => (
          <Checkbox
            key={column.value}
            label={column.label}
            checked={checkedItems[column.value]}
            onChange={() => handleCheckboxChange(column.value)}
          />
        ))}
      </div>
    </Flex>
  );
};

export default PersonProfileSettings;
