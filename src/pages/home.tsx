import {Button, Card} from '@mantine/core'
import type {FC, PropsWithChildren} from 'react'

interface HomeCardProps extends PropsWithChildren {
    title: string
    callToAction: string
}

const HomeCard: FC<HomeCardProps> = ({children, title, callToAction}) => {
    return (
        <Card>
            <h2>{title}</h2>
            <p>{children}</p>
            <Button>{callToAction}</Button>
        </Card>
    )
}

const Home: FC = () => {
    return (
        <>
            <h1>PokéRater</h1>
            <HomeCard title="Rate Pokémon" callToAction="Start here">
                Choose between two Pokémon which one you prefer.
            </HomeCard>
            <HomeCard title="Who's your favourite?" callToAction="Look here">
                Take a look at a full ranking of Pokémon rated by you.
            </HomeCard>
        </>
    )
}

export default Home

// Cards with links to other pages
// Explaination of the website
