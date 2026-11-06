import {createContext, useContext, useEffect, useState, type FC, type ReactNode} from 'react'

import {type Result, UpdateRatings, type PokemonRatings} from '../functions/elo'

import {LoadRatings, SaveRatings} from '../functions/ratingStorage'

interface PokemonRatingsContextValue {
    ratings: PokemonRatings
    vote: (pokemonA: string, pokemonB: string, result: Result) => void
}

const PokemonRatingsContext = createContext<PokemonRatingsContextValue | null>(null)

interface PokemonRatingsProviderProps {
    children: ReactNode
}

export const PokemonRatingsProvider: FC<PokemonRatingsProviderProps> = ({children}) => {
    const [ratings, setRatings] = useState<PokemonRatings>(LoadRatings)

    useEffect(() => {
        SaveRatings(ratings)
    }, [ratings])

    function vote(pokemonA: string, pokemonB: string, result: Result) {
        setRatings(currentRatings => UpdateRatings(currentRatings, pokemonA, pokemonB, result))
    }

    return <PokemonRatingsContext.Provider value={{ratings, vote}}>{children}</PokemonRatingsContext.Provider>
}

export function usePokemonRatings() {
    const context = useContext(PokemonRatingsContext)

    if (!context) {
        throw new Error('usePokemonRatings must be used within a PokemonRatingsProvider')
    }

    return context
}
