// Outils des tableaux de l'administration : champ de filtre et en-têtes triables

// Champ de filtre avec le nombre de lignes affichées
export function TableFilter({ value, onChange, shown, total, placeholder = "Filtrer…", id }) {
  return (
    <div className="table-filter">
      <label htmlFor={id} className="visually-hidden">
        Filtrer le tableau
      </label>
      <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <span className="capital" aria-live="polite">
        {shown === total ? `${total} ligne${total > 1 ? "s" : ""}` : `${shown} sur ${total}`}
      </span>
    </div>
  )
}

// En-tête de colonne : un bouton qui trie, avec aria-sort pour les lecteurs d'écran
export function SortableTh({ label, column, sort, onSort }) {
  const active = sort?.key === column
  const direction = active ? sort.direction : null
  return (
    <th scope="col" aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className={active ? "sort-btn is-active" : "sort-btn"} onClick={() => onSort(column)}>
        {label}
        <span className="sort-arrow" aria-hidden="true">
          {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
        </span>
      </button>
    </th>
  )
}
