import styles from "./styles/SearchCard.css"

const SearchCard = ({track, handleSubmit}) => {
    return (
        <div className="searched-song" key={track.id}>
            <h3>
                🎶 <a target="_blank" href={`https://open.spotify.com/track/${track.id}`}>
                    {track.name}
                </a>
            </h3>
            <h4>By {track.artists.map((artist, index) =>(
                <span key={artist.id}>
                    <a target="_blank" key={artist.id} href={`https://open.spotify.com/artist/${artist.id}`}>
                        {`${artist.name}`}
                    </a>
                    <>
                        {index === track.artists.length - 2 && <> and </>}
                        {index !== track.artists.length - 1 &&
                        index !== track.artists.length - 2 &&
                        <>, </>}
                    </>
                </span>
            ))}</h4>
            <h4>
                From the album <a target="_blank" href={`https://open.spotify.com/album/${track.album.id}`}>
                    {track.album.name}
                </a>
            </h4>

            <iframe src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator`} allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

            <button className="add-song" title="Add Song" onClick={e => handleSubmit(e, track.id)}>+</button>
        </div>
    );
}
 
export default SearchCard;