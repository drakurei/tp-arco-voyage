import { Alert, Button, Placeholder } from "react-bootstrap"

// États d'une page qui attend l'API
// - loading : lignes grisées à la place du contenu
// - error   : message et bouton pour relancer la requête
export function LoadingLines({ lines = 3, label = "Chargement…" }) {
  return (
    <div className="loading-lines" role="status">
      <span className="visually-hidden">{label}</span>
      {Array.from({ length: lines }, (_, i) => (
        <Placeholder key={i} as="p" animation="glow" className="mb-2">
          <Placeholder xs={i === lines - 1 ? 6 : 12} />
        </Placeholder>
      ))}
    </div>
  )
}

export function ErrorNote({ message, onRetry }) {
  return (
    <Alert variant="danger" className="d-flex flex-wrap align-items-center gap-3">
      <span>{message}</span>
      {onRetry && (
        <Button variant="link" className="p-0" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </Alert>
  )
}
