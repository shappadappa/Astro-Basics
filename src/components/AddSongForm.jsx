import { useState } from "react"
import styles from "./styles/AddSongForm.css"

const AddSongForm = ({sessionCookie}) => {
    const [error, setError] = useState("")
    const [searchedTracks, setSearchedTracks] = useState([])

    const handleSearch = async(e) =>{
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
            console.log(json.tracks)
            setSearchedTracks(json.tracks)
        } else{
            setError(json.error)
        }
    }

    const handleSubmit = async(e, spotifyId) =>{
        setError("")
        e.preventDefault()

        const res = await fetch(`api/songs`, {
            method: "POST",
            body: JSON.stringify({spotifyId}),
            headers: {
                "Authorization": `Bearer ${sessionCookie}`,
                "Content-Type": "application/json"
            }
        })

        const json = await res.json()

        if(res.ok){
            window.location = "/"
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

            {searchedTracks.length > 0 && 
                <>
                    <div>
                        {searchedTracks.map(searchedTrack =>(
                            <div className="searched-song" key={searchedTrack.id}>
                                <h3>
                                    🎶 <a target="_blank" href={`https://open.spotify.com/track/${searchedTrack.id}`}>
                                        {searchedTrack.name}
                                    </a>
                                </h3>
                                <h4>By {searchedTrack.artists.map((artist, index) =>(
                                    <span key={artist.id}>
                                        <a target="_blank" key={artist.id} href={`https://open.spotify.com/artist/${artist.id}`}>
                                            {`${artist.name}`}
                                        </a>
                                        <>
                                            {index === searchedTrack.artists.length - 2 && <> and </>}
                                            {index !== searchedTrack.artists.length - 1 &&
                                            index !== searchedTrack.artists.length - 2 &&
                                            <>,</>}
                                        </>
                                    </span>
                                ))}</h4>
                                <h4>
                                    From the album <a target="_blank" href={`https://open.spotify.com/album/${searchedTrack.album.id}`}>
                                        {searchedTrack.album.name}
                                    </a>
                                </h4>

                                <button className="add-song" title="Add Song" onClick={e => handleSubmit(e, searchedTrack.id)}>+</button>
                            </div>
                        ))}
                    </div>
                </>
            }
        </>
    );
}
 
export default AddSongForm;