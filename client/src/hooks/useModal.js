import { useState } from "react";

const useModal = (initialState = false) => {
  const [isModalOpen, setIsModalOpen] = useState(initialState);
  const [modalContent, setModalContent] = useState(null);
  const [modalType, setModalType] = useState(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalContent(null);
    setModalType(null);
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    modalContent,
    setModalContent,
    modalType,
    setModalType,
  };
};

export default useModal;
