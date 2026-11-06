import {AppShell, MantineProvider} from '@mantine/core'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router'
import '@mantine/core/styles.css'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import NavBar from './routing/navbar'
import Routing from './routing/routing'
import theme from './theme'
import { DisplayImagesProvider } from './context/displayImagesContext'
import { usePokemonPool } from './api/pokemon'

const PokemonPoolInitializer = () => {
    usePokemonPool()
    return null
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: import.meta.env.PROD,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <MantineProvider defaultColorScheme="light" theme={theme}>
        <StrictMode>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <PokemonPoolInitializer />
                    <DisplayImagesProvider>
                        <AppShell header={{height: 60}} padding="md">
                            <AppShell.Header>
                                <NavBar />
                            </AppShell.Header>
                            <AppShell.Main className="routing-container">
                                <Routing />
                            </AppShell.Main>
                        </AppShell>
                    </DisplayImagesProvider>

                </QueryClientProvider>
            </BrowserRouter>
        </StrictMode>
    </MantineProvider>,
)
