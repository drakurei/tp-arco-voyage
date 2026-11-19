import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchRatings } from "./commentsSlice"

// Charge la note moyenne des destinations affichées (une seule fois par destination)
export function useRatings(destinations) {
  const dispatch = useDispatch()
  const ratings = useSelector((state) => state.comments.ratings)
  // clé stable : la liste des id, pour ne relancer l'effet que si les destinations changent
  const missing = destinations
    .map((d) => d.id)
    .filter((id) => id !== null && !(id in ratings))
    .join(",")

  useEffect(() => {
    if (missing) dispatch(fetchRatings(missing.split(",").map(Number)))
  }, [missing, dispatch])
}
