export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="flex-between" style={{ marginBottom: "12px" }}>
          <strong>{title}</strong>
          <button className="button secondary" onClick={onClose}>X</button>
        </div>
        {children}
      </div>
    </div>
  );
}
