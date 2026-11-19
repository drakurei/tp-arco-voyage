import { useState } from "react"
import { Alert, Button, Form, Modal } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

// Mêmes règles que l'API : 8 caractères, 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial
const newPasswordRules = yup
  .string()
  .required("Le nouveau mot de passe est obligatoire")
  .min(8, "8 caractères minimum")
  .matches(/[a-z]/, "Au moins une minuscule")
  .matches(/[A-Z]/, "Au moins une majuscule")
  .matches(/[0-9]/, "Au moins un chiffre")
  .matches(/[^a-zA-Z0-9]/, "Au moins un caractère spécial")

const confirmRules = yup
  .string()
  .required("Confirmez le mot de passe")
  .oneOf([yup.ref("newPassword")], "Les deux mots de passe ne sont pas identiques")

// Utilisateur : il doit donner son mot de passe actuel
const selfSchema = yup.object({
  currentPassword: yup.string().required("Le mot de passe actuel est obligatoire"),
  newPassword: newPasswordRules,
  confirmPassword: confirmRules,
})

// Administrateur : il change le mot de passe d'un autre compte, sans l'ancien
const adminSchema = yup.object({
  newPassword: newPasswordRules,
  confirmPassword: confirmRules,
})

// Changement de mot de passe dans une fenêtre
// askCurrent : demander le mot de passe actuel (profil) ou non (administration)
// onSubmit   : reçoit les champs du formulaire, renvoie une promesse (le thunk avec unwrap())
function PasswordModal({ show, onHide, onSubmit, askCurrent = true, title = "Changer mon mot de passe", subtitle }) {
  const [serverError, setServerError] = useState(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(askCurrent ? selfSchema : adminSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const close = () => {
    reset()
    setServerError(null)
    setDone(false)
    onHide()
  }

  const submit = async (data) => {
    setServerError(null)
    try {
      await onSubmit(data)
      setDone(true)
      reset()
    } catch (message) {
      setServerError(String(message))
    }
  }

  return (
    <Modal show={show} onHide={isSubmitting ? undefined : close} centered contentClassName="fiche-modal">
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title as="h2">{title}</Modal.Title>
      </Modal.Header>

      {done ? (
        <>
          <Modal.Body>
            <p className="mb-0">Le mot de passe a bien été modifié.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={close}>
              Fermer
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <Form noValidate onSubmit={handleSubmit(submit)}>
          <Modal.Body>
            {subtitle && <p className="capital">{subtitle}</p>}
            {serverError && <Alert variant="danger">{serverError}</Alert>}

            {askCurrent && (
              <Form.Group className="mb-3" controlId="currentPassword">
                <Form.Label>Mot de passe actuel</Form.Label>
                <Form.Control
                  type="password"
                  autoComplete="current-password"
                  isInvalid={!!errors.currentPassword}
                  {...register("currentPassword")}
                />
                <Form.Control.Feedback type="invalid">{errors.currentPassword?.message}</Form.Control.Feedback>
              </Form.Group>
            )}

            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>Nouveau mot de passe</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                isInvalid={!!errors.newPassword}
                aria-describedby="password-rules"
                {...register("newPassword")}
              />
              <Form.Control.Feedback type="invalid">{errors.newPassword?.message}</Form.Control.Feedback>
              <Form.Text id="password-rules">
                8 caractères minimum, avec une minuscule, une majuscule, un chiffre et un caractère spécial.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="confirmPassword">
              <Form.Label>Confirmation</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                isInvalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="link" className="px-0 me-3" onClick={close} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  )
}

export default PasswordModal
