import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import styles from "./styles/SongCard.css"

const SongCard = ({spotifyId, sessionCookie, alreadyLiked}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [songDetails, setSongDetails] = useState()
    const [liked, setLiked] = useState(alreadyLiked)
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

        setIsLoading(false)
      }
      
      fetchSongDetails()
    }, [])

    const likeSong = async() =>{
        setLiked(!liked)

        const res = await fetch("/api/likes", {
            method: "POST",
            body: JSON.stringify({spotifyId}),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionCookie}`
            }
        })

        const json = await res.json()

        if(!res.ok){
            setLiked(!liked)
            setError(json.error)
        }
    }
    
    return (
        <div className={`song ${liked ? "liked" : ""}`}>
            {error && <div className="error"><span>!</span>{error}</div>}

            {isLoading ? 
                <>
                    <h3 className="skeleton">‎</h3>
                    <h4 className="skeleton">‎</h4>
                    <h4 className="skeleton">‎</h4>
                </>
            :
                <>
                    <h3><a target="_blank" href={songDetails.href}>{songDetails.name}</a></h3>
                    <h4>By {songDetails.artists.map((artist, index) => (
                        <a key={artist.id} target="_blank" href={artist.href}>{`${artist.name}${index === songDetails.artists.length - 1 ? "" : ", "}`}</a>
                    ))}</h4>
                    <h4>From <a target="_blank" href={songDetails.album.href}>{songDetails.album.name}</a></h4>

                    <button className="like" onClick={likeSong}>
                        {liked ? 
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                            </svg>
                        :
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                            </svg>
                        }
                    </button>
                </>
            }
        </div>
    );
}
 
export default SongCard;