import { useState } from "react";

const useModal = (initialState = false) => {
  const [isModalOpen, setIsModalOpen] = useState(initialState);
  const [selectedItem, setSelectedItem] = useState([]);
  const [modalType, setModalType] = useState(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem([]);
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    selectedItem,
    setSelectedItem,
    modalType,
    setModalType,
  };
};

export default useModal;
