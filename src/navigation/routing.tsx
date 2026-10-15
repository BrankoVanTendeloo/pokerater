import SearchPage from '@/pages/searchpage'
import UnderConstruction from '@/pages/underConstruction'
import type {FunctionComponent} from 'react'
import { Route, Routes } from 'react-router'

const Routing: FunctionComponent = () => {
    return (
        <Routes>
            <Route path={"/"} element={<SearchPage/>}/>
            <Route path={"/laptops"} element={<SearchPage/>}/>
            <Route path={"/smartphones"} element={<UnderConstruction/>}/>
            <Route path={"/kitchen"} element={<UnderConstruction/>}/>
            <Route path={"/washing-machines"} element={<UnderConstruction/>}/>
            <Route path={"/about"} element={<UnderConstruction/>}/>
        </Routes>
    )
}

export default Routing
