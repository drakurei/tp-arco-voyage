import { useState } from "react"
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useDispatch } from "react-redux"
import { updateProfile } from "../features/users/usersSlice"
import { useAvatarChoice } from "../utils/avatar"
import AvatarPicker from "./AvatarPicker"

// Mêmes contraintes que POST /api/profile/update.php
const profileSchema = yup.object({
  username: yup.string().trim().required("Le login est obligatoire").min(4, "4 caractères minimum"),
  email: yup.string().trim().required("L'email est obligatoire").email("L'email n'est pas valide"),
  firstName: yup.string().trim().required("Le prénom est obligatoire"),
  lastName: yup.string().trim().required("Le nom est obligatoire"),
  gender: yup.string(),
})

// Modifier ses informations (sauf le mot de passe, qui a sa propre fenêtre)
function ProfileEditModal({ show, onHide, user }) {
  const dispatch = useDispatch()
  const [serverError, setServerError] = useState(null)
  // garder l'avatar actuel, ou en tirer un nouveau
  const [changeAvatar, setChangeAvatar] = useState(false)
  const avatarChoice = useAvatarChoice(user.username)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(profileSchema),
    values: {
      username: user.username ?? "",
      email: user.email ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      gender: user.gender ?? "",
    },
  })

  const close = () => {
    reset()
    setServerError(null)
    setChangeAvatar(false)
    onHide()
  }

  const submit = async (data) => {
    setServerError(null)
    const avatar = changeAvatar ? avatarChoice.url : user.avatar || user.image || undefined
    try {
      await dispatch(updateProfile({ ...data, ...(avatar ? { avatar } : {}) })).unwrap()
      close()
    } catch (message) {
      setServerError(String(message))
    }
  }

  return (
    <Modal show={show} onHide={isSubmitting ? undefined : close} centered size="lg" contentClassName="fiche-modal">
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title as="h2">Modifier mes informations</Modal.Title>
      </Modal.Header>
      <Form noValidate onSubmit={handleSubmit(submit)}>
        <Modal.Body>
          {serverError && <Alert variant="danger">{serverError}</Alert>}

          <div className="mb-4">
            {changeAvatar ? (
              <>
                <AvatarPicker choice={avatarChoice} idPrefix="edit-avatar" label="Nouvel avatar" />
                <Button variant="link" className="px-0" onClick={() => setChangeAvatar(false)}>
                  Garder mon avatar actuel
                </Button>
              </>
            ) : (
              <div className="avatar-picker">
                <img src={user.avatar || user.image || avatarChoice.url} alt="" className="avatar-preview" width="104" height="104" />
                <Button variant="link" className="px-0" onClick={() => setChangeAvatar(true)}>
                  Changer d'avatar
                </Button>
              </div>
            )}
          </div>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="edit-username">
                <Form.Label>Login</Form.Label>
                <Form.Control type="text" isInvalid={!!errors.username} {...register("username")} />
                <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="edit-email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" isInvalid={!!errors.email} {...register("email")} />
                <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="edit-firstName">
                <Form.Label>Prénom</Form.Label>
                <Form.Control type="text" isInvalid={!!errors.firstName} {...register("firstName")} />
                <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="edit-lastName">
                <Form.Label>Nom</Form.Label>
                <Form.Control type="text" isInvalid={!!errors.lastName} {...register("lastName")} />
                <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="edit-gender">
                <Form.Label>Genre</Form.Label>
                <Form.Select {...register("gender")}>
                  <option value="">Non précisé</option>
                  <option value="female">Femme</option>
                  <option value="male">Homme</option>
                  <option value="other">Autre</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
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
    </Modal>
  )
}

export default ProfileEditModal
