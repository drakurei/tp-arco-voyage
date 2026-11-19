import { Alert, Button, Modal } from "react-bootstrap"

// Fenêtre de confirmation (suppression, favori...) : une fiche bristol posée sur la page
// show       : affichée ou non
// title      : question posée
// children   : précisions
// confirmLabel / cancelLabel : textes des boutons
// danger     : action destructrice (bouton tampon rouge)
// pending    : requête en cours (boutons désactivés)
// error      : message d'erreur renvoyé par l'API
function ConfirmModal({
  show,
  title,
  children,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
  pending = false,
  error = null,
  onConfirm,
  onHide,
}) {
  return (
    <Modal show={show} onHide={pending ? undefined : onHide} centered contentClassName="fiche-modal">
      <Modal.Header closeButton={!pending}>
        <Modal.Title as="h2">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="link" className="px-0 me-3" onClick={onHide} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={pending}>
          {pending ? "Patientez…" : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmModal
