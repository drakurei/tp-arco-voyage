import { useEffect, useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { Col, Row } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { selectUser } from "../features/auth/authSlice"
import { fetchAllComments } from "../features/comments/commentsSlice"
import { fetchDestinations, selectDestinations } from "../features/destinations/destinationsSlice"
import { ErrorNote, LoadingLines } from "../components/PageStatus"
import { RatingPunch } from "../components/Rating"
import SafeImage from "../components/SafeImage"
import { formatLongDate, plural } from "../utils/format"
import { formatAverage, groupTravelers, travelerAvatar } from "../utils/travelers"

// Page publique d'un voyageur : /voyageurs/:username
// Visible par tout le monde, sans données privées (ni email, ni nom complet)
function TravelerPage() {
  const { username } = useParams()
  const dispatch = useDispatch()
  const me = useSelector(selectUser)
  const destinations = useSelector(selectDestinations)
  const destinationsStatus = useSelector((state) => state.destinations.listStatus)
  const { all: comments, allStatus } = useSelector((state) => state.comments)

  useEffect(() => {
    dispatch(fetchAllComments())
  }, [dispatch])

  useEffect(() => {
    if (destinationsStatus === "idle") dispatch(fetchDestinations())
  }, [destinationsStatus, dispatch])

  const traveler = useMemo(
    () => groupTravelers(comments).find((t) => t.username.toLowerCase() === username.toLowerCase()) ?? null,
    [comments, username]
  )

  // destinations notées, avec leur région (pour les étiquettes)
  const visited = useMemo(() => {
    if (!traveler) return []
    return traveler.destinationIds.map((id) => destinations.find((d) => d.id === id)).filter(Boolean)
  }, [traveler, destinations])

  const regions = useMemo(() => {
    const bySlug = new Map()
    for (const d of visited) {
      if (d.regionSlug && !bySlug.has(d.regionSlug)) bySlug.set(d.regionSlug, d.regionName)
    }
    return [...bySlug.entries()]
  }, [visited])

  const isMe = me && traveler && me.username?.toLowerCase() === traveler.username.toLowerCase()

  if (allStatus === "failed") {
    return <ErrorNote message="Impossible de charger ce carnet." onRetry={() => dispatch(fetchAllComments())} />
  }

  if (!traveler) {
    if (allStatus !== "succeeded") return <LoadingLines lines={5} />
    return (
      <div className="text-page">
        <h1 className="mb-3">@{username}</h1>
        <p>
          Personne n'a encore écrit sous ce nom. Un voyageur apparaît ici dès son premier commentaire sur une
          destination.
        </p>
        <Link to="/voyageurs">Voir tous les voyageurs</Link>
      </div>
    )
  }

  return (
    <article className="traveler">
      <header className="traveler-head">
        <figure className="passport-photo traveler-photo">
          <img src={travelerAvatar(traveler)} alt={`Avatar de ${traveler.username}`} />
        </figure>

        <div className="traveler-intro">
          <p className="passport-title">Carnet de voyageur</p>
          <h1 className="passport-name">@{traveler.username}</h1>
          <p className="traveler-summary">
            {plural(traveler.count, "note")} sur {plural(traveler.destinationIds.length, "destination")}, la première
            le {formatLongDate(traveler.firstAt)}.
            {traveler.average !== null && (
              <>
                {" "}
                Note donnée en moyenne : <strong>{formatAverage(traveler.average)}/5</strong>.
              </>
            )}
          </p>
          {isMe && (
            <p className="traveler-me">
              C'est votre page publique, telle que la voient les autres. Vos informations privées restent dans votre{" "}
              <Link to="/profile">passeport</Link>.
            </p>
          )}
        </div>
      </header>

      <Row className="g-5 mt-1">
        <Col lg={7}>
          <h2 className="profile-section">Ses notes</h2>
          <ol className="comment-list">
            {traveler.comments.map((comment) => (
              <li key={comment.id} className="comment">
                <div>
                  <div className="comment-head">
                    <strong>
                      {comment.destinationSlug ? (
                        <Link to={`/destinations/${comment.destinationSlug}`}>{comment.destinationName}</Link>
                      ) : (
                        comment.destinationName
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
        </Col>

        <Col lg={5}>
          {regions.length > 0 && (
            <section className="mb-5">
              <h2 className="profile-section">Régions parcourues</h2>
              <div className="region-labels">
                {regions.map(([slug, name]) => (
                  <Link key={slug} to={`/region/${slug}`}>
                    {name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {visited.length > 0 && (
            <section>
              <h2 className="profile-section">Destinations notées</h2>
              <ul className="profile-favorites">
                {visited.map((d) => (
                  <li key={d.id}>
                    <Link to={`/destinations/${d.slug}`} className="profile-favorite">
                      <SafeImage src={d.image} label={d.name} loading="lazy" />
                      <span>{d.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Col>
      </Row>
    </article>
  )
}

export default TravelerPage
