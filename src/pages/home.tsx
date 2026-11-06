import {Button, Card, SimpleGrid} from "@mantine/core"
import type {FC, PropsWithChildren} from "react"
import {Link} from "react-router"

interface HomeCardProps extends PropsWithChildren {
    title: string
    callToAction: string
    to: string
}

const HomeCard: FC<HomeCardProps> = ({children, title, callToAction, to}) => {
    return (
        <Card>
            <h2>{title}</h2>
            <p>{children}</p>
            <Button component={Link} to={to} mt="auto">
                {callToAction}
            </Button>
        </Card>
    )
}

const Home: FC = () => {
    return (
        <>
            <h1>PokéRater</h1>
            <SimpleGrid cols={{base: 1, sm: 2}} spacing="lg">
                <HomeCard title="Rate Pokémon" callToAction="Start here" to="/rate">
                    Choose between two Pokémon which one you prefer.
                </HomeCard>
                <HomeCard title="Who's your favourite?" callToAction="Look here" to="/ranking">
                    Take a look at a full ranking of Pokémon rated by you.
                </HomeCard>
            </SimpleGrid>
        </>
    )
}

export default Home

// Cards with links to other pages
// Explaination of the website
