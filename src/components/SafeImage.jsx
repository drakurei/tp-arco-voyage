import { useState } from "react"

// Image qui ne laisse jamais un cadre vide :
// si l'adresse est cassée (lien mort, image supprimée...), on affiche
// à la place un emplacement "photo égarée" avec le nom écrit à la main.
// Les autres props (className, loading, width...) sont passées à l'image.
function SafeImage({ src, alt = "", label, className = "", ...props }) {
  // on retient l'adresse qui a échoué : une nouvelle adresse retente le chargement
  const [failedSrc, setFailedSrc] = useState(null)

  if (!src || failedSrc === src) {
    return (
      <div className={`photo-missing ${className}`} role={alt ? "img" : undefined} aria-label={alt || undefined}>
        <span className="photo-missing-note">Photo égarée</span>
        {label && <span className="photo-missing-label">{label}</span>}
      </div>
    )
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} {...props} />
}

export default SafeImage
