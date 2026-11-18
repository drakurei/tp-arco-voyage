import { useId } from "react";

// Tampon de passeport rond, avec une encre irrégulière (filtre SVG)
function Stamp({ ring = "ARCO-VOYAGE • CARNET DE ROUTE • ", big = "9", small = "PAYS", className = "" }) {
  const id = useId();
  const pathId = `${id}-circle`;
  const inkId = `${id}-ink`;

  return (
    <svg className={`stamp ${className}`} viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <path id={pathId} d="M80,80 m-57,0 a57,57 0 1,1 114,0 a57,57 0 1,1 -114,0" />
        {/* Bruit qui « mange » l'encre par endroits, comme un vrai tampon */}
        <filter id={inkId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3 0 0 0 2.6"
            result="mask"
          />
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${inkId})`} fill="currentColor" stroke="currentColor">
        <circle cx="80" cy="80" r="75" fill="none" strokeWidth="4" />
        <circle cx="80" cy="80" r="67" fill="none" strokeWidth="1.5" />
        <circle cx="80" cy="80" r="44" fill="none" strokeWidth="1.5" />
        <text className="stamp-ring" stroke="none">
          <textPath href={`#${pathId}`}>{ring}</textPath>
        </text>
        <text className="stamp-big" x="80" y="88" textAnchor="middle" stroke="none">
          {big}
        </text>
        <text className="stamp-small" x="80" y="108" textAnchor="middle" stroke="none">
          {small}
        </text>
      </g>
    </svg>
  );
}

export default Stamp;
