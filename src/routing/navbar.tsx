import type {FC} from 'react'
import {NavLink} from 'react-router'

const NavBar: FC = () => {
    return (
        <nav>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/rate">Rate</NavLink>
            <NavLink to="/ranking">Ranking</NavLink>
        </nav>
    )
}

export default NavBar
