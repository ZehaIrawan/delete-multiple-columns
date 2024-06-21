import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import AttentionBox from "monday-ui-react-core/dist/AttentionBox.js";
import { useEffect, useState } from "react";
import "monday-ui-react-core/tokens";
import { Flex, Text, Loader, Toast } from "monday-ui-react-core";
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
import GroupDeleteBulk from "./components/GroupDeleteBulk";
import CustomModal from "./components/Modal";
import useModal from "./hooks/useModal";

const monday = mondaySdk();

export default function App() {
  const [context, setContext] = useState();
  const {
    isModalOpen,
    openModal,
    closeModal,
    modalContent,
    setModalContent,
    modalType,
    setModalType,
  } = useModal(false);
  const [boardColumns, setBoardColumns] = useState();
  const [boardGroups, setBoardGroups] = useState();

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

        const decrease = await decreaseUserCredit(
          `${context.account.id}-delete-bulk`,
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

  useEffect(() => {
    monday.listen("context", async (res) => {
      setContext(res.data);
      setCurrentTheme(res.data.theme);
      setIsLoadingMondayProfile(false);

      const userId = res.data.user.id;

      const accountId = `${res.data.account.id}-delete-bulk`;

      const isOnboarded = localStorage.getItem(
        `isOnboarded-${userId}-delete-bulk`,
      );
      setIsOnboarded(isOnboarded);

      // checkAndCreateUser(accountId, "monday.com", userId);

      const boardQuery = `query {boards(ids: ${res.data.boardId}) {
        columns {
          id
          title
        }
        groups {
          title
          id
        }
      }}`;
      const boardResponse = await monday.api(boardQuery);

      console.log(boardResponse, "boardResponse");

      const fetchedBoardColumns = boardResponse.data.boards[0].columns.map(
        (column) => ({
          value: column.id,
          label: column.title,
        }),
      );

      setBoardColumns(fetchedBoardColumns);

      const fetchedBoardGroups = boardResponse.data.boards[0].groups.map(
        (group) => ({
          value: group.id,
          label: group.title,
        }),
      );
      setBoardGroups(fetchedBoardGroups);
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
      <CustomModal
        modalType={modalType}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        modalContent={modalContent}
      />
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
            Delete Multiple Columns
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

        <ColumnDeleteBulk
          setModalType={setModalType}
          setModalContent={setModalContent}
          openModal={openModal}
          existingBoardColumns={boardColumns}
          monday={monday}
          context={context}
          setBoardColumns={setBoardColumns}
        />

        <br />
        <Flex
          gap={Flex.gaps.SMALL}
          direction={Flex.directions.COLUMN}
          justify={Flex.justify.START}
          align={Flex.align.START}
        >
          <Heading type={Heading.types.H2} weight={Heading.weights.BOLD}>
            Delete Multiple Groups
          </Heading>
        </Flex>
        <GroupDeleteBulk
          setModalType={setModalType}
          setModalContent={setModalContent}
          openModal={openModal}
          existingBoardGroups={boardGroups}
          monday={monday}
          context={context}
          setBoardGroups={setBoardGroups}
        />
      </div>
    </div>
  );
}
