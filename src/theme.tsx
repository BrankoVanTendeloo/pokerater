import { createTheme, virtualColor } from '@mantine/core'

const theme = createTheme({
    primaryColor: 'poke',

    colors: {
        poke: virtualColor({
            name: 'poke',
            light: 'red',
            dark: 'yellow',
        }),
    },

    primaryShade: {
        light: 6,
        dark: 4,
    },
})

export default theme
