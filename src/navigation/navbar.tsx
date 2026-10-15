import type {FunctionComponent} from 'react'
import {NavigationMenu, NavigationMenuList}
import StyledNavLink from './styledNavLink'

const Navbar: FunctionComponent = () => {
    return (
        <div className="w-auto block m-2">
            <NavigationMenu>
                <NavigationMenuList>
                    <StyledNavLink to="/">Small Webshop</StyledNavLink>
                    <StyledNavLink to="/laptops">Laptops</StyledNavLink>
                    <StyledNavLink to="/smartphones">Smartphones</StyledNavLink>
                    <StyledNavLink to="/kitchen">Kitchen</StyledNavLink>
                    <StyledNavLink to="/washing-machines">Washing Machines</StyledNavLink>
                    <StyledNavLink to="/about">About</StyledNavLink>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}

export default Navbar
