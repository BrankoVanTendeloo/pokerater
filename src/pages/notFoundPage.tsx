import {type FC, useEffect} from "react"
import {useNavigate} from "react-router"

const NotFoundPage: FC = () => {
    const navigate = useNavigate()
    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate("/")
        }, 5000)
        return () => clearTimeout(timeout)
    })

    return (
        <>
            <p>Page not found.</p>
            <p>Redirecting back to home...</p>
        </>
    )
}

export default NotFoundPage
