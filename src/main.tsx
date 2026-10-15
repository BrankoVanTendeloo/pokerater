import {MantineProvider} from '@mantine/core'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router'

createRoot(document.getElementById('root')!).render(
    <MantineProvider>
        <StrictMode>
            <BrowserRouter></BrowserRouter>
        </StrictMode>
        ,
    </MantineProvider>,
)

// Context: dark/light mode
