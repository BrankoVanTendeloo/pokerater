import type {PokemonEntry} from "../api/pokemon"
import type {PokemonRatings} from "./elo"

function getTotalVotes(pokemon: PokemonEntry, ratings: PokemonRatings): number {
    return ratings[pokemon.name]?.votes ?? 0
}

function getTotalMatchups(ratings: PokemonRatings): number {
    return Object.values(ratings).reduce((sum, rating) => sum + rating.votes, 0) / 2
}

function selectLowestVotePokemon(pokemon: PokemonEntry[], ratings: PokemonRatings): PokemonEntry {
    const minimumVotes = Math.min(...pokemon.map(entry => getTotalVotes(entry, ratings)))

    const candidates = pokemon.filter(entry => getTotalVotes(entry, ratings) === minimumVotes)

    const randomIndex = Math.floor(Math.random() * candidates.length)

    return candidates[randomIndex]
}

export function getRandomPokemonPair(pokemon: PokemonEntry[], ratings: PokemonRatings): [PokemonEntry, PokemonEntry] {
    if (pokemon.length < 2) {
        throw new Error("At least two Pokémon are required")
    }

    const totalMatchups = getTotalMatchups(ratings)

    // Only Pokémon whose cooldown has expired are eligible.
    const eligible = pokemon.filter(entry => {
        const cooldownUntil = ratings[entry.name]?.cooldownUntil ?? 0

        return totalMatchups >= cooldownUntil
    })

    // Select the first Pokémon.
    const firstPool = eligible.length >= 2 ? eligible : pokemon

    const first = selectLowestVotePokemon(firstPool, ratings)

    // Remove the first Pokémon before selecting the second.
    const remaining = pokemon.filter(entry => entry.name !== first.name)

    const eligibleRemaining = remaining.filter(entry => {
        const cooldownUntil = ratings[entry.name]?.cooldownUntil ?? 0

        return totalMatchups >= cooldownUntil
    })

    const secondPool = eligibleRemaining.length > 0 ? eligibleRemaining : remaining

    const second = selectLowestVotePokemon(secondPool, ratings)

    return [first, second]
}
