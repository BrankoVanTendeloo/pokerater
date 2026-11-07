import {createContext, type FC, type ReactNode, useContext, useEffect, useState} from "react"
import {type PokemonRatings, type Result, UpdateRatings} from "../functions/elo"

import {LoadRatings, SaveRatings} from "../functions/ratingStorage"

interface PokemonRatingsContextValue {
    ratings: PokemonRatings
    vote: (pokemonA: string, pokemonB: string, result: Result) => void
    replaceRatings: (newRatings: PokemonRatings) => void
    resetRatings: () => void
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
        const cooldownA = Math.floor(Math.random() * 5) + 3
        const cooldownB = Math.floor(Math.random() * 5) + 3

        setRatings(currentRatings => UpdateRatings(currentRatings, pokemonA, pokemonB, result, cooldownA, cooldownB))
    }

    function replaceRatings(newRatings: PokemonRatings) {
        setRatings(newRatings)
    }

    function resetRatings() {
        setRatings({})
    }

    return (
        <PokemonRatingsContext.Provider value={{ratings, vote, replaceRatings, resetRatings}}>
            {children}
        </PokemonRatingsContext.Provider>
    )
}

export function usePokemonRatings() {
    const context = useContext(PokemonRatingsContext)

    if (!context) {
        throw new Error("usePokemonRatings must be used within a PokemonRatingsProvider")
    }

    return context
}
