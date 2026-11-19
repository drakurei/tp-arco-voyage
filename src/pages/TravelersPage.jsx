import { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllComments } from "../features/comments/commentsSlice"
import { ErrorNote, LoadingLines } from "../components/PageStatus"
import { formatLongDate, plural } from "../utils/format"
import { formatAverage, groupTravelers, travelerAvatar } from "../utils/travelers"

// Registre des voyageurs : tous ceux qui ont écrit au moins un commentaire,
// le plus récemment actif en premier
function TravelersPage() {
  const dispatch = useDispatch()
  const { all: comments, allStatus } = useSelector((state) => state.comments)

  useEffect(() => {
    dispatch(fetchAllComments())
  }, [dispatch])

  const travelers = useMemo(
    () => groupTravelers(comments).sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt))),
    [comments]
  )

  return (
    <>
      <h1 className="mb-2">Voyageurs</h1>
      <p className="capital mb-4">
        {allStatus === "succeeded" && `${plural(travelers.length, "voyageur")} ${travelers.length > 1 ? "ont" : "a"} laissé une trace dans le carnet`}
      </p>

      {allStatus === "loading" && travelers.length === 0 && <LoadingLines lines={4} />}
      {allStatus === "failed" && (
        <ErrorNote message="Impossible de charger les voyageurs." onRetry={() => dispatch(fetchAllComments())} />
      )}
      {allStatus === "succeeded" && travelers.length === 0 && (
        <p className="text-page">
          Personne n'a encore écrit. Le premier commentaire laissé sur une <Link to="/destinations">destination</Link>{" "}
          ouvrira ce registre.
        </p>
      )}

      <ol className="traveler-list">
        {travelers.map((t) => (
          <li key={t.username}>
            <Link to={`/voyageurs/${encodeURIComponent(t.username)}`} className="traveler-row">
              <img src={travelerAvatar(t)} alt="" width="56" height="56" loading="lazy" />
              <span className="traveler-row-name">@{t.username}</span>
              <span className="traveler-row-meta">
                {plural(t.count, "note")} sur {plural(t.destinationIds.length, "destination")}
                {t.average !== null && `, ${formatAverage(t.average)}/5 en moyenne`}
                <br />
                dernière le {formatLongDate(t.lastAt)}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}

export default TravelersPage
