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
  Box,
  TextField,
  Button,
  Tab,
  TabPanel,
  TabList,
  TabPanels,
} from "monday-ui-react-core";
import { Heading } from "monday-ui-react-core/next";
import {
  checkUserCredit,
  createUser,
  checkUserExist,
  decreaseUserCredit,
} from "./utils/api";
import { getProfileDataCost } from "./utils/constant";
import personProfile from "./data/personProfile";
import PersonProfileData from "./components/PersonProfileData";
import PersonProfileSettings from "./components/PersonProfileSettings";
import SearchProfile from "./components/SearchProfile";
import "./app.css";
import OnboardingPage from "./components/OnboardingPage";

const monday = mondaySdk();

export default function App() {
  const [context, setContext] = useState();
  const [boardColumns, setBoardColumns] = useState();
  const [currentTheme, setCurrentTheme] = useState(null);
  const [isLoadingMondayProfile, setIsLoadingMondayProfile] = useState(false);
  const [userData, setUserData] = useState();

  const [isSavingLead, setIsSavingLead] = useState(false);
  const [isFailedToSaveLead, setIsFailedToSaveLead] = useState(false);
  const [activeTabId, setActiveTabId] = useState(0);
  const [isLoadingSaving, setIsLoadingSaving] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(true);

  const mustHaveColumn = [
    { value: "linkedin_profile_url", label: "LinkedIn Profile URL" },
    { value: "first_name", label: "First Name" },
    { value: "last_name", label: "Last Name" },
    { value: "full_name", label: "Full Name" },
    { value: "occupation", label: "Occupation" },
    { value: "city", label: "City" },
    { value: "state", label: "State" },
    { value: "skills", label: "Skills" },
    { value: "experiences", label: "Experiences" },
    { value: "education", label: "Education" },
    // { value: "country_full_name", label: "Country Full Name" },
  ];

  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem("personProfileSettings");
    return saved
      ? JSON.parse(saved)
      : mustHaveColumn.reduce((acc, column) => {
          acc[column.value] = false;
          return acc;
        }, {});
  });

  const handleActiveTab = (tabId) => {
    setActiveTabId(tabId);
  };

  const isLoadingPlaces = false;
  const isFetchingPlaces = false;

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
          const skillsStrings = profileData.skills[0]
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

      checkAndCreateUser(accountId, "monday.com", userId);

      const boardQuery = `query {boards(ids: ${res.data.boardId}) {columns {id title}}}`;
      const boardResponse = await monday.api(boardQuery);

      setBoardColumns(
        boardResponse.data.boards[0].columns.map((column) => column.id),
      );
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

        <TabList tabType="stretched" activeTabId={activeTabId}>
          <Tab onClick={() => handleActiveTab(0)}>1. Search Profile</Tab>
          <Tab onClick={() => handleActiveTab(1)}>2. Get Profile Data</Tab>
          <Tab onClick={() => handleActiveTab(2)}>3. Email Lookup</Tab>
        </TabList>

        <TabPanels activeTabId={activeTabId}>
          <TabPanel>
            {/* Person Search Endpoint */}
            <Text type={Text.types.TEXT1}>
              Cost: <strong>3</strong> credits / profile returned
    
            </Text>
            <Text type={Text.types.TEXT1}>
             <strong>Result is limited to 1 on a free plan</strong>
            </Text>
            <br />
            <SearchProfile
              boardColumns={boardColumns}
              context={context}
              monday={monday}
              activeTabId={activeTabId}
              findDynamicColumnId={findDynamicColumnId}
              isLoading={isLoadingSaving}
              setIsSavingLead={setIsSavingLead}
              setIsLoadingSaving={setIsLoadingSaving}
              userData={userData}
              setUserData={setUserData}
            />
          </TabPanel>
          <TabPanel>
            <PersonProfileSettings
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
              mustHaveColumn={mustHaveColumn}
            />
            <PersonProfileData
              activeTabId={activeTabId}
              isLoading={isLoadingSaving}
              checkedItems={checkedItems}
              handleGetProfileData={handleGetProfileData}
              userData={userData}
            />
          </TabPanel>
          <TabPanel>
            <Text type={Text.types.TEXT1}>Coming Soon!</Text>

            <Text type={Text.types.TEXT1}>
              Contact support@getturboflow.com if you want this feature to be
              available soon!
            </Text>
          </TabPanel>
        </TabPanels>

        <br></br>

        {/*<Flex direction='Column' align='Left' style={{marginTop:'2rem'}} >
        <Text color={Text.colors.SECONDARY} type={Text.types.TEXT2}>
         Company Profile
        </Text>
        <TextField
          placeholder="https://www.linkedin.com/company/helpjuice"
          size={TextField.sizes.MEDIUM}
        />
        <Button style={{ marginTop: "0.5rem" }}  variant="filled">Search</Button>
        </Flex>*/}

        {(isLoadingPlaces || isFetchingPlaces) && (
          <Flex direction={"Row"} align={"Center"} justify={"Center"} pt={"xl"}>
            <Loader size={50} />
            <Text fw={500} mt="sm">
              Getting your leads...
            </Text>
          </Flex>
        )}

        {!isLoadingPlaces && !isFetchingPlaces && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              margin: "1.5rem auto",
              width: "80%",
              paddingBottom: "10vh",
            }}
          ></div>
        )}
      </div>
    </div>
  );
}
