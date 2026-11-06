import { useQuery } from "@tanstack/react-query"

const BASE_URL = 'https://pokeapi.co/api/v2'

const CACHE_TIME = 7 * 24 * 60 * 60 * 1000

export interface PokemonEntry {
    name: string
    url: string
}

interface ResourceList {
    count: number
    results: PokemonEntry[]
}

const REGIONAL_EXCEPTIONS = new Set([
    'tauros-paldea-combat-breed',
    'tauros-paldea-blaze-breed',
    'tauros-paldea-aqua-breed',
    'darmanitan-galar-standard',
])

const REGIONAL_EXCLUSIONS = new Set([
    'raticate-totem-alola',
])

async function fetchData<T>(url: string): Promise<T> {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`PokéAPI error: ${response.status}`)
    }

    return response.json() as Promise<T>
}

export async function getPokemonPool(): Promise<PokemonEntry[]> {
    const [species, pokemon, regions] = await Promise.all([
        fetchData<ResourceList>(`${BASE_URL}/pokemon-species?limit=10000`),
        fetchData<ResourceList>(`${BASE_URL}/pokemon?limit=10000`),
        fetchData<ResourceList>(`${BASE_URL}/region?limit=1000`),
    ])

    const regionNames = regions.results.map(region => `-${region.name}`)

    const regionalPokemon = pokemon.results.filter(({ name }) => {
        if (REGIONAL_EXCLUSIONS.has(name)) return false
        if (REGIONAL_EXCEPTIONS.has(name)) return true

        return regionNames.some(suffix => name.endsWith(suffix))
    })

    const combined = [
        ...species.results,
        ...regionalPokemon,
    ]

    return Array.from(
        new Map(combined.map(entry => [entry.name, entry])).values()
    )
}

export function usePokemonPool() {
  return useQuery({
    queryKey: ['pokemon-pool'],
    queryFn: getPokemonPool,
    staleTime: CACHE_TIME,
  })
}
