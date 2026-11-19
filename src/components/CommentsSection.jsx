import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Alert, Button, Form } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useDispatch, useSelector } from "react-redux"
import { selectUser } from "../features/auth/authSlice"
import { addComment, fetchCommentsByDestination } from "../features/comments/commentsSlice"
import { RatingInput, RatingPunch } from "./Rating"
import { LoadingLines } from "./PageStatus"
import { avatarUrl } from "../utils/avatar"
import { formatLongDate, plural } from "../utils/format"

const commentSchema = yup.object({
  content: yup
    .string()
    .trim()
    .required("Écrivez quelques mots avant de publier")
    .min(5, "Le commentaire doit avoir au moins 5 caractères")
    .max(1000, "1000 caractères maximum"),
})

// Commentaires d'une destination : liste + formulaire (connecté uniquement)
function CommentsSection({ destination }) {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const { byDestination, byDestinationStatus } = useSelector((state) => state.comments)
  const [rating, setRating] = useState(null)
  const [serverError, setServerError] = useState(null)
  const [published, setPublished] = useState(false)

  // les commentaires affichés sont ceux de cette destination
  const comments = byDestination.destinationId === destination.id ? byDestination.items : []

  useEffect(() => {
    dispatch(fetchCommentsByDestination(destination.id))
  }, [destination.id, dispatch])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(commentSchema), defaultValues: { content: "" } })

  const onSubmit = async ({ content }) => {
    setServerError(null)
    setPublished(false)
    try {
      await dispatch(
        addComment({ destination_id: destination.id, content, ...(rating ? { rating } : {}) })
      ).unwrap()
      reset()
      setRating(null)
      setPublished(true)
    } catch (message) {
      setServerError(String(message))
    }
  }

  return (
    <section className="comments" aria-labelledby="comments-title">
      <h2 id="comments-title" className="mb-1">
        Notes de voyageurs
      </h2>
      <p className="capital mb-4">{plural(comments.length, "commentaire")}</p>

      {user ? (
        <Form noValidate onSubmit={handleSubmit(onSubmit)} className="comment-form mb-5">
          {published && (
            <Alert variant="success" dismissible onClose={() => setPublished(false)}>
              Merci, votre commentaire est publié.
            </Alert>
          )}
          {serverError && <Alert variant="danger">{serverError}</Alert>}

          <Form.Group className="mb-3" controlId="comment-content">
            <Form.Label>Votre avis sur {destination.name}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ce qu'il ne faut pas manquer, la bonne période, un conseil…"
              isInvalid={!!errors.content}
              {...register("content")}
            />
            <Form.Control.Feedback type="invalid">{errors.content?.message}</Form.Control.Feedback>
          </Form.Group>

          <RatingInput value={rating} onChange={setRating} />

          <Button type="submit" variant="primary" className="mt-3" disabled={isSubmitting}>
            {isSubmitting ? "Publication…" : "Publier"}
          </Button>
        </Form>
      ) : (
        <p className="mb-5">
          <Link to="/login">Connectez-vous</Link> pour laisser un commentaire.
        </p>
      )}

      {byDestinationStatus === "loading" && comments.length === 0 && <LoadingLines lines={2} />}

      {byDestinationStatus === "succeeded" && comments.length === 0 && (
        <p className="capital">Personne n'a encore écrit sur cette destination.</p>
      )}

      <ol className="comment-list">
        {comments.map((comment) => (
          <li key={comment.id} className="comment">
            <img
              src={comment.avatar || avatarUrl(comment.username || `voyageur-${comment.userId}`)}
              alt=""
              className="comment-avatar"
              width="44"
              height="44"
              loading="lazy"
            />
            <div>
              <div className="comment-head">
                <strong>
                  {comment.username ? (
                    <Link to={`/voyageurs/${encodeURIComponent(comment.username)}`}>@{comment.username}</Link>
                  ) : (
                    "Un voyageur"
                  )}
                </strong>
                <span className="capital">{formatLongDate(comment.createdAt)}</span>
                <RatingPunch value={comment.rating} />
              </div>
              <p className="comment-text">{comment.content}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default CommentsSection
