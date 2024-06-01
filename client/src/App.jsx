import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import AttentionBox from "monday-ui-react-core/dist/AttentionBox.js";
import { useEffect, useState } from "react";
import "monday-ui-react-core/tokens";
import {
  Flex,
  Text,
  Loader,
  Toast,
} from "monday-ui-react-core";
import { Heading } from "monday-ui-react-core/next";
import {
  checkUserCredit,
  createUser,
  checkUserExist,
  decreaseUserCredit,
} from "./utils/api";
import { getProfileDataCost } from "./utils/constant";
import "./app.css";
import OnboardingPage from "./components/OnboardingPage";
import ColumnDeleteBulk from "./components/ColumnDeleteBulk";

const monday = mondaySdk();

export default function App() {
  const [context, setContext] = useState();
  const [boardColumns, setBoardColumns] = useState();
  const [currentTheme, setCurrentTheme] = useState(null);
  const [isLoadingMondayProfile, setIsLoadingMondayProfile] = useState(false);
  const [userData, setUserData] = useState();

  const [isSavingLead, setIsSavingLead] = useState(false);
  const [isFailedToSaveLead, setIsFailedToSaveLead] = useState(false);
  const [isLoadingSaving, setIsLoadingSaving] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(true);



  const handleGetProfileData = async (personURL) => {
    try {
      setIsLoadingSaving(true);

      if (userData.credits - getProfileDataCost >= 0) {
        const response = await fetch(`/person_profile?url=${personURL}`);

        const data = await response.json();

        handleSave(data);

        const decrease = await decreaseUserCredit(
          `${context.account.id}-linked-turbo`,
          getProfileDataCost,
        );

        setUserData((prev) => {
          return { ...prev, credits: decrease.credits };
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  async function checkAndCreateUser(
    accountId,
    marketplaceName = "monday.com",
    userId,
  ) {
    const exists = await checkUserExist(accountId);
    if (!exists?.exists) {
      const user = await createUser(accountId, marketplaceName, userId);
      setUserData((prev) => {
        return { ...prev, credits: user.credits };
      });
    } else {
      const userCredit = await checkUserCredit(accountId);
      setUserData((prev) => {
        return { ...prev, credits: userCredit };
      });
    }
  }

  const findDynamicColumnId = (columnId, createdColumns) => {
    const mergedColumns = [...createdColumns, ...boardColumns];
    return mergedColumns.find((boardColumn) => boardColumn.includes(columnId));
  };

  const handleSave = async (profileData) => {
    let createdColumns = [...boardColumns];

    const selectedFields = [];

    const columnData = {};
    Object.keys(checkedItems).forEach((key) => {
      if (checkedItems[key]) {
        selectedFields.push(key);
        columnData[key] = profileData[key];

        if (key === "linkedin_profile_url") {
          columnData[
            key
          ] = `https://www.linkedin.com/in/${profileData.public_identifier}`;
        }

        if (key === "experiences") {
          const experienceStrings = profileData.experiences.map(
            (exp) => `${exp.title} at ${exp.company}`,
          );
          columnData[key] = experienceStrings;
        }

        if (key === "education") {
          const educationStrings = profileData.education.map(
            (edu) => `${edu.degree_name} at ${edu.school}`,
          );
          columnData[key] = educationStrings;
        }

        if (key === "skills") {
          const skillsStrings = profileData.skills[0];
          columnData[key] = skillsStrings;
        }
      }
    });

    // console.log(columnData, "columnData");

    const createColumnMutation = (columnName) => `
      create_column_${columnName.replace(/[^a-zA-Z0-9]/g, "")}: create_column(
        board_id: ${context.boardId},
        title: "${columnName}",
        column_type: text
      ) {
        id
        title
      }
    `;

    const createColumnsMutation = () => {
      const missingColumns = selectedFields.filter(
        (column) => !createdColumns.some((c) => c.includes(column)),
      );

      if (missingColumns.length === 0) return null;

      return `
        mutation {
          ${missingColumns
            .map((column) => createColumnMutation(column))
            .join("\n")}
        }
      `;
    };

    try {
      const createColumnsQuery = createColumnsMutation();

      if (createColumnsQuery) {
        const res = await monday.api(createColumnsQuery);
        Object.values(res.data).forEach((column) => {
          console.log(column.id, "column.id");
          createdColumns.push(column.id);
        });
      }

      let columnValues = {};
      for (const [key, value] of Object.entries(columnData)) {
        const columnId = findDynamicColumnId(key, createdColumns);
        if (columnId) {
          columnValues[columnId] = value;
        }
      }

      const columnValuesString = JSON.stringify(columnValues)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"');
      // console.log(columnValuesString, "columnValuesString");

      const itemQuery = `
        mutation {
          create_item(
            board_id: ${context.boardId},
            item_name: "${profileData.full_name}",
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
      // setIsLoading(false);
      monday.execute("valueCreatedForUser");
    }
  };
  useEffect(() => {
    monday.listen("context", async (res) => {
      setContext(res.data);
      setCurrentTheme(res.data.theme);
      setIsLoadingMondayProfile(false);

      const userId = res.data.user.id;

      const accountId = `${res.data.account.id}-linked-turbo`;

      const isOnboarded = localStorage.getItem(
        `isOnboarded-${userId}-linked-turbo`,
      );
      setIsOnboarded(isOnboarded);

      // checkAndCreateUser(accountId, "monday.com", userId);

      const boardQuery = `query {boards(ids: ${res.data.boardId}) {columns {id title}}}`;
      const boardResponse = await monday.api(boardQuery);

      console.log(boardResponse, "boardResponse");

      const fetchedBoardColumns = boardResponse.data.boards[0].columns.map((column) => ({
        value: column.id,
        label: column.title,
      }));

      setBoardColumns(fetchedBoardColumns);
    });
  }, []);

  if (!isLoadingMondayProfile && !isOnboarded) {
    return (
      <OnboardingPage
        monday={monday}
        setIsOnboarded={setIsOnboarded}
        context={context}
      />
    );
  }

  if (isLoadingMondayProfile) {
    return <Loader />;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "16px 16px",
          backgroundColor: "lightgray",
          height: "100vh",
        }}
      >
        <Flex
          gap={Flex.gaps.SMALL}
          direction={Flex.directions.COLUMN}
          justify={Flex.justify.START}
          align={Flex.align.START}
        >
          <Heading type={Heading.types.H2} weight={Heading.weights.BOLD}>
            Linked Turbo
          </Heading>
        </Flex>

        {context?.user?.isViewOnly && (
          <Flex justify={Flex.justify.CENTER}>
            <AttentionBox
              className="monday-storybook-attention-box_box"
              text="As a viewer, you are unable to use this app."
              title="Warning!"
              type={AttentionBox.types.WARNING}
            />
          </Flex>
        )}

        {userData && (
          <Flex justify={Flex.justify.CENTER}>
            <AttentionBox
              className="monday-storybook-attention-box_box"
              text={`${
                userData?.credits === 0
                  ? "You are out of credits, please contact support@getturboflow.com"
                  : `You have ${userData?.credits} credits left`
              }`}
              title={userData?.credits === 0 ? "Warning!" : "Information"}
              type={
                userData?.credits === 0
                  ? AttentionBox.types.WARNING
                  : AttentionBox.types.SUCCESS
              }
            />
          </Flex>
        )}

        <Toast
          open={isSavingLead}
          type={Toast.types.POSITIVE}
          onClose={() => setIsSavingLead(false)}
          autoHideDuration={1500}
          className="monday-storybook-toast_wrapper custom-toast"
        >
          Profile saved!
        </Toast>

        <Toast
          open={isFailedToSaveLead}
          type={Toast.types.NEGATIVE}
          onClose={() => setIsFailedToSaveLead(false)}
          autoHideDuration={1500}
          className="monday-storybook-toast_wrapper"
        >
          Failed to save lead
        </Toast>

        <br></br>

        <ColumnDeleteBulk existingBoardColumns={boardColumns} />
      </div>
    </div>
  );
}
