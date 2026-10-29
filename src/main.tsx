import {AppShell, MantineProvider} from '@mantine/core'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router'
import '@mantine/core/styles.css'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import NavBar from './routing/navbar'
import Routing from './routing/routing'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: import.meta.env.PROD,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <MantineProvider defaultColorScheme="light">
        <StrictMode>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <AppShell header={{height: 60}} padding="md">
                        <AppShell.Header>
                            <NavBar />
                        </AppShell.Header>
                        <AppShell.Main className="routing-container">
                            <Routing />
                        </AppShell.Main>
                    </AppShell>
                </QueryClientProvider>
            </BrowserRouter>
        </StrictMode>
    </MantineProvider>,
)

// Context: dark/light mode
