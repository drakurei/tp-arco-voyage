// Note de 1 à 5, comme les trous d'un ticket poinçonné

// Affichage : 5 trous, les premiers sont poinçonnés
export function RatingPunch({ value }) {
  if (!value) return null
  return (
    <span className="punch" role="img" aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? "punch-hole is-punched" : "punch-hole"} />
      ))}
    </span>
  )
}

// Saisie : 5 boutons radio, plus "sans note" (la note est facultative pour l'API)
export function RatingInput({ value, onChange, name = "rating" }) {
  return (
    <fieldset className="punch-input">
      <legend className="form-label">Votre note (facultative)</legend>
      <div className="punch-options">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={n <= (value ?? 0) ? "punch-option is-punched" : "punch-option"}>
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="visually-hidden"
            />
            <span aria-hidden="true">{n}</span>
            <span className="visually-hidden">{n} sur 5</span>
          </label>
        ))}
        {value && (
          <button type="button" className="btn btn-link px-2" onClick={() => onChange(null)}>
            Sans note
          </button>
        )}
      </div>
    </fieldset>
  )
}
