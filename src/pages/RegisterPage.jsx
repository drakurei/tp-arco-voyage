import { Button, Card, Col, Alert, Form } from "react-bootstrap"
import { useForm, useWatch } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { clearAuthError, registerUser } from "../features/auth/authSlice"
import { AVATAR_STYLES, avatarUrl } from "../utils/avatar"

// Mêmes champs que l'API du cours : POST /api/auth/register.php
const registerSchema = yup.object({
    username: yup
        .string()
        .trim()
        .required("Le login est obligatoire"),
    email: yup
        .string()
        .trim()
        .required("L'email est obligatoire")
        .email("L'email n'est pas valide"),
    password: yup
        .string()
        .required("Le mot de passe est obligatoire")
        .min(8, "Le mot de passe doit avoir 8 caractères minimum"),
    firstName: yup
        .string()
        .trim()
        .required("Le prénom est obligatoire"),
    lastName: yup
        .string()
        .trim()
        .required("Le nom est obligatoire"),
    gender: yup
        .string(), // facultatif
})

function RegisterPage () {
    const dispatch = useDispatch()
    // erreur d'inscription gardée dans le slice auth
    const error = useSelector((state) => state.auth.error)
    const [createdUser, setCreatedUser] = useState(null)

    // Avatar DiceBear : un style + un numéro pour en tirer un autre
    const [avatarStyle, setAvatarStyle] = useState(AVATAR_STYLES[0].id)
    const [avatarVariant, setAvatarVariant] = useState(0)

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            gender: "",
        },
    })

    // L'avatar suit le login tapé : chaque voyageur a le sien
    const username = useWatch({ control, name: "username" }) ?? ""
    const seed = `${username.trim() || "voyageur"}${avatarVariant ? `-${avatarVariant}` : ""}`
    const avatar = avatarUrl(seed, avatarStyle)

    // En quittant la page, on efface l'erreur pour ne pas la revoir ailleurs
    useEffect(() => {
        return () => dispatch(clearAuthError())
    }, [dispatch])

    // registerUser est un thunk : unwrap() renvoie le résultat ou lève l'erreur
    const onSubmit = async (data) => {
        setCreatedUser(null)
        try {
            const user = await dispatch(registerUser({ ...data, avatar })).unwrap()
            setCreatedUser(user)
            reset()
            setAvatarVariant(0)
        } catch {
            // le message d'erreur est déjà dans le state (auth.error)
        }
    }

    return (
        <Col md={10} lg={7} className="mx-auto">
            <Card className="auth-card">
                <Card.Body>
                    <h1 className="mb-4">Inscription</h1>

                    {error && <Alert variant="danger">{error}</Alert>}

                    {createdUser && (
                        <Alert variant="success" className="register-success">
                            <img src={createdUser.image} alt="" className="register-success-avatar" />
                            <span>
                                Merci {createdUser.firstName}, votre inscription a été envoyée (utilisateur n°{createdUser.id}).
                                dummyjson simule l'ajout sans l'enregistrer : pour vous connecter, utilisez
                                le compte de test indiqué sur la <Link to="/login">page de connexion</Link>.
                            </span>
                        </Alert>
                    )}

                    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                        {/* Avatar DiceBear, généré à partir du login */}
                        <div className="avatar-picker mb-4">
                            <img src={avatar} alt="Aperçu de votre avatar" className="avatar-preview" width="104" height="104" />
                            <div>
                                <p className="form-label mb-2">Votre avatar</p>
                                <div className="avatar-styles" role="radiogroup" aria-label="Style d'avatar">
                                    {AVATAR_STYLES.map((style) => (
                                        <Form.Check
                                            key={style.id}
                                            type="radio"
                                            inline
                                            id={`avatar-${style.id}`}
                                            name="avatarStyle"
                                            label={style.label}
                                            checked={avatarStyle === style.id}
                                            onChange={() => setAvatarStyle(style.id)}
                                        />
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="px-0"
                                    onClick={() => setAvatarVariant((n) => n + 1)}
                                >
                                    Tirer un autre avatar
                                </Button>
                            </div>
                        </div>

                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>Login</Form.Label>
                            <Form.Control type="text" placeholder="Votre login" isInvalid={!!errors.username} {...register("username")} />
                            <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" placeholder="Votre email" isInvalid={!!errors.email} {...register("email")} />
                            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Mot de passe</Form.Label>
                            <Form.Control type="password" placeholder="Votre mot de passe" isInvalid={!!errors.password} {...register("password")} />
                            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="firstName">
                            <Form.Label>Prénom</Form.Label>
                            <Form.Control type="text" placeholder="Votre prénom" isInvalid={!!errors.firstName} {...register("firstName")} />
                            <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="lastName">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control type="text" placeholder="Votre nom" isInvalid={!!errors.lastName} {...register("lastName")} />
                            <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="gender">
                            <Form.Label>Genre</Form.Label>
                            <Form.Select isInvalid={!!errors.gender} {...register("gender")}>
                                <option value="">...</option>
                                <option value="female">Femme</option>
                                <option value="male">Homme</option>
                                <option value="other">Autre</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.gender?.message}</Form.Control.Feedback>
                        </Form.Group>

                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? "Envoi…" : "Créer mon compte"}
                        </Button>
                    </Form>

                    <p className="mt-4 mb-0">
                        Déjà inscrit ? <Link to="/login">Se connecter</Link>
                    </p>
                </Card.Body>
            </Card>
        </Col>
    )
}

export default RegisterPage
