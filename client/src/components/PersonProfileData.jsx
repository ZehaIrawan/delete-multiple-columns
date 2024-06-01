import React, { useState } from "react";
import { Text, TextField, Button, Tooltip } from "monday-ui-react-core";
import { getProfileDataCost } from "../utils/constant";

const PersonProfileData = ({
  handleGetProfileData,
  checkedItems,
  isLoading,
  activeTabId,
  userData,
}) => {
  const [personURL, setPersonURL] = useState("");

  const hasTrueValue = Object.values(checkedItems).some(
    (value) => value === true,
  );

  return (
    <div>
      <Text color={Text.colors.SECONDARY} type={Text.types.TEXT2}>
        Person Profile
      </Text>
      <TextField
        placeholder="Example : https://www.linkedin.com/in/williamhgates/"
        size={TextField.sizes.MEDIUM}
        onChange={(value) => setPersonURL(value)}
      />
      <Button
        disabled={
          !personURL ||
          !hasTrueValue ||
          userData.credits - getProfileDataCost < 0
        }
        onClick={() => handleGetProfileData(personURL)}
        style={{ marginTop: "0.5rem" }}
        variant="filled"
        loading={isLoading}
      >
        Get Person Profile data
        {(!personURL || !hasTrueValue) && activeTabId === 1 && (
          <div
            className="monday-storybook-tooltip_overview"
            style={{ position: "relative", right: "50%", top: "20px" }}
          >
            <Tooltip
              position={Tooltip.positions.BOTTOM}
              content="Please check at least 1 field & type in the URL"
              shouldShowOnMount
              withMaxWidth
            >
              <div />
            </Tooltip>
          </div>
        )}
      </Button>

      {isLoading && (
        <Text type={Text.types.TEXT1}>
          Please stay on the page while saving the data, you may lose the data
          if you navigate away.
        </Text>
      )}
    </div>
  );
};

export default PersonProfileData;
