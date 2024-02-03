import React, { useRef, useEffect, useState } from "react";
import "./Modal.css";
//https://github.com/c99rahul/react-modal/tree/main
interface ModalProps {
  isOpen: boolean;
  hasCloseBtn?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  hasCloseBtn = true,
  onClose,
  children
}) => {
  const [isModalOpen, setModalOpen] = useState(isOpen);
  const modalRef = useRef<HTMLDialogElement | null>(null);

  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    }
    setModalOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      handleCloseModal();
    }
  };

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const modalElement = modalRef.current;

    if (modalElement) {
      if (isModalOpen) {
        modalElement.showModal();
      } else {
        modalElement.close();
      }
    }
  }, [isModalOpen]);

  return (
    <dialog ref={modalRef} onKeyDown={handleKeyDown} className="modal" onClick={(event) => { if (event.target === modalRef.current) { handleCloseModal(); } }}>
      <div id="modal_dialog">
        {children}
        <br/>
        {hasCloseBtn && (
          <button className="modal-close-btn" onClick={handleCloseModal}>
            Close
          </button>
        )}
      </div>
    </dialog>
  );
};

export default Modal;
