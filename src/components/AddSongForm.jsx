import { useState } from "react"
import SearchCard from "./SearchCard"
import Loader from "./Loader"
import styles from "./styles/AddSongForm.css"
import { navigate } from "astro:transitions/client"

const AddSongForm = ({sessionCookie}) => {
    const [error, setError] = useState("")
    const [searchedTracks, setSearchedTracks] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [notFound, setNotFound] = useState(false)
    const [previousLink, setPreviousLink] = useState("")
    const [nextLink, setNextLink] = useState("")

    const handleSearch = async(e) =>{
        setIsLoading(true)
        setError("")
        setSearchedTracks([])
        e.preventDefault()

        const formData = new FormData(e.target)

        const res = await fetch("/api/spotify", {
            method: "POST",
            body: formData
        })

        const json = await res.json()

        if(res.ok){
            if(json.tracks.length === 0){
                setNotFound(true)
            } else{
                setNotFound(false)
            }

            console.log(json.tracks)

            setSearchedTracks(json.tracks)
            setNextLink(json.next)
            setPreviousLink(json.previous)
        } else{
            setError(json.error)
        }

        setIsLoading(false)
    }

    const handleLoad = async(next) =>{
        setIsLoading(true)
        setError("")
        setSearchedTracks([])

        const res = await fetch("api/spotify", {
            method: "POST",
            body: JSON.stringify(next ? {nextLink} : {previousLink}),
            headers: {
                "Content-Type": "application/json"
            }
        })

        const json = await res.json()

        if(res.ok){
            setSearchedTracks(json.tracks)
            setNextLink(json.next)
            setPreviousLink(json.previous)
        } else{
            setError(json.error)
        }

        setIsLoading(false)
    }

    const handleSubmit = async(e, spotifyId) =>{
        setError("")
        e.preventDefault()

        const res = await fetch("api/songs", {
            method: "POST",
            body: JSON.stringify({spotifyId}),
            headers: {
                "Authorization": `Bearer ${sessionCookie}`,
                "Content-Type": "application/json"
            }
        })

        const json = await res.json()

        if(res.ok){
            navigate("/", {history: "push"})
        } else{
            setError(json.error)
        }
    }

    return (
        <>
            <form onSubmit={e => {
                handleSearch(e)
            }}>
                {error && <div className="error"><span>!</span>{error}</div>}

                <label htmlFor="title">Song Title:</label>
                <input type="text" name="title" id="title" />

                <label htmlFor="artists">Artist/s (comma separated):</label>
                <input type="text" name="artists" id="artists" />

                <label htmlFor="album">Album (optional):</label>
                <input type="text" name="album" id="album" />

                <input type="submit" value="Search" />
            </form>

            {isLoading &&
                <Loader />
            }

            {searchedTracks.length > 0 &&
                <>
                    <div>
                        {searchedTracks.map(searchedTrack =>(
                                <SearchCard key={searchedTrack.id} track={searchedTrack} handleSubmit={handleSubmit}/>
                            ))
                        }

                        <div className="load-buttons-container">
                            {previousLink && <button className="load" onClick={() => handleLoad(false)}>Load Previous</button>}
                            {nextLink && <button className="load" onClick={() => handleLoad(true)}>Load More</button>}
                        </div>
                    </div>
                </>
            }

            {!isLoading && notFound &&
                <div className="not-found">
                    <h3>That track was not found on Spotify</h3>
                    <p>Are you sure it exists ..?</p>
                </div>
            }
        </>
    );
}
 
export default AddSongForm;