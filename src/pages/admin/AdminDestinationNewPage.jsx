import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Alert, Button, Col, Form, Row } from "react-bootstrap"
import { useForm, useWatch } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useDispatch, useSelector } from "react-redux"
import { createDestination, fetchRegions, selectRegions } from "../../features/destinations/destinationsSlice"
import { slugify } from "../../utils/format"

// Mêmes contraintes que POST /api/destinations/store.php (tous les champs sont obligatoires)
const destinationSchema = yup.object({
  name: yup.string().trim().required("Le nom est obligatoire"),
  slug: yup
    .string()
    .trim()
    .required("Le slug est obligatoire")
    .matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Minuscules, chiffres et tirets uniquement (ex. : coree-du-sud)"),
  region_id: yup.string().required("Choisissez une région"),
  capital: yup.string().trim().required("La capitale est obligatoire"),
  description: yup.string().trim().required("La description est obligatoire").min(20, "20 caractères minimum"),
  image: yup.string().trim().required("L'image est obligatoire").url("L'adresse de l'image doit être une URL valide"),
  lat: yup
    .number()
    .typeError("La latitude doit être un nombre (ex. : 46.2276)")
    .required("La latitude est obligatoire")
    .min(-90, "Entre -90 et 90")
    .max(90, "Entre -90 et 90"),
  long: yup
    .number()
    .typeError("La longitude doit être un nombre (ex. : 2.2137)")
    .required("La longitude est obligatoire")
    .min(-180, "Entre -180 et 180")
    .max(180, "Entre -180 et 180"),
})

function AdminDestinationNewPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const regions = useSelector(selectRegions)
  const regionsStatus = useSelector((state) => state.destinations.regionsStatus)

  useEffect(() => {
    if (regionsStatus === "idle") dispatch(fetchRegions())
  }, [regionsStatus, dispatch])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: yupResolver(destinationSchema),
    defaultValues: { name: "", slug: "", region_id: "", capital: "", description: "", image: "", lat: "", long: "" },
  })

  // Le slug se remplit tout seul à partir du nom, tant qu'on ne l'a pas modifié à la main
  const name = useWatch({ control, name: "name" })
  const image = useWatch({ control, name: "image" })
  const slugTouched = !!dirtyFields.slug
  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(name))
  }, [name, slugTouched, setValue])

  const onSubmit = async (data) => {
    try {
      await dispatch(
        createDestination({
          ...data,
          region_id: Number(data.region_id),
          // colonnes varchar(20) dans la base : on envoie du texte
          lat: String(data.lat),
          long: String(data.long),
        })
      ).unwrap()
      navigate("/admin/destinations", { state: { created: data.name } })
    } catch (message) {
      const text = String(message)
      if (/slug/i.test(text)) setError("slug", { type: "server", message: text })
      else setError("root.server", { type: "server", message: text })
    }
  }

  return (
    <>
      <h1 className="mb-2">Nouvelle destination</h1>
      <p className="capital mb-4">
        Tous les champs sont obligatoires. <Link to="/admin/destinations">Retour à la liste</Link>
      </p>

      <Form noValidate onSubmit={handleSubmit(onSubmit)} className="search-form">
        {errors.root?.server && <Alert variant="danger">{errors.root.server.message}</Alert>}

        <Row className="g-3">
          <Col md={6}>
            <Form.Group controlId="dest-name">
              <Form.Label>Nom du pays</Form.Label>
              <Form.Control type="text" isInvalid={!!errors.name} {...register("name")} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="dest-slug">
              <Form.Label>Slug (adresse de la fiche)</Form.Label>
              <Form.Control type="text" isInvalid={!!errors.slug} {...register("slug")} />
              <Form.Control.Feedback type="invalid">{errors.slug?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="dest-region">
              <Form.Label>Région</Form.Label>
              <Form.Select isInvalid={!!errors.region_id} {...register("region_id")}>
                <option value="">Choisir…</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.region_id?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="dest-capital">
              <Form.Label>Capitale</Form.Label>
              <Form.Control type="text" isInvalid={!!errors.capital} {...register("capital")} />
              <Form.Control.Feedback type="invalid">{errors.capital?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group controlId="dest-description">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={4} isInvalid={!!errors.description} {...register("description")} />
              <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group controlId="dest-image">
              <Form.Label>Adresse de la photo</Form.Label>
              <Form.Control type="url" placeholder="https://…" isInvalid={!!errors.image} {...register("image")} />
              <Form.Control.Feedback type="invalid">{errors.image?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            {/* aperçu : la photo telle qu'elle sera collée dans le carnet */}
            {image && /^https?:\/\//.test(image) && (
              <figure className="print new-dest-preview">
                <img src={image} alt="Aperçu de la photo" />
              </figure>
            )}
          </Col>
          <Col md={6}>
            <Form.Group controlId="dest-lat">
              <Form.Label>Latitude</Form.Label>
              <Form.Control type="text" inputMode="decimal" placeholder="46.2276" isInvalid={!!errors.lat} {...register("lat")} />
              <Form.Control.Feedback type="invalid">{errors.lat?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="dest-long">
              <Form.Label>Longitude</Form.Label>
              <Form.Control type="text" inputMode="decimal" placeholder="2.2137" isInvalid={!!errors.long} {...register("long")} />
              <Form.Control.Feedback type="invalid">{errors.long?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Publication…" : "Publier la destination"}
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default AdminDestinationNewPage
