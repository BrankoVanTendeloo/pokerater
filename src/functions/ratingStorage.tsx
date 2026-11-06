import type {PokemonRatings} from './elo'

const STORAGE_KEY = 'pokerater-ratings'

export function LoadRatings(): PokemonRatings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)

        return stored ? (JSON.parse(stored) as PokemonRatings) : {}
    } catch {
        return {}
    }
}

export function SaveRatings(ratings: PokemonRatings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings))
}
