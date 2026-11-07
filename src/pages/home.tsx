import {Button, Card, FileInput, Group, SimpleGrid, Stack, Text} from "@mantine/core"
import {type FC, type PropsWithChildren, useState} from "react"
import {Link} from "react-router"

import {usePokemonRatings} from "../context/pokemonRatingsContext"
import type {PokemonRatings} from "../functions/elo"

interface HomeCardProps extends PropsWithChildren {
    title: string
    callToAction: string
    to: string
}

const HomeCard: FC<HomeCardProps> = ({children, title, callToAction, to}) => {
    return (
        <Card>
            <h2>{title}</h2>
            <p>{children}</p>

            <Button component={Link} to={to} mt="auto">
                {callToAction}
            </Button>
        </Card>
    )
}

const HomeNavigation: FC = () => {
    return (
        <SimpleGrid cols={{base: 1, sm: 2}} spacing="lg">
            <HomeCard title="Rate Pokémon" callToAction="Start here" to="/rate">
                Choose between two Pokémon which one you prefer.
            </HomeCard>

            <HomeCard title="Who's your favourite?" callToAction="Look here" to="/ranking">
                Take a look at a full ranking of Pokémon rated by you.
            </HomeCard>
        </SimpleGrid>
    )
}

function isPokemonRatings(value: unknown): value is PokemonRatings {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false
    }

    return Object.entries(value).every(([key, entry]) => {
        if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
            return false
        }

        const pokemon = entry as Record<string, unknown>

        return (
            pokemon.id === key &&
            typeof pokemon.id === "string" &&
            Number.isInteger(pokemon.votes) &&
            Number(pokemon.votes) >= 0 &&
            Number.isInteger(pokemon.wins) &&
            Number(pokemon.wins) >= 0 &&
            Number.isInteger(pokemon.losses) &&
            Number(pokemon.losses) >= 0 &&
            Number(pokemon.wins) + Number(pokemon.losses) <= Number(pokemon.votes) &&
            typeof pokemon.elo === "number" &&
            Number.isFinite(pokemon.elo)
        )
    })
}

interface RatingBackupControlsProps {
    ratings: PokemonRatings
    onImport: (ratings: PokemonRatings) => void
    onMessage: (message: string) => void
}

const RatingBackupControls: FC<RatingBackupControlsProps> = ({ratings, onImport, onMessage}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    function handleExport() {
        const json = JSON.stringify(ratings, null, 4)

        const blob = new Blob([json], {
            type: "application/json",
        })

        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")

        link.href = url
        link.download = "pokerater-backup.json"
        link.click()

        URL.revokeObjectURL(url)
    }

    async function handleImport() {
        if (!selectedFile) return

        try {
            const contents = await selectedFile.text()
            const importedData: unknown = JSON.parse(contents)

            if (!isPokemonRatings(importedData)) {
                onMessage("Invalid backup file. Your ratings were not changed.")
                return
            }

            const confirmed = window.confirm("Importing this backup will overwrite all your current ratings. Continue?")

            if (!confirmed) return

            onImport(importedData)
            onMessage("Ratings successfully imported.")
        } catch {
            onMessage("Could not read the backup file. Your ratings were not changed.")
        } finally {
            setSelectedFile(null)
        }
    }

    return (
        <Stack gap="md">
            <h2>Manage your ratings</h2>

            <Text>
                Download a backup of your ratings or import an existing backup. Importing will overwrite your current
                ratings.
            </Text>

            <Group align="end" wrap="wrap">
                <Button onClick={handleExport}>Download backup</Button>

                <FileInput
                    label="Select backup file"
                    placeholder="Choose a JSON file"
                    accept=".json,application/json"
                    value={selectedFile}
                    onChange={setSelectedFile}
                    clearable
                    style={{flex: 1, minWidth: 200}}
                />

                <Button onClick={handleImport} disabled={!selectedFile}>
                    Import backup
                </Button>
            </Group>
        </Stack>
    )
}

interface ResetRatingsButtonProps {
    onReset: () => void
    onMessage: (message: string) => void
}

const ResetRatingsButton: FC<ResetRatingsButtonProps> = ({onReset, onMessage}) => {
    function handleReset() {
        const confirmed = window.confirm(
            "Are you sure you want to reset all ratings? This cannot be undone unless you have a backup.",
        )

        if (!confirmed) return

        onReset()
        onMessage("All ratings have been reset.")
    }

    return (
        <Button color="red" variant="light" onClick={handleReset}>
            Reset ratings
        </Button>
    )
}

const Home: FC = () => {
    const {ratings, replaceRatings, resetRatings} = usePokemonRatings()
    const [message, setMessage] = useState("")

    return (
        <>
            <h1>PokéRater</h1>

            <HomeNavigation />

            <Card mt="lg">
                <Stack gap="md">
                    <Group align="end" wrap="nowrap">
                        <div style={{flex: 1, minWidth: 0}}>
                            <RatingBackupControls ratings={ratings} onImport={replaceRatings} onMessage={setMessage} />
                        </div>

                        <ResetRatingsButton onReset={resetRatings} onMessage={setMessage} />
                    </Group>

                    {message && <Text size="sm">{message}</Text>}
                </Stack>
            </Card>
        </>
    )
}

export default Home
