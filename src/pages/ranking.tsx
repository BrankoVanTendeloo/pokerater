import {Image, ScrollArea, Select, Table, Text} from "@mantine/core"
import {useQueries} from "@tanstack/react-query"
import {type FC, useMemo, useState} from "react"

import {getPokemonDetails} from "../api/pokemon"
import {useDisplayImages} from "../context/displayImagesContext"
import {usePokemonRatings} from "../context/pokemonRatingsContext"
import type {PokemonRating} from "../functions/elo"

const typeImages = import.meta.glob("../assets/types/*.png", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>

const typeOptions = [
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy",
].map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
}))

type SortKey = "rank" | "name" | "elo" | "votes" | "wins" | "losses" | "ties"
type SortDirection = "asc" | "desc"

interface RankedPokemon extends PokemonRating {
    rank: number
}

interface PokemonDetails {
    englishName: string
    image: string | null
    types: string[]
}

interface RankingStatsProps {
    pokemonCount: number
    totalMatchups: number
}

interface RankingTypeFilterProps {
    selectedType: string | null
    onTypeChange: (type: string | null) => void
}

interface SortHeaderProps {
    label: string
    sortKey: SortKey
    currentSortKey: SortKey
    sortDirection: SortDirection
    onSort: (key: SortKey) => void
}

interface PokemonTypesProps {
    types: string[]
}

interface RankingRowProps {
    pokemon: RankedPokemon
    details: PokemonDetails | undefined
    displayImages: boolean
}

interface RankingTableProps {
    pokemon: RankedPokemon[]
    pokemonDetails: Map<string, PokemonDetails | undefined>
    displayImages: boolean
    sortKey: SortKey
    sortDirection: SortDirection
    onSort: (key: SortKey) => void
}

const RankingStats: FC<RankingStatsProps> = ({pokemonCount, totalMatchups}) => {
    return (
        <>
            <Text size="sm" c="dimmed" mb="xs">
                {pokemonCount} Pokémon rated
            </Text>

            <Text size="sm" c="dimmed" mb="xs">
                {totalMatchups} total votes
            </Text>
        </>
    )
}

const RankingTypeFilter: FC<RankingTypeFilterProps> = ({selectedType, onTypeChange}) => {
    return (
        <Select
            label="Filter by type"
            placeholder="All types"
            data={typeOptions}
            value={selectedType}
            onChange={onTypeChange}
            clearable
            w={220}
            mb="md"
        />
    )
}

const SortHeader: FC<SortHeaderProps> = ({label, sortKey, currentSortKey, sortDirection, onSort}) => {
    const indicator = currentSortKey !== sortKey ? "" : sortDirection === "asc" ? " ▲" : " ▼"

    return (
        <Table.Th
            onClick={() => onSort(sortKey)}
            style={{
                cursor: "pointer",
                userSelect: "none",
                whiteSpace: "nowrap",
            }}
        >
            {label}
            {indicator}
        </Table.Th>
    )
}

const PokemonTypes: FC<PokemonTypesProps> = ({types}) => {
    return (
        <div style={{display: "flex", gap: 4}}>
            {types.map(type => {
                const image = typeImages[`../assets/types/${type}.png`]

                return image ? (
                    <Image key={type} src={image} alt={type} w={24} h={24} />
                ) : (
                    <Text key={type} size="xs">
                        {type}
                    </Text>
                )
            })}
        </div>
    )
}

const RankingRow: FC<RankingRowProps> = ({pokemon, details, displayImages}) => {
    const ties = pokemon.votes - pokemon.wins - pokemon.losses

    return (
        <Table.Tr>
            <Table.Td>{pokemon.rank}</Table.Td>

            {displayImages && (
                <Table.Td>
                    <Image
                        src={details?.image ?? undefined}
                        alt={details?.englishName ?? pokemon.id}
                        h={48}
                        w={48}
                        fit="contain"
                    />
                </Table.Td>
            )}

            <Table.Td>
                {details ? (
                    <PokemonTypes types={details.types} />
                ) : (
                    <Text c="dimmed" size="xs">
                        Loading...
                    </Text>
                )}
            </Table.Td>

            <Table.Td>{details?.englishName ?? pokemon.id}</Table.Td>
            <Table.Td>{Math.round(pokemon.elo)}</Table.Td>
            <Table.Td>{pokemon.votes}</Table.Td>
            <Table.Td>{pokemon.wins}</Table.Td>
            <Table.Td>{pokemon.losses}</Table.Td>
            <Table.Td>{ties}</Table.Td>
        </Table.Tr>
    )
}

