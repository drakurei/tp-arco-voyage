import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchMyComments } from "../features/comments/commentsSlice"
import { ErrorNote, LoadingLines } from "../components/PageStatus"
import { RatingPunch } from "../components/Rating"
import { formatLongDate, plural } from "../utils/format"

// Sous-page du profil : les commentaires écrits par l'utilisateur connecté
function ProfileCommentsPage() {
  const dispatch = useDispatch()
  const comments = useSelector((state) => state.comments.mine)
  const status = useSelector((state) => state.comments.mineStatus)

  useEffect(() => {
    dispatch(fetchMyComments())
  }, [dispatch])

  return (
    <>
      <h1 className="mb-2">Mes commentaires</h1>
      <p className="capital mb-4">{plural(comments.length, "commentaire")}</p>

      {status === "loading" && comments.length === 0 && <LoadingLines lines={4} />}
      {status === "failed" && (
        <ErrorNote message="Impossible de charger vos commentaires." onRetry={() => dispatch(fetchMyComments())} />
      )}

      {status === "succeeded" && comments.length === 0 && (
        <p className="text-page">
          Vous n'avez encore rien écrit. Racontez votre voyage depuis la fiche d'une{" "}
          <Link to="/destinations">destination</Link>.
        </p>
      )}

      <ol className="comment-list">
        {comments.map((comment) => (
          <li key={comment.id} className="comment">
            <div className="comment-head">
              <strong>
                {comment.destinationSlug ? (
                  <Link to={`/destinations/${comment.destinationSlug}`}>{comment.destinationName || "Destination"}</Link>
                ) : (
                  comment.destinationName || `Destination n°${comment.destinationId}`
                )}
              </strong>
              <span className="capital">{formatLongDate(comment.createdAt)}</span>
              <RatingPunch value={comment.rating} />
            </div>
            <p className="comment-text">{comment.content}</p>
          </li>
        ))}
      </ol>
    </>
  )
}

export default ProfileCommentsPage
