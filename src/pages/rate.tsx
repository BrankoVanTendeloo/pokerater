import { useEffect, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { usePokemonPool } from '../api/pokemon'
import { getPokemonDetails } from '../api/pokemon'
import type { PokemonEntry } from '../api/pokemon'
import { getRandomPokemonPair } from '../functions/pokemon'

const Rate = () => {
    const { data: pokemonPool, isLoading, error } = usePokemonPool()

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

    const firstPokemon = pokemonQueries[0]?.data
    const secondPokemon = pokemonQueries[1]?.data

    useEffect(() => {
        if (firstPokemon && secondPokemon) {
            console.log('First Pokémon:', firstPokemon)
            console.log('Second Pokémon:', secondPokemon)
        }
    }, [firstPokemon, secondPokemon])

    if (isLoading) return <p>Loading Pokémon...</p>
    if (error) return <p>Failed to load Pokémon.</p>

    return null
}

export default Rate
