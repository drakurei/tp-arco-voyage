import { useEffect } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { Alert, Button, Col, Row, Form } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import * as yup from "yup"
import { fetchRegions, selectRegions } from "../features/destinations/destinationsSlice"
import { clearSearch, searchDestinations } from "../features/search/searchSlice"
import DestinationCard from "../components/DestinationCard"
import { LoadingLines } from "../components/PageStatus"
import { plural } from "../utils/format"
import { useRatings } from "../features/comments/useRatings"

// Création du schema de validation yup
// https://github.com/jquense/yup
// Permet de mettre en place des contraintes de validation sur nos formulaires
const searchSchema = yup.object({
  keyword: yup
    .string() // chaine de caractère
    .trim()
    // facultatif, mais au moins 2 caractères si le champ est rempli
    .test("min-si-rempli", "La recherche doit avoir au moins 2 caractères", (value) => !value || value.length >= 2)
    // obligatoire seulement si aucune région n'est choisie (l'API répond 400 sans critère)
    .when("region", {
      is: (region) => !region,
      then: (schema) => schema.required("Saisissez un mot-clé ou choisissez une région"),
    }),
  region: yup.string(), // facultatif : slug de la région
})

function SearchPage() {
  const dispatch = useDispatch()
  const regions = useSelector(selectRegions)
  const regionsStatus = useSelector((state) => state.destinations.regionsStatus)
  const { results, status, error } = useSelector((state) => state.search)
  useRatings(results)

  // Les critères de recherche sont gardés dans l'URL : /search?keyword=...&region=...
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get("keyword") ?? ""
  const region = searchParams.get("region") ?? ""
  const hasCriteria = keyword !== "" || region !== ""

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(searchSchema),
    defaultValues: { keyword, region },
  })

  useEffect(() => {
    if (regionsStatus === "idle") dispatch(fetchRegions())
  }, [regionsStatus, dispatch])

  // Le formulaire reprend les critères de l'URL
  // (on attend aussi les régions : sans leurs <option>, le menu ne peut pas afficher la région choisie)
  useEffect(() => {
    reset({ keyword, region })
  }, [keyword, region, regions.length, reset])

  // L'URL change (formulaire, recherche rapide, retour arrière) : on relance la recherche
  useEffect(() => {
    if (keyword || region) dispatch(searchDestinations({ keyword, region }))
    else dispatch(clearSearch())
  }, [keyword, region, dispatch])

  const onSubmit = (data) => {
    const params = {}
    if (data.keyword) params.keyword = data.keyword
    if (data.region) params.region = data.region
    setSearchParams(params)
  }

  const regionName = regions.find((r) => r.slug === region)?.name

  return (
    <>
      <h1 className="mb-4">Rechercher une destination</h1>

      <Form noValidate onSubmit={handleSubmit(onSubmit)} className="search-form mb-5" role="search">
        <Row className="g-3 align-items-start">
          <Col md={5}>
            <Form.Group controlId="keyword">
              <Form.Label>Mot-clé</Form.Label>
              <Form.Control
                type="text"
                placeholder="Pays, capitale ou région"
                isInvalid={!!errors.keyword}
                {...register("keyword")}
              />
              <Form.Control.Feedback type="invalid">{errors.keyword?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="region">
              <Form.Label>Région</Form.Label>
              <Form.Select {...register("region")}>
                <option value="">Toutes les régions</option>
                {regions.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3} className="search-submit">
            <Button type="submit" variant="primary" className="w-100">
              Rechercher
            </Button>
          </Col>
        </Row>
      </Form>

      {hasCriteria && (
        <>
          {status === "loading" && <LoadingLines lines={3} label="Recherche en cours…" />}
          {status === "failed" && <Alert variant="danger">{error}</Alert>}
          {status === "succeeded" && (
            <p className="capital mb-4" aria-live="polite">
              {results.length === 0
                ? "Aucune destination ne correspond à votre recherche."
                : `${plural(results.length, "destination trouvée", "destinations trouvées")}`}
              {keyword && <> pour « {keyword} »</>}
              {regionName && <> en {regionName}</>}
            </p>
          )}

          <Row xs={1} md={2} lg={3} className="g-4">
            {status === "succeeded" &&
              results.map((destination) => (
                <Col key={destination.id}>
                  <DestinationCard destination={destination} showText={false} />
                </Col>
              ))}
          </Row>
        </>
      )}
    </>
  )
}

export default SearchPage
