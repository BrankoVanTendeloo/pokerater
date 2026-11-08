import {useQuery} from "@tanstack/react-query"

const BASE_URL = "https://pokeapi.co/api/v2"

const CACHE_TIME = 7 * 24 * 60 * 60 * 1000

export interface PokemonEntry {
    name: string
    url: string
}

interface ResourceList {
    count: number
    results: PokemonEntry[]
}

const EXTRA_INCLUSIONS = new Set([
    "tauros-paldea-combat-breed",
    "tauros-paldea-blaze-breed",
    "tauros-paldea-aqua-breed",
    "darmanitan-galar-standard",
    "lycanroc-midday",
    "lycanroc-dusk",
    "lycanroc-midnight",
    "deoxys-normal",
    "wormadam-plant",
    "wormadam-sandy",
    "wormadam-trash",
    "giratina-altered",
    "giratina-origin",
    "dialga-origin",
    "palkia-origin",
    "shaymin-land",
    "basculin-red-striped",
    "frillish-male",
    "jellicent-male",
    "tornadus-incarnate",
    "thundurus-incarnate",
    "enamorus-incarnate",
    "landorus-incarnate",
    "tornadus-therian",
    "thundurus-therian",
    "enamorus-therian",
    "landorus-therian",
    "meloetta-aria",
    "pyroar-male",
    "meowstic-male",
    "aegislash-shield",
    "pumpkaboo-average",
    "gourgeist-average",
    "zygarde-50",
    "oricorio-baile",
    "wishiwashi-solo",
    "wishiwashi-school",
    "minior-red-meteor",
    "mimikyu-disguised",
    "toxtricity-amped",
    "eiscue-ice",
    "indeedee-male",
    "morpeko-full-belly",
    "urshifu-single-strike",
    "urshifu-rapid-strike",
    "basculegion-male",
    "oinkologne-male",
    "maushold-family-of-four",
    "squawkabilly-green-plumage",
    "palafin-hero",
    "tatsugiri-curly",
    "dudunsparce-two-segment",
    "keldeo-resolute",
    "rotom-heat",
    "rotom-wash",
    "rotom-frost",
    "rotom-fan",
    "rotom-mow",
    "necrozma-dusk",
    "necrozma-dawn",
    "necrozma-ultra",
])

const REGIONAL_EXCLUSIONS = new Set(["raticate-totem-alola"])

const SPECIES_EXCLUSIONS = new Set([
    "darmanitan",
    "lycanroc",
    "deoxys",
    "wormadam",
    "giratina",
    "shaymin",
    "basculin",
    "frillish",
    "jellicent",
    "tornadus",
    "thundurus",
    "enamorus",
    "landorus",
    "keldeo",
    "meloetta",
    "pyroar",
    "meowstic",
    "aegislash",
    "pumpkaboo",
    "gourgeist",
    "zygarde",
    "oricorio",
    "wishiwashi",
    "minior",
    "mimikyu",
    "toxtricity",
    "eiscue",
    "indeedee",
    "morpeko",
    "urshifu",
    "basculegion",
    "oinkologne",
    "maushold",
    "squawkabilly",
    "palafin",
    "tatsugiri",
    "dudunsparce",
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

    const regionalPokemon = pokemon.results.filter(({name}) => {
        if (REGIONAL_EXCLUSIONS.has(name)) return false
        if (EXTRA_INCLUSIONS.has(name)) return true

        return regionNames.some(suffix => name.endsWith(suffix))
    })

    const defaultPokemon = species.results.filter(({name}) => !SPECIES_EXCLUSIONS.has(name))

    const combined = [...defaultPokemon, ...regionalPokemon]

    return Array.from(new Map(combined.map(entry => [entry.name, entry])).values())
}

interface PokemonDetailsResponse {
    name: string
    types: {
        type: {
            name: string
        }
    }[]
    sprites: {
        other: {
            "official-artwork": {
                front_default: string | null
            }
        }
        front_default: string | null
    }
    species: {
        url: string
    }
}

interface PokemonSpeciesResponse {
    names: {
        name: string
        language: {
            name: string
        }
    }[]
}

export interface PokemonDetails {
    name: string
    englishName: string
    types: string[]
    image: string | null
}

export async function getPokemonDetails(name: string): Promise<PokemonDetails> {
    const pokemon = await fetchData<PokemonDetailsResponse>(`${BASE_URL}/pokemon/${name}`)

    const species = await fetchData<PokemonSpeciesResponse>(pokemon.species.url)

    const englishName = species.names.find(entry => entry.language.name === "en")?.name ?? pokemon.name

    return {
        name: pokemon.name,
        englishName,
        types: pokemon.types.map(entry => entry.type.name),
        image: pokemon.sprites.other["official-artwork"].front_default ?? pokemon.sprites.front_default,
    }
}

export function usePokemonPool() {
    return useQuery({
        queryKey: ["pokemon-pool"],
        queryFn: getPokemonPool,
        staleTime: CACHE_TIME,
    })
}

export function usePokemonDetails(name: string) {
    return useQuery({
        queryKey: ["pokemon-details", name],
        queryFn: () => getPokemonDetails(name),
        staleTime: 30 * 24 * 60 * 60 * 1000,
    })
}