const RankingTable: FC<RankingTableProps> = ({
    pokemon,
    pokemonDetails,
    displayImages,
    sortKey,
    sortDirection,
    onSort,
}) => {
    const headers: [string, SortKey][] = [
        ["Name", "name"],
        ["Rating", "elo"],
        ["Votes", "votes"],
        ["Wins", "wins"],
        ["Losses", "losses"],
        ["Ties", "ties"],
    ]

    return (
        <ScrollArea>
            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <SortHeader
                            label="Rank"
                            sortKey="rank"
                            currentSortKey={sortKey}
                            sortDirection={sortDirection}
                            onSort={onSort}
                        />

                        {displayImages && <Table.Th>Image</Table.Th>}

                        <Table.Th>Types</Table.Th>

                        {headers.map(([label, key]) => (
                            <SortHeader
                                key={key}
                                label={label}
                                sortKey={key}
                                currentSortKey={sortKey}
                                sortDirection={sortDirection}
                                onSort={onSort}
                            />
                        ))}
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {pokemon.map(entry => (
                        <RankingRow
                            key={entry.id}
                            pokemon={entry}
                            details={pokemonDetails.get(entry.id)}
                            displayImages={displayImages}
                        />
                    ))}

                    {pokemon.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={displayImages ? 9 : 8}>
                                <Text c="dimmed" ta="center">
                                    No rated Pokémon match this type.
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    )
}

const Ranking: FC = () => {
    const {ratings} = usePokemonRatings()
    const {displayImages} = useDisplayImages()

    const [sortKey, setSortKey] = useState<SortKey>("rank")
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [selectedType, setSelectedType] = useState<string | null>(null)

    const ratingList = Object.values(ratings)

    const pokemonQueries = useQueries({
        queries: ratingList.map(pokemon => ({
            queryKey: ["pokemon-details", pokemon.id],
            queryFn: () => getPokemonDetails(pokemon.id),
            staleTime: 30 * 24 * 60 * 60 * 1000,
        })),
    })

    const pokemonDetails = useMemo(() => {
        return new Map(ratingList.map((pokemon, index) => [pokemon.id, pokemonQueries[index]?.data]))
    }, [ratingList, pokemonQueries])

    const sortedRatings = useMemo(() => {
        const filteredRatings = ratingList.filter(pokemon => {
            if (!selectedType) return true

            return pokemonDetails.get(pokemon.id)?.types.includes(selectedType) ?? false
        })

        const rankMap = new Map<string, number>()
        const eloSorted = [...filteredRatings].sort((a, b) => b.elo - a.elo)

        let currentRank = 1

        eloSorted.forEach((pokemon, index) => {
            if (index > 0 && pokemon.elo !== eloSorted[index - 1].elo) {
                currentRank = index + 1
            }

            rankMap.set(pokemon.id, currentRank)
        })

        const getValue = (pokemon: PokemonRating, key: SortKey): number | string => {
            switch (key) {
                case "rank":
                    return rankMap.get(pokemon.id) ?? 0
                case "name":
                    return (pokemonDetails.get(pokemon.id)?.englishName ?? pokemon.id).toLowerCase()
                case "elo":
                    return pokemon.elo
                case "votes":
                    return pokemon.votes
                case "wins":
                    return pokemon.wins
                case "losses":
                    return pokemon.losses
                case "ties":
                    return pokemon.votes - pokemon.wins - pokemon.losses
            }
        }

        return [...filteredRatings]
            .sort((a, b) => {
                const valueA = getValue(a, sortKey)
                const valueB = getValue(b, sortKey)

                const comparison =
                    typeof valueA === "string" && typeof valueB === "string"
                        ? valueA.localeCompare(valueB)
                        : Number(valueA) - Number(valueB)

                return sortDirection === "asc" ? comparison : -comparison
            })
            .map(pokemon => ({
                ...pokemon,
                rank: rankMap.get(pokemon.id) ?? 0,
            }))
    }, [ratingList, pokemonDetails, sortKey, sortDirection, selectedType])

    function handleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDirection(current => (current === "asc" ? "desc" : "asc"))
        } else {
            setSortKey(key)
            setSortDirection(key === "name" || key === "rank" ? "asc" : "desc")
        }
    }

    const totalMatchups = ratingList.reduce((total, pokemon) => total + pokemon.votes, 0) / 2

    if (ratingList.length === 0) {
        return <Text c="dimmed">No Pokémon have been rated yet. Start voting to build your ranking!</Text>
    }

    return (
        <>
            <RankingStats pokemonCount={ratingList.length} totalMatchups={totalMatchups} />

            <RankingTypeFilter selectedType={selectedType} onTypeChange={setSelectedType} />

            <RankingTable
                pokemon={sortedRatings}
                pokemonDetails={pokemonDetails}
                displayImages={displayImages}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
            />
        </>
    )
}

export default Ranking
