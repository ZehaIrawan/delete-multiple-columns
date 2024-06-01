import { useState, useRef, useEffect } from "react";
import {
  Text,
  TextField,
  Button,
  Dropdown,
  Tooltip,
} from "monday-ui-react-core";
import countries from "../data/countriesISO";
import personLookup from "../data/personLookup";
import { decreaseUserCredit } from "../utils/api";
import { searchProfileCost } from "../utils/constant";

const SearchProfile = ({
  boardColumns = [],
  context,
  monday,
  findDynamicColumnId,
  activeTabId,
  isLoading,
  setIsSavingLead,
  setIsLoadingSaving,
  userData,
  setUserData,
}) => {
  const [city, setCity] = useState(null);
  const [country, setCountry] = useState(null);
  const [role, setRole] = useState(null);

  const handleProfileSearch = async () => {
    setIsLoadingSaving(true);
    // API CALL
    const params = new URLSearchParams({
      current_role_title: role,
      city: city,
      country: country,
    });

    if (userData.credits - searchProfileCost >= 0) {
      const response = await fetch(`/person_search?${params.toString()}`);
      const data = await response.json();

      const res = data.results;

      for (const profile of res) {
        await handleSave(profile.linkedin_profile_url);
      }

      const decrease = await decreaseUserCredit(
        `${context.account.id}-linked-turbo`,
        searchProfileCost,
      );

      setUserData((prev) => {
        return { ...prev, credits: decrease.credits };
      });
    }
  };

  const createdColumnsRef = useRef([]);

  useEffect(() => {
    createdColumnsRef.current = [...boardColumns];
  }, [boardColumns]);

  const handleSave = async (linkedin_profile_url) => {
    const selectedFields = ["linkedin_profile_url", "parameters"];

    async function createColumn(columnName) {
      console.log(`Creating column "${columnName}"...`);

      const columnQuery = `
        mutation {
          create_column(
            board_id: ${context.boardId},
            title: "${columnName}",
            column_type: text
          ) {
            id
            title
          }
        }
      `;

      try {
        const res = await monday.api(columnQuery);
        console.log(`Created column: ${res.data.create_column.id}`);
        createdColumnsRef.current.push(res.data.create_column.id);
        return res.data.create_column.id;
      } catch (err) {
        console.error(`Error creating column "${columnName}":`, err);
        throw err;
      }
    }

    try {
      const missingColumns = selectedFields.filter(
        (column) =>
          !createdColumnsRef.current.some((createdColumn) =>
            createdColumn.includes(column),
          ),
      );

      if (missingColumns.length > 0) {
        const createColumnPromises = missingColumns.map((column) =>
          createColumn(column),
        );

        await Promise.all(createColumnPromises);
      }

      const columnData = {
        linkedin_profile_url,
        parameters: JSON.stringify({
          role,
          city,
          country: countries.find((c) => c.value === country).label,
        }),
      };

      let columnValues = {};
      for (const [key, value] of Object.entries(columnData)) {
        const columnId = findDynamicColumnId(key, createdColumnsRef.current);
        if (columnId) {
          columnValues[columnId] = value;
        }
      }

      const columnValuesString = JSON.stringify(columnValues)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"');

      const itemQuery = `
        mutation {
          create_item(
            item_name: "Profile Search",
            board_id: ${context.boardId},
            column_values: "${columnValuesString}"
          ) {
            id
          }
        }
      `;

      await monday.api(itemQuery);
      setIsLoadingSaving(false);
      setIsSavingLead(true);
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      monday.execute("valueCreatedForUser");
    }
  };

  return (
    <div>
      <TextField
        placeholder="Person Role"
        onChange={(event) => setRole(event)}
        size={TextField.sizes.MEDIUM}
      />
      <Text color={Text.colors.SECONDARY} type={Text.types.TEXT2}>
        Example: CTO, Product Manager, CFO
      </Text>
      <br />
      <TextField
        placeholder="City"
        onChange={(event) => setCity(event)}
        size={TextField.sizes.MEDIUM}
      />
      <Text color={Text.colors.SECONDARY} type={Text.types.TEXT2}>
        Example: San Francisco, Los Angeles, New York
      </Text>
      <br />
      <div>
        <Dropdown
          className="dropdown-stories-styles_spacing"
          options={countries}
          placeholder="Country"
          multi={false}
          onChange={(e) => setCountry(e.value)}
        />
        <Text color={Text.colors.SECONDARY} type={Text.types.TEXT2}>
          Example: United States, Canada, United Kingdom
        </Text>
      </div>

      <br />

      <Button
        variant="filled"
        loading={isLoading}
        onClick={handleProfileSearch}
        disabled={!role || !city || !country || isLoading}
      >
        {isLoading ? "Searching..." : "Search"}

        {(!role || !city || !country) && !isLoading && activeTabId === 0 && (
          <div
            className="monday-storybook-tooltip_overview"
            style={{ position: "relative", right: "50%", top: "20px" }}
          >
            <Tooltip
              position={Tooltip.positions.BOTTOM}
              content="Please fill in all the fields"
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

export default SearchProfile;
