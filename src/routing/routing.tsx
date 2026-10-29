import {type FC, Suspense} from 'react'
import {Route, Routes} from 'react-router'
import Home from '../pages/home'
import LoadingPage from '../pages/loadingPage'
import NotFoundPage from '../pages/notFoundPage'
import Ranking from '../pages/ranking'
import Rate from '../pages/rate'

const Routing: FC = () => {
    return (
        <Suspense fallback={<LoadingPage />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vote" element={<Rate />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    )
}

export default Routing
