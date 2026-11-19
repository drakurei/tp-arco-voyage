import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet"
import "leaflet/dist/leaflet.css"

// Carte OpenStreetMap centrée sur la destination (colonnes lat / long de l'API)
// Un cercle à l'encre rouge marque le pays, comme entouré au stylo sur une carte papier
function DestinationMap({ lat, long, name }) {
  if (lat === null || long === null || lat === undefined || long === undefined) {
    return <p className="capital">Coordonnées non renseignées pour cette destination.</p>
  }

  return (
    <figure className="map-print">
      <MapContainer
        center={[lat, long]}
        zoom={5}
        scrollWheelZoom={false}
        className="destination-map"
        aria-label={`Carte de ${name}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={[lat, long]}
          radius={22}
          pathOptions={{ color: "oklch(0.53 0.19 27)", weight: 3, fillOpacity: 0.08, dashArray: "6 4" }}
        >
          <Tooltip direction="top" offset={[0, -18]} permanent className="map-label">
            {name}
          </Tooltip>
        </CircleMarker>
      </MapContainer>
      <figcaption className="note">
        {lat.toFixed(2)}° {lat >= 0 ? "N" : "S"}, {Math.abs(long).toFixed(2)}° {long >= 0 ? "E" : "O"}
      </figcaption>
    </figure>
  )
}

export default DestinationMap
