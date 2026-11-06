export interface PokemonRating {
    id: string
    votes: number
    wins: number
    losses: number
    elo: number
}

export type PokemonRatings = Record<string, PokemonRating>

export const INITIAL_ELO = 1000
export const K_FACTOR = 32

export function UpdateRatings(ratings: PokemonRatings, pokemonA: string, pokemonB: string, result: Result): PokemonRatings {
    const ratingA = ratings[pokemonA] ?? {id: pokemonA, votes: 0, wins: 0, losses: 0, elo: INITIAL_ELO}

    const ratingB = ratings[pokemonB] ?? {id: pokemonB, votes: 0, wins: 0, losses: 0, elo: INITIAL_ELO}

    const newRatingA = CalculateEloChange(ratingA.elo, ratingB.elo, K_FACTOR, result)

    const newRatingB = CalculateEloChange(ratingB.elo, ratingA.elo, K_FACTOR, 1 - result)

    return {
        ...ratings,
        [pokemonA]: {
            ...ratingA,
            votes: ratingA.votes + 1,
            wins: ratingA.wins + (result === Result.win ? 1 : 0),
            losses: ratingA.losses + (result === Result.lose ? 1 : 0),
            elo: newRatingA,
        },
        [pokemonB]: {
            ...ratingB,
            votes: ratingB.votes + 1,
            wins: ratingB.wins + (result === Result.lose ? 1 : 0),
            losses: ratingB.losses + (result === Result.win ? 1 : 0),
            elo: newRatingB,
        },
    }
}

function CalculateExpectedScore(ratingA: number, ratingB: number) {
    return 1 / (1 + 10 ** ((ratingB - ratingA) / 400))
}

export const Result = {
    win: 1,
    lose: 0,
    tie: 0.5,
}
export type Result = (typeof Result)[keyof typeof Result]

function GetScoreFromResult(result: Result) {
    switch (result) {
        case Result.win:
            return 1
        case Result.lose:
            return 0
        default:
            return 0.5
    }
}

function CalculateEloChange(currentRating: number, opponentRating: number, kFactor: number, result: Result) {
    const performedScore: number = GetScoreFromResult(result)
    const expectedScore: number = CalculateExpectedScore(currentRating, opponentRating)
    return currentRating + kFactor * (performedScore - expectedScore)
}

export default CalculateEloChange
