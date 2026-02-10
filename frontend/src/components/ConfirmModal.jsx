import Modal from "./Modal.jsx";

export default function ConfirmModal({ open, title, description, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="muted">{description}</p>
      <div className="flex" style={{ marginTop: "16px" }}>
        <button className="button" onClick={onConfirm}>Confirmar</button>
        <button className="button secondary" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}
