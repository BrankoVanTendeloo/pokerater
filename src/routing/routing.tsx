import {type FC, Suspense} from "react"
import {Navigate, Route, Routes} from "react-router"
import Home from "../pages/home"
import LoadingPage from "../pages/loadingPage"
import NotFoundPage from "../pages/notFoundPage"
import Ranking from "../pages/ranking"
import Rate from "../pages/rate"

const Routing: FC = () => {
    return (
        <Suspense fallback={<LoadingPage />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rate" element={<Rate />} />
                <Route path="/ranking" element={<Ranking />} />

                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/vote" element={<Navigate to="/rate" replace />} />
                <Route path="/rank" element={<Navigate to="/rate" replace />} />
                <Route path="/rating" element={<Navigate to="/ranking" replace />} />
                <Route path="/ratings" element={<Navigate to="/ranking" replace />} />
                <Route path="/rankings" element={<Navigate to="/ranking" replace />} />

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    )
}

export default Routing
