"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import NewVaultModal from "@/app/components/NewVaultModal";
import UploadFileModal from "@/app/components/UploadFileModal";

type ModalType = "newVault" | "uploadFile" | null;

interface ModalContextProps {
  openModal: (type: ModalType) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => setModal(type);
  const closeModal = () => setModal(null);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {/* Render active modal */}
      {modal === "newVault" && (
        <NewVaultModal
          isOpen
          onClose={closeModal}
        />
      )}
      {modal === "uploadFile" && (
        <UploadFileModal
          isOpen
          onClose={closeModal}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
}
