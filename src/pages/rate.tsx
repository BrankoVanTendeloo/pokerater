import {Button, Card, Group, Image, SimpleGrid, Stack, Text} from "@mantine/core"
import {useQueries} from "@tanstack/react-query"
import {type FC, useEffect, useState} from "react"

import type {PokemonDetails, PokemonEntry} from "../api/pokemon"
import {getPokemonDetails, usePokemonPool} from "../api/pokemon"
import {useDisplayImages} from "../context/displayImagesContext"
import {usePokemonRatings} from "../context/pokemonRatingsContext"
import {Result} from "../functions/elo"
import {getRandomPokemonPair} from "../functions/pokemon"

const typeImages = import.meta.glob("../assets/types/*.png", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>

interface PokemonTypesProps {
    types: string[]
}

const PokemonTypes: FC<PokemonTypesProps> = ({types}) => {
    return (
        <Group gap="xs" justify="center">
            {types.map(type => {
                const image = typeImages[`../assets/types/${type.toLowerCase()}.png`]
                return image ? (
                    <Image key={type} src={image} alt={type} w={32} h={32} />
                ) : (
                    <Text key={type} size="sm">
                        {type}
                    </Text>
                )
            })}
        </Group>
    )
}

interface PokemonCardProps {
    pokemon: PokemonDetails | null
    placeholderName: string
    displayImages: boolean
}

const PokemonCard: FC<PokemonCardProps> = ({pokemon, placeholderName, displayImages}) => {
    return (
        <Card shadow="md" withBorder h={360}>
            {pokemon ? (
                <Stack h="100%" align="center" justify="center" gap="sm">
                    {displayImages ? (
                        <Image src={pokemon.image} alt={pokemon.englishName} h={200} fit="contain" />
                    ) : (
                        <Text
                            fw={600}
                            h={200}
                            style={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            {pokemon.name}
                        </Text>
                    )}

                    <Text fw={700} size="lg">
                        {pokemon.englishName}
                    </Text>

                    <PokemonTypes types={pokemon.types} />
                </Stack>
            ) : (
                <Stack h="100%" align="center" justify="center">
                    <Text c="dimmed" size="sm">
                        {placeholderName}
                    </Text>
                </Stack>
            )}
        </Card>
    )
}

interface PokemonPairProps {
    pokemon: [PokemonDetails | null, PokemonDetails | null]
    names: [string, string]
    displayImages: boolean
}

const PokemonPair: FC<PokemonPairProps> = ({pokemon, names, displayImages}) => {
    return (
        <SimpleGrid cols={{base: 1, sm: 2}} spacing="md">
            <PokemonCard pokemon={pokemon[0]} placeholderName={names[0]} displayImages={displayImages} />

            <PokemonCard pokemon={pokemon[1]} placeholderName={names[1]} displayImages={displayImages} />
        </SimpleGrid>
    )
}

interface VoteButtonsProps {
    canVote: boolean
    onVote: (result: Result) => void
}

const VoteButtons: FC<VoteButtonsProps> = ({canVote, onVote}) => {
    return (
        <SimpleGrid cols={3} spacing="md">
            <Button disabled={!canVote} onClick={() => onVote(Result.win)}>
                Vote
            </Button>

            <Button variant="light" color="gray" disabled={!canVote} onClick={() => onVote(Result.tie)}>
                Tie
            </Button>

            <Button disabled={!canVote} onClick={() => onVote(Result.lose)}>
                Vote
            </Button>
        </SimpleGrid>
    )
}

interface DisplayedPair {
    names: [string, string]
    pokemon: [PokemonDetails, PokemonDetails]
}

const Rate: FC = () => {
    const {data: pokemonPool, isLoading, error} = usePokemonPool()
    const {displayImages} = useDisplayImages()
    const {vote, ratings} = usePokemonRatings()

    const [pair, setPair] = useState<[PokemonEntry, PokemonEntry] | null>(null)
    const [displayedPair, setDisplayedPair] = useState<DisplayedPair | null>(null)

    useEffect(() => {
        if (pokemonPool && !pair) {
            setPair(getRandomPokemonPair(pokemonPool, ratings))
        }
    }, [pokemonPool, pair, ratings])

    const pokemonQueries = useQueries({
        queries: pair
            ? pair.map(pokemon => ({
                  queryKey: ["pokemon-details", pokemon.name],
                  queryFn: () => getPokemonDetails(pokemon.name),
                  staleTime: 30 * 24 * 60 * 60 * 1000,
              }))
            : [],
    })

    const firstQuery = pokemonQueries[0]
    const secondQuery = pokemonQueries[1]

    useEffect(() => {
        if (pair && firstQuery?.data && secondQuery?.data) {
            setDisplayedPair({
                names: [pair[0].name, pair[1].name],
                pokemon: [firstQuery.data, secondQuery.data],
            })
        }
    }, [pair, firstQuery?.data, secondQuery?.data])

    if (error) {
        return <Text c="red">Failed to load the Pokémon pool.</Text>
    }

    const isCurrentPairLoaded =
        !!pair && !!displayedPair && displayedPair.names[0] === pair[0].name && displayedPair.names[1] === pair[1].name

    const currentPokemon: [PokemonDetails | null, PokemonDetails | null] =
        isCurrentPairLoaded && displayedPair ? displayedPair.pokemon : [null, null]

    const canVote =
        !isLoading &&
        !!pair &&
        !!firstQuery?.data &&
        !!secondQuery?.data &&
        !firstQuery.isFetching &&
        !secondQuery.isFetching &&
        !firstQuery.isError &&
        !secondQuery.isError

    function handleVote(result: Result) {
        if (!canVote || !pair || !pokemonPool) return

        vote(pair[0].name, pair[1].name, result)

        setPair(null)
    }

    return (
        <Stack gap="lg">
            <PokemonPair
                pokemon={currentPokemon}
                names={[pair?.[0].name ?? "", pair?.[1].name ?? ""]}
                displayImages={displayImages}
            />

            <VoteButtons canVote={canVote} onVote={handleVote} />
        </Stack>
    )
}

export default Rate
