import { Button, Card, Col, Alert, Form } from "react-bootstrap"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { clearAuthError, loginUser, selectUser } from "../features/auth/authSlice"

const loginSchema = yup.object({
    username: yup
        .string()
        .required("Le login est obligatoire"),
    password: yup
        .string()
        .required("Le mot de passe est obligatoire")
})

function LoginPage () {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    // erreur de connexion gardée dans le slice auth
    const error = useSelector((state) => state.auth.error)
    const user = useSelector(selectUser)

    // En quittant la page, on efface l'erreur pour ne pas la revoir au retour
    useEffect(() => {
        return () => dispatch(clearAuthError())
    }, [dispatch])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(loginSchema),
    })

    // loginUser est un thunk : unwrap() renvoie le résultat ou lève l'erreur
    const onSubmit = async (data) => {
        try {
            await dispatch(loginUser({ username: data.username, password: data.password })).unwrap()
            navigate("/profile")
        } catch {
            // le message d'erreur est déjà dans le state (auth.error)
        }
    }

    // Déjà connecté : pas besoin de la page de connexion
    if (user) {
        return <Navigate to="/profile" replace />
    }

    return (
        <>
            <Col md={8} lg={5} className="mx-auto">
                <Card className="auth-card">
                    <Card.Body>
                        <h1 className="mb-4">Connexion</h1>

                        <p className="capital mb-4">
                            Comptes de test dummyjson : <strong>emilys</strong> / <strong>emilyspass</strong> (admin)
                            ou <strong>averyp</strong> / <strong>averyppass</strong> (utilisateur)
                        </p>

                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                            <Form.Group className="mb-3" controlId="username">
                                <Form.Label>Login</Form.Label>
                                <Form.Control type="text" isInvalid={!!errors.username} {...register("username")} />
                                <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="password">
                                <Form.Label>Mot de passe</Form.Label>
                                <Form.Control type="password" isInvalid={!!errors.password} {...register("password")} />
                                <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                            </Form.Group>

                            <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
                                {isSubmitting ? "Connexion…" : "Se connecter"}
                            </Button>
                        </Form>

                        <p className="mt-4 mb-0 text-center">
                            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
                        </p>
                    </Card.Body>
                </Card>
            </Col>
        </>
    )
}

export default LoginPage
