import { useState, useEffect } from "react";
import styles from "./styles/SongCard.css"

const SongCard = ({spotifyId}) => {
    const [songDetails, setSongDetails] = useState()
    const [error, setError] = useState("")

    useEffect(() => {
      const fetchSongDetails = async() =>{
        const res = await fetch("/api/spotify", {
            headers: {
                "Spotify-Id": spotifyId
            }
        })

        const json = await res.json()

        if(res.ok){
            setSongDetails(json.track)
        } else{
            setError(json.error)
        }
      }
      
      fetchSongDetails()
    }, [])
    
    
    return (
        <div className="song">
            {error && <div className="error"><span>!</span>{error}</div>}

            {songDetails && 
                <>
                    <h3><a target="_blank" href={songDetails.href}>{songDetails.name}</a></h3>
                    <h4>By {songDetails.artists.map((artist, index) => (
                        <a key={artist.id} target="_blank" href={artist.href}>{`${artist.name}${index === songDetails.artists.length - 1 ? "" : ", "}`}</a>
                    ))}</h4>
                    <h4>From <a target="_blank" href={songDetails.album.href}>{songDetails.album.name}</a></h4>
                </>
            }
        </div>
    );
}
 
export default SongCard;