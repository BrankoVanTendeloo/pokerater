import {Image, ScrollArea, Select, Table, Text} from "@mantine/core"
import {useQueries} from "@tanstack/react-query"
import {useMemo, useState} from "react"

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

type SortKey = "name" | "elo" | "votes" | "wins" | "losses" | "ties"

type SortDirection = "asc" | "desc"

const Ranking = () => {
    const {ratings} = usePokemonRatings()
    const {displayImages} = useDisplayImages()

    const [sortKey, setSortKey] = useState<SortKey>("elo")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
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

            const details = pokemonDetails.get(pokemon.id)

            return details?.types.includes(selectedType) ?? false
        })

        const getValue = (pokemon: PokemonRating, key: SortKey) => {
            switch (key) {
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

        return filteredRatings.sort((a, b) => {
            const valueA = getValue(a, sortKey)
            const valueB = getValue(b, sortKey)

            let comparison: number

            if (typeof valueA === "string" && typeof valueB === "string") {
                comparison = valueA.localeCompare(valueB)
            } else {
                comparison = Number(valueA) - Number(valueB)
            }

            return sortDirection === "asc" ? comparison : -comparison
        })
    }, [ratingList, pokemonDetails, sortKey, sortDirection, selectedType])

    function handleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDirection(current => (current === "asc" ? "desc" : "asc"))
        } else {
            setSortKey(key)
            setSortDirection(key === "name" ? "asc" : "desc")
        }
    }

    function renderSortIndicator(key: SortKey) {
        if (sortKey !== key) return null

        return sortDirection === "asc" ? " ▲" : " ▼"
    }

    function sortHeader(label: string, key: SortKey) {
        return (
            <Table.Th
                onClick={() => handleSort(key)}
                style={{
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                }}
            >
                {label}
                {renderSortIndicator(key)}
            </Table.Th>
        )
    }

    if (ratingList.length === 0) {
        return <Text c="dimmed">No Pokémon have been rated yet. Start voting to build your ranking!</Text>
    }

    return (
        <>
            <Select
                label="Filter by type"
                placeholder="All types"
                data={typeOptions}
                value={selectedType}
                onChange={setSelectedType}
                clearable
                w={220}
                mb="md"
            />

            <ScrollArea>
                <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            {displayImages && <Table.Th>Image</Table.Th>}
                            <Table.Th>Types</Table.Th>
                            {sortHeader("Name", "name")}
                            {sortHeader("Rating", "elo")}
                            {sortHeader("Votes", "votes")}
                            {sortHeader("Wins", "wins")}
                            {sortHeader("Losses", "losses")}
                            {sortHeader("Ties", "ties")}
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {sortedRatings.map(pokemon => {
                            const details = pokemonDetails.get(pokemon.id)
                            const ties = pokemon.votes - pokemon.wins - pokemon.losses

                            return (
                                <Table.Tr key={pokemon.id}>
                                    {displayImages && (
                                        <Table.Td>
                                            <Image
                                                src={details?.image}
                                                alt={details?.englishName ?? pokemon.id}
                                                h={48}
                                                w={48}
                                                fit="contain"
                                            />
                                        </Table.Td>
                                    )}

                                    <Table.Td>
                                        {details ? (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 4,
                                                }}
                                            >
                                                {details.types.map(type => {
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
                        })}

                        {sortedRatings.length === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={displayImages ? 8 : 7}>
                                    <Text c="dimmed" ta="center">
                                        No rated Pokémon match this type.
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        </>
    )
}

export default Ranking
