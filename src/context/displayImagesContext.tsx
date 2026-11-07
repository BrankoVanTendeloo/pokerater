import {createContext, type FC, type PropsWithChildren, useContext, useEffect, useState} from "react"

interface DisplayImagesContextType {
    displayImages: boolean
    setDisplayImages: (value: boolean) => void
}

const DisplayImagesContext = createContext<DisplayImagesContextType | undefined>(undefined)

const STORAGE_KEY = "pokerater-display-images"

export const DisplayImagesProvider: FC<PropsWithChildren> = ({children}) => {
    const [displayImages, setDisplayImages] = useState<boolean>(() => {
        const storedValue = localStorage.getItem(STORAGE_KEY)

        // Default to true if no preference has been saved yet
        if (storedValue === null) return true

        return storedValue === "true"
    })

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, String(displayImages))
    }, [displayImages])

    return (
        <DisplayImagesContext.Provider value={{displayImages, setDisplayImages}}>
            {children}
        </DisplayImagesContext.Provider>
    )
}

export const useDisplayImages = () => {
    const context = useContext(DisplayImagesContext)

    if (!context) {
        throw new Error("useDisplayImages must be used within DisplayImagesProvider")
    }

    return context
}
