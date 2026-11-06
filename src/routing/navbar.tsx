import {Group, NavLink} from "@mantine/core"
import {Link, useLocation} from "react-router"
import ColourSchemeToggle from "./colourSchemeToggle"
import DisplayImagesToggle from "./displayImagesToggle"

const links = [
    {label: "Home", to: "/"},
    {label: "Rate", to: "/rate"},
    {label: "Ranking", to: "/ranking"},
]

const NavBar = () => {
    const {pathname} = useLocation()

    return (
        <Group h="100%" px="md" gap="md" justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
                {links.map(({label, to}) => (
                    <NavLink
                        key={to}
                        component={Link}
                        to={to}
                        label={label}
                        active={to === "/" ? pathname === "/" : pathname === to}
                        variant="light"
                        w="auto"
                        styles={{
                            root: {
                                display: "inline-flex",
                                flex: "0 0 auto",
                                width: "auto",
                                borderRadius: "var(--mantine-radius-md)",
                                padding: "8px 16px",
                            },
                            body: {
                                flex: "0 0 auto",
                            },
                        }}
                    />
                ))}
            </Group>

            <Group gap="md" style={{flexShrink: 0}}>
                <DisplayImagesToggle />
                <ColourSchemeToggle />
            </Group>
        </Group>
    )
}

export default NavBar
