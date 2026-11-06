import {createContext, type FC, type PropsWithChildren, useContext, useState} from "react"

interface DisplayImagesContextType {
    displayImages: boolean
    setDisplayImages: (value: boolean) => void
}

const DisplayImagesContext = createContext<DisplayImagesContextType | undefined>(undefined)

export const DisplayImagesProvider: FC<PropsWithChildren> = ({children}) => {
    const [displayImages, setDisplayImages] = useState(true)

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
