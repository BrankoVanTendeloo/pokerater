import { useEffect, useState } from 'react'
import {Button, Card, Group, Image, SimpleGrid, Stack, Text} from '@mantine/core'
import { useQueries } from '@tanstack/react-query'
import {getPokemonDetails, usePokemonPool} from '../api/pokemon'
import type { PokemonEntry } from '../api/pokemon'
import { getRandomPokemonPair } from '../functions/pokemon'
import { useDisplayImages } from '../context/displayImagesContext'

const typeImages = import.meta.glob('../assets/types/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
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
                    <Image
                        src={pokemon.image}
                        alt={pokemon.englishName}
                        h={200}
                        fit="contain"
                    />
                ) : (
                    <Text fw={600} h={200} style={{ display: 'flex', alignItems: 'center' }}>
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
                            <Image
                                key={type}
                                src={image}
                                alt={type}
                                w={32}
                                h={32}
                            />
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
    const { data: pokemonPool, isLoading, error } = usePokemonPool()
    const { displayImages } = useDisplayImages()

    const [pair, setPair] = useState<[PokemonEntry, PokemonEntry] | null>(null)

    useEffect(() => {
        if (pokemonPool && !pair) {
            setPair(getRandomPokemonPair(pokemonPool))
        }
    }, [pokemonPool, pair])

    const pokemonQueries = useQueries({
        queries: pair
            ? pair.map(pokemon => ({
                queryKey: ['pokemon-details', pokemon.name],
                queryFn: () => getPokemonDetails(pokemon.name),
                staleTime: 30 * 24 * 60 * 60 * 1000,
            }))
            : [],
    })

    if (isLoading || !pair) {
        return <Text>Loading Pokémon...</Text>
    }

    if (error) {
        return <Text c="red">Failed to load the Pokémon pool.</Text>
    }

    if (pokemonQueries.some(query => query.isLoading)) {
        return <Text>Loading Pokémon details...</Text>
    }

    if (pokemonQueries.some(query => query.error)) {
        return <Text c="red">Failed to load Pokémon details.</Text>
    }

    const firstPokemon = pokemonQueries[0].data
    const secondPokemon = pokemonQueries[1].data

    if (!firstPokemon || !secondPokemon) {
        return <Text>Waiting for Pokémon...</Text>
    }

    return (
        <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <PokemonCard
                    pokemon={firstPokemon}
                    displayImages={displayImages}
                />

                <PokemonCard
                    pokemon={secondPokemon}
                    displayImages={displayImages}
                />
            </SimpleGrid>

            <SimpleGrid cols={3} spacing="md">
                <Button
                    onClick={() => console.log('Vote:', firstPokemon.name)}
                >
                    Vote
                </Button>

                <Button
                    variant="light"
                    color="gray"
                    onClick={() => console.log('Tie')}
                >
                    Tie
                </Button>

                <Button
                    onClick={() => console.log('Vote:', secondPokemon.name)}
                >
                    Vote
                </Button>
            </SimpleGrid>
        </Stack>
    )
}

export default Rate
