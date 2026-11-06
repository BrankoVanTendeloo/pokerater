import type { PokemonEntry } from '../api/pokemon'

function getTotalVotes(_pokemon: PokemonEntry): number {
    return 0
}

function selectWeightedRandom(pokemon: PokemonEntry[]): PokemonEntry {
    const weights = pokemon.map(entry => 1 / (getTotalVotes(entry) + 1))
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

    let random = Math.random() * totalWeight

    for (let i = 0; i < pokemon.length; i++) {
        random -= weights[i]

        if (random <= 0) {
            return pokemon[i]
        }
    }

    return pokemon[pokemon.length - 1]
}

export function getRandomPokemonPair(
    pokemon: PokemonEntry[],
): [PokemonEntry, PokemonEntry] {
    if (pokemon.length < 2) {
        throw new Error('At least two Pokémon are required')
    }

    const first = selectWeightedRandom(pokemon)
    const remaining = pokemon.filter(entry => entry.name !== first.name)
    const second = selectWeightedRandom(remaining)

    return [first, second]
}