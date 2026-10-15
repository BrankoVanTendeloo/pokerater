import type {FunctionComponent, PropsWithChildren} from 'react'
import {NavigationMenuItem, NavigationMenuLink} from '@/components/ui/navigation-menu.tsx'
import { Link } from 'react-router'

interface StyledNavLinkProps extends PropsWithChildren {
    to: string
}

const StyledNavLink: FunctionComponent<StyledNavLinkProps> = ({to, children}) => {
    return (
        <NavigationMenuItem>
            <NavigationMenuLink render={<Link to={to}/>}>
                {children}
            </NavigationMenuLink>
        </NavigationMenuItem>
    )
}

export default StyledNavLink
