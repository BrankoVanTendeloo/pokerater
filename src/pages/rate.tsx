import {Button, Card, Group, Image, SimpleGrid, Stack, Text} from "@mantine/core"
import {useQueries} from "@tanstack/react-query"
import {useEffect, useState} from "react"
import type {PokemonEntry} from "../api/pokemon"
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

function PokemonCard({
    pokemon,
    displayImages,
}: {
    pokemon: Awaited<ReturnType<typeof getPokemonDetails>>
    displayImages: boolean
}) {
    return (
        <Card shadow="md" withBorder>
            <Stack align="center" gap="sm">
                {displayImages ? (
                    <Image src={pokemon.image} alt={pokemon.englishName} h={200} fit="contain" />
                ) : (
                    <Text fw={600} h={200} style={{display: "flex", alignItems: "center"}}>
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
        </Card>
    )
}

const Rate = () => {
    const {data: pokemonPool, isLoading, error} = usePokemonPool()
    const {displayImages} = useDisplayImages()
    const {vote} = usePokemonRatings()

    const [pair, setPair] = useState<[PokemonEntry, PokemonEntry] | null>(null)

    useEffect(() => {
        if (pokemonPool && !pair) {
            setPair(getRandomPokemonPair(pokemonPool))
        }
    }, [pokemonPool, pair])

    const pokemonQueries = useQueries({
        queries: pair
            ? pair.map(pokemon => ({
                  queryKey: ["pokemon-details", pokemon.name],
                  queryFn: () => getPokemonDetails(pokemon.name),
                  staleTime: 30 * 24 * 60 * 60 * 1000,
              }))
            : [],
    })

    if (isLoading || !pair) {
        return <Text>Loading Pokémon... Reload if it doesn't load.</Text>
    }

    if (error) {
        return <Text c="red">Failed to load the Pokémon pool.</Text>
    }

    if (pokemonQueries.some(query => query.isLoading)) {
        return <Text>Loading Pokémon details... Reload if it doesn't load.</Text>
    }

    if (pokemonQueries.some(query => query.error)) {
        return <Text c="red">Failed to load Pokémon details.</Text>
    }

    const firstPokemon = pokemonQueries[0].data
    const secondPokemon = pokemonQueries[1].data

    if (!firstPokemon || !secondPokemon) {
        return <Text>Waiting for Pokémon...</Text>
    }

    function handleVote(result: Result) {
        if (!pair || !pokemonPool) return

        vote(pair[0].name, pair[1].name, result)

        setPair(getRandomPokemonPair(pokemonPool))
    }

    return (
        <Stack gap="lg">
            <SimpleGrid cols={{base: 1, sm: 2}} spacing="md">
                <PokemonCard pokemon={firstPokemon} displayImages={displayImages} />

                <PokemonCard pokemon={secondPokemon} displayImages={displayImages} />
            </SimpleGrid>

            <SimpleGrid cols={3} spacing="md">
                <Button onClick={() => handleVote(Result.win)}>Vote</Button>

                <Button variant="light" color="gray" onClick={() => handleVote(Result.tie)}>
                    Tie
                </Button>

                <Button onClick={() => handleVote(Result.lose)}>Vote</Button>
            </SimpleGrid>
        </Stack>
    )
}

export default Rate
