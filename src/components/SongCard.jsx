import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns"
import styles from "./styles/SongCard.css"

const SongCard = ({loggedInUserId, userId, spotifyId, sessionCookie, alreadyLiked, forceRefresh, likesCount, createdAt}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [songDetails, setSongDetails] = useState()
    const [likes, setLikes] = useState(likesCount)
    const [expanded, setExpanded] = useState(false)
    const [username, setUsername] = useState("")
    const [liked, setLiked] = useState(alreadyLiked)
    const [error, setError] = useState("")


    useEffect(() => {
        const fetchDetails = async() =>{
            // fetch song details
            const songRes = await fetch(`/api/spotify/${spotifyId}`)
            
            const songJson = await songRes.json()
            
            if(songRes.ok){
                setSongDetails(songJson.track)
            } else{
                setError(songJson.error)
            }

            // fetch user details
            if(userId){
                const userRes = await fetch(`/api/users/${userId}`)

                const userJson = await userRes.json()

                if(userRes.ok){
                    setUsername(userJson)
                }
            }
            
            setIsLoading(false)
        }
      
      fetchDetails()
    }, [])

    const likeSong = async() =>{
        const previousLikeState = liked, previousLikeCount = likes

        setLikes(!liked ? likes + 1 : likes - 1)
        setLiked(!liked)
        setError("")

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
            setLikes(previousLikeCount)
            setLiked(previousLikeState)
            setError(json.error)
        }

        if(forceRefresh){
            window.location.reload(false)
        }
    }

    const removeSong = async() =>{
        if(confirm("Are you sure you would like to remove this song?")){
            const res = await fetch(`/api/songs/${spotifyId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${sessionCookie}`
                }
            })

            const json = await res.json()

            if(res.ok){
                window.location.reload(false)
            } else{
                setError(json.error)
            }
        }
    }
    
    return (
        <>
            {error && <div className="error"><span>!</span>{error}</div>}
            <div className={`song${liked ? " liked" : ""}${expanded ? " expanded" : ""}`}>
                {isLoading ? 
                    <>
                        <h3 className="skeleton">‎</h3>
                        <h4 className="skeleton">‎</h4>
                        <h4 className="skeleton">‎</h4>
                        <h5 className="skeleton">‎</h5>
                    </>
                :
                    <>
                        <h3>
                            <a target="_blank" href={songDetails.href}>{songDetails.name}</a>
                            <button onClick={() => setExpanded(!expanded)}>
                                {!expanded ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z"/>
                                    </svg>
                                :
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707zM15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707z"/>
                                    </svg>
                                }
                            </button>
                        </h3>
                        <h4>By {songDetails.artists.map((artist, index) => (
                            <a key={artist.id} target="_blank" href={artist.href}>{`${artist.name}${index === songDetails.artists.length - 1 ? "" : ", "}`}</a>
                        ))}</h4>
                        <h4>From <a target="_blank" href={songDetails.album.href}>{songDetails.album.name}</a></h4>

                        {loggedInUserId &&
                            <h5>Added by 
                                {username.length > 0 ?
                                    <> <a href={`/profile/${userId}`} className={loggedInUserId === userId ? "you" : ""}>{loggedInUserId === userId ? "you" : username}</a></>
                                :
                                    <span> (deleted)</span>
                                }
                            </h5>
                        }

                        {expanded &&
                            <>
                                <h6>Added <span> {formatDistanceToNow(createdAt._seconds * 1000, {addSuffix: true, includeSeconds: true})}</span></h6>
                                <h6>{likes} like{likes !== 1 && "s"}</h6>

                                <iframe src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator`} allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                            </>
                        }

                        <button className="like" onClick={likeSong} title="Like">
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

                        {loggedInUserId === userId && <button className="remove" onClick={removeSong}>Remove Song</button>}
                    </>
                }
            </div>
        </>
    );
}
 
export default SongCard;