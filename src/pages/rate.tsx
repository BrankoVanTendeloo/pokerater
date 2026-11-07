import {Button, Card, Group, Image, SimpleGrid, Stack, Text} from "@mantine/core"
import {useQueries} from "@tanstack/react-query"
import {useEffect, useState} from "react"

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

interface PokemonCardProps {
    pokemon: PokemonDetails | null
    placeholderName: string
    displayImages: boolean
}

function PokemonCard({pokemon, placeholderName, displayImages}: PokemonCardProps) {
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

                    <Group gap="xs" justify="center">
                        {pokemon.types.map(type => {
                            const image = typeImages[`../assets/types/${type}.png`]

                            return image ? (
                                <Image key={type} src={image} alt={type} w={32} h={32} />
                            ) : (
                                <Text key={type} size="sm">
                                    {type}
                                </Text>
                            )
                        })}
                    </Group>
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

interface DisplayedPair {
    names: [string, string]
    pokemon: [PokemonDetails, PokemonDetails]
}

const Rate = () => {
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
        setPair(getRandomPokemonPair(pokemonPool, ratings))
    }

    return (
        <Stack gap="lg">
            <SimpleGrid cols={{base: 1, sm: 2}} spacing="md">
                <PokemonCard
                    pokemon={currentPokemon[0]}
                    placeholderName={pair?.[0].name ?? ""}
                    displayImages={displayImages}
                />

                <PokemonCard
                    pokemon={currentPokemon[1]}
                    placeholderName={pair?.[1].name ?? ""}
                    displayImages={displayImages}
                />
            </SimpleGrid>

            <SimpleGrid cols={3} spacing="md">
                <Button disabled={!canVote} onClick={() => handleVote(Result.win)}>
                    Vote
                </Button>

                <Button variant="light" color="gray" disabled={!canVote} onClick={() => handleVote(Result.tie)}>
                    Tie
                </Button>

                <Button disabled={!canVote} onClick={() => handleVote(Result.lose)}>
                    Vote
                </Button>
            </SimpleGrid>
        </Stack>
    )
}

export default Rate
