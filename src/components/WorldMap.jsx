import { useNavigate } from "react-router-dom"
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet"
import "leaflet/dist/leaflet.css"

// Carte de toutes les destinations : un cercle par pays, cliquable vers sa fiche
function WorldMap({ destinations }) {
  const navigate = useNavigate()
  const located = destinations.filter((d) => d.lat !== null && d.long !== null)

  return (
    <figure className="map-print world-map-print">
      <MapContainer
        center={[25, 10]}
        zoom={2}
        minZoom={2}
        scrollWheelZoom={false}
        worldCopyJump
        className="destination-map world-map"
        aria-label="Carte des destinations"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {located.map((d) => (
          <CircleMarker
            key={d.id}
            center={[d.lat, d.long]}
            radius={9}
            pathOptions={{ color: "oklch(0.53 0.19 27)", weight: 3, fillOpacity: 0.25 }}
            eventHandlers={{ click: () => navigate(`/destinations/${d.slug}`) }}
          >
            <Tooltip direction="top" offset={[0, -8]} className="map-label">
              {d.name}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <figcaption className="note">
        {located.length} pays épinglés, cliquez sur un cercle pour ouvrir sa fiche
      </figcaption>
    </figure>
  )
}

export default WorldMap
