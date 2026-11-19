import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { yupResolver } from "@hookform/resolvers/yup"
import { Alert, Button, Col, Form, Row } from "react-bootstrap"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { clearConfirmation, selectLastSender, sendContact } from "../features/contact/contactSlice"
import { selectUser } from "../features/auth/authSlice"

// Schéma de validation du formulaire de contact
const contactSchema = yup.object({
  name: yup.string().trim().required("Veuillez saisir votre nom"),
  email: yup
    .string()
    .trim()
    .required("Veuillez saisir votre email")
    .email("Veuillez saisir un email valide"),
  subject: yup
    .string()
    .trim()
    .required("Veuillez saisir un sujet")
    .min(5, "Le sujet doit avoir au moins 5 caractères"),
  message: yup
    .string()
    .trim()
    .required("Veuillez saisir un message")
    .min(10, "Le message doit avoir au moins 10 caractères"),
})

function ContactPage() {
  const dispatch = useDispatch()
  // nom de la dernière personne qui a écrit (slice contact)
  const sentName = useSelector(selectLastSender)
  const { sendStatus, sendError } = useSelector((state) => state.contact)
  // si l'utilisateur est connecté, la demande est liée à son compte
  const user = useSelector(selectUser)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(contactSchema),
    // connecté : nom et email déjà remplis
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email ?? "",
      subject: "",
      message: "",
    },
  })

  // Connexion ou déconnexion pendant qu'on est sur la page : on met à jour nom et email
  useEffect(() => {
    reset((values) => ({
      ...values,
      name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
      email: user?.email ?? "",
    }))
  }, [user, reset])

  // En quittant la page, on efface le message de confirmation
  useEffect(() => {
    return () => dispatch(clearConfirmation())
  }, [dispatch])

  // sendContact est un thunk : il envoie la demande à l'API (avec le token et user_id si connecté)
  const onSubmit = async (data) => {
    try {
      await dispatch(sendContact(data)).unwrap()
      // on vide le sujet et le message, on garde nom et email
      reset({ ...data, subject: "", message: "" })
    } catch {
      // le message d'erreur est dans le state (contact.sendError)
    }
  }

  return (
    <div className="text-page">
      <h1 className="mb-4">Contact</h1>
      <p className="mb-4">Une question sur une destination ? Écrivez-nous avec le formulaire ci-dessous.</p>

      {sentName && (
        <Alert variant="success" onClose={() => dispatch(clearConfirmation())} dismissible>
          Merci {sentName}, votre message a bien été envoyé.
        </Alert>
      )}
      {sendStatus === "failed" && (
        <Alert variant="danger" onClose={() => dispatch(clearConfirmation())} dismissible>
          {sendError}
        </Alert>
      )}

      <Form noValidate onSubmit={handleSubmit(onSubmit)} className="search-form">
        <Row className="g-3">
          <Col md={6}>
            <Form.Group controlId="name">
              <Form.Label>Nom</Form.Label>
              <Form.Control type="text" isInvalid={!!errors.name} {...register("name")} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" isInvalid={!!errors.email} {...register("email")} />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group controlId="subject">
              <Form.Label>Sujet</Form.Label>
              <Form.Control type="text" isInvalid={!!errors.subject} {...register("subject")} />
              <Form.Control.Feedback type="invalid">{errors.subject?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group controlId="message">
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" rows={5} isInvalid={!!errors.message} {...register("message")} />
              <Form.Control.Feedback type="invalid">{errors.message?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Envoi…" : "Envoyer"}
            </Button>
            {user && <span className="capital ms-3">Envoyé depuis votre compte @{user.username}</span>}
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default ContactPage
