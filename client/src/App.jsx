import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import AttentionBox from "monday-ui-react-core/dist/AttentionBox.js";
import { useEffect, useState } from "react";
import "monday-ui-react-core/tokens";
import { Flex, Loader, Toast } from "monday-ui-react-core";
import { Heading } from "monday-ui-react-core/next";
import { checkUserCredit, createUser, checkUserExist } from "./utils/api";
import "./app.css";
import OnboardingPage from "./components/OnboardingPage";
import ColumnDeleteBulk from "./components/ColumnDeleteBulk";
import CustomModal from "./components/Modal";
import useModal from "./hooks/useModal";
import GroupDeleteBulk from "./components/GroupDeleteBulk";
import ViewerOnlyWarning from "./components/ViewerOnlyWarning";

const monday = mondaySdk();

export default function App() {
  const [context, setContext] = useState();
  const {
    isModalOpen,
    openModal,
    closeModal,
    selectedItem,
    setSelectedItem,
    modalType,
    setModalType,
  } = useModal(false);
  const [boardColumns, setBoardColumns] = useState();
  const [boardGroups, setBoardGroups] = useState();

  const [currentTheme, setCurrentTheme] = useState(null);
  const [isLoadingMondayProfile, setIsLoadingMondayProfile] = useState(false);
  const [userData, setUserData] = useState();

  const [isSuccesfullyDelete, setIsSuccesfullyDelete] = useState(false);
  const [isFailedDelete, setIsFailedDelete] = useState(false);
  const [isLoadingSaving, setIsLoadingSaving] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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

      checkAndCreateUser(accountId, "monday.com", userId);

      const boardQuery = `query {
        boards(ids: ${res.data.boardId}) {
          columns {
            id
            title
          }
          groups {
            title
            id
          }
        }
      }`;
      
      const boardResponse = await monday.api(boardQuery);

      const fetchedBoardColumns = boardResponse.data.boards[0].columns
        .filter((column) => column.id !== "name" && column.id !== "subitems")
        .map((column) => ({
          value: column.id,
          label: column.title,
        }));

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

  const handleCloseSuccesfullyDelete = () => {
    setIsSuccesfullyDelete(false);
    setSelectedItem([]);
  };

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

  if (context?.user?.isViewOnly) {
    return <ViewerOnlyWarning />;
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
        selectedItem={selectedItem}
        context={context}
        setBoardColumns={setBoardColumns}
        setBoardGroups={setBoardGroups}
        monday={monday}
        setIsSuccesfullyDelete={setIsSuccesfullyDelete}
        setSelectedItem={setSelectedItem}
        setIsDeleting={setIsDeleting}
        setUserData={setUserData}
        setIsFailedDelete={setIsFailedDelete}
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
          open={isDeleting}
          loading={true}
          type={Toast.types.POSITIVE}
          onClose={() => setIsDeleting(false)}
          // autoHideDuration={1500}
          className="monday-storybook-toast_wrapper custom-toast"
        >
          {`Deleting selected item`}
        </Toast>

        <Toast
          open={isSuccesfullyDelete}
          type={Toast.types.POSITIVE}
          onClose={handleCloseSuccesfullyDelete}
          autoHideDuration={1500}
          className="monday-storybook-toast_wrapper custom-toast"
        >
          {`We successfully deleted selected item`}
        </Toast>

        <Toast
          open={isFailedDelete}
          type={Toast.types.NEGATIVE}
          onClose={() => setIsFailedDelete(false)}
          autoHideDuration={1500}
          className="monday-storybook-toast_wrapper error-toast"
        >
          Something went wrong. Please try again later
        </Toast>

        <br></br>

        <ColumnDeleteBulk
          setModalType={setModalType}
          setSelectedItem={setSelectedItem}
          openModal={openModal}
          existingBoardColumns={boardColumns}
          monday={monday}
          context={context}
          setBoardColumns={setBoardColumns}
          selectedItem={selectedItem}
          modalType={modalType}
        />

        <br />
        <br />
        <Flex
          gap={Flex.gaps.SMALL}
          direction={Flex.directions.COLUMN}
          justify={Flex.justify.START}
          align={Flex.align.START}
        >
          <Heading
            style={{ marginBottom: "1rempx" }}
            type={Heading.types.H2}
            weight={Heading.weights.BOLD}
          >
            Delete Multiple Groups
          </Heading>
        </Flex>
        <GroupDeleteBulk
          boardGroups={boardGroups}
          setModalType={setModalType}
          setSelectedItem={setSelectedItem}
          openModal={openModal}
          existingBoardGroups={boardGroups}
          monday={monday}
          context={context}
          setBoardGroups={setBoardGroups}
          selectedItem={selectedItem}
          modalType={modalType}
        />
      </div>
    </div>
  );
}
