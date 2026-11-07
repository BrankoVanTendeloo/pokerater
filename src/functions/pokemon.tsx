import type {PokemonEntry} from "../api/pokemon"
import type {PokemonRatings} from "./elo"

function getTotalVotes(pokemon: PokemonEntry, ratings: PokemonRatings): number {
    return ratings[pokemon.name]?.votes ?? 0
}

function selectWeightedRandom(pokemon: PokemonEntry[], ratings: PokemonRatings): PokemonEntry {
    const minimumVotes = Math.min(...pokemon.map(entry => getTotalVotes(entry, ratings)))

    const candidates = pokemon.filter(entry => getTotalVotes(entry, ratings) === minimumVotes)

    const randomIndex = Math.floor(Math.random() * candidates.length)

    return candidates[randomIndex]
}

export function getRandomPokemonPair(pokemon: PokemonEntry[], ratings: PokemonRatings): [PokemonEntry, PokemonEntry] {
    if (pokemon.length < 2) {
        throw new Error("At least two Pokémon are required")
    }

    const first = selectWeightedRandom(pokemon, ratings)

    const remaining = pokemon.filter(entry => entry.name !== first.name)

    const second = selectWeightedRandom(remaining, ratings)

    return [first, second]
}
