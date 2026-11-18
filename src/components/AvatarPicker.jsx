import { Button, Form } from "react-bootstrap"
import { AVATAR_STYLES } from "../utils/avatar"

// Choix de l'avatar DiceBear : aperçu, style, nouveau tirage
// choice : ce que renvoie useAvatarChoice() (url, style, setStyle, redraw)
function AvatarPicker({ choice, idPrefix = "avatar", label = "Votre avatar" }) {
  return (
    <div className="avatar-picker">
      <img src={choice.url} alt="Aperçu de l'avatar" className="avatar-preview" width="104" height="104" />
      <div>
        <p className="form-label mb-2">{label}</p>
        <div className="avatar-styles" role="radiogroup" aria-label="Style d'avatar">
          {AVATAR_STYLES.map((style) => (
            <Form.Check
              key={style.id}
              type="radio"
              inline
              id={`${idPrefix}-${style.id}`}
              name={`${idPrefix}-style`}
              label={style.label}
              checked={choice.style === style.id}
              onChange={() => choice.setStyle(style.id)}
            />
          ))}
        </div>
        <Button type="button" variant="link" className="px-0" onClick={choice.redraw}>
          Tirer un autre avatar
        </Button>
      </div>
    </div>
  )
}

export default AvatarPicker
