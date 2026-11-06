import { Switch } from '@mantine/core'
import { useDisplayImages } from "../context/displayImagesContext"

const DisplayImagesToggle = () => {
    const { displayImages, setDisplayImages } = useDisplayImages()

    return (
        <Switch
            label="Display images"
            checked={displayImages}
            onChange={(event) =>
                setDisplayImages(event.currentTarget.checked)
            }
        />
    )
}

export default DisplayImagesToggle
