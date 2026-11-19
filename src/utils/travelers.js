import { avatarUrl } from "./avatar"

// L'API ne donne la liste des comptes qu'à l'admin.
// Les pages publiques des voyageurs sont donc construites à partir
// des commentaires, qui sont publics : un voyageur = quelqu'un qui a écrit.

export function travelerAvatar(traveler) {
  return traveler.avatar || avatarUrl(traveler.username || `voyageur-${traveler.userId}`)
}

// Regroupe les commentaires par auteur
// -> [{ userId, username, avatar, comments, count, average, rated, destinationIds, firstAt, lastAt }]
export function groupTravelers(comments) {
  const byAuthor = new Map()

  for (const comment of comments) {
    // sans login on ne peut pas faire de lien vers une page
    if (!comment.username) continue
    const key = comment.username.toLowerCase()
    if (!byAuthor.has(key)) {
      byAuthor.set(key, { userId: comment.userId, username: comment.username, avatar: null, comments: [] })
    }
    const traveler = byAuthor.get(key)
    traveler.comments.push(comment)
    if (!traveler.avatar && comment.avatar) traveler.avatar = comment.avatar
  }

  return [...byAuthor.values()].map((traveler) => {
    const comments = [...traveler.comments].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    const ratings = comments.map((c) => c.rating).filter((r) => r >= 1 && r <= 5)
    return {
      ...traveler,
      comments,
      count: comments.length,
      rated: ratings.length,
      average: ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null,
      destinationIds: [...new Set(comments.map((c) => c.destinationId))],
      lastAt: comments[0]?.createdAt ?? null,
      firstAt: comments[comments.length - 1]?.createdAt ?? null,
    }
  })
}

// "4,5"
export function formatAverage(value) {
  return value === null ? "" : value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })
}
