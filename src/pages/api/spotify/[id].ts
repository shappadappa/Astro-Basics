import { APIRoute } from "astro"

export const GET: APIRoute = async({params}) =>{
    const accessTokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `grant_type=client_credentials&client_id=${import.meta.env.SPOTIFY_CLIENT_ID}&client_secret=${import.meta.env.SPOTIFY_CLIENT_SECRET}`
    })

    const accessTokenJson = await accessTokenRes.json()

    if(!accessTokenRes.ok){
        return new Response(JSON.stringify({error: accessTokenJson.error}), {status: 500})
    }

    const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${params.id}`, {
        headers: {
            "Authorization": `Bearer ${accessTokenJson.access_token}`
        }
    })

    const trackJson = await trackRes.json()
    return new Response(JSON.stringify(
        {track: 
            {
                album: {name: trackJson.album.name, imageUrl: trackJson.album.images [0].url, href: trackJson.album.external_urls.spotify}, 
                name: trackJson.name, 
                artists: trackJson.artists.map(artist => {
                    return {name: artist.name, href: artist.external_urls.spotify, id: artist.id}
                }),
                explicit: trackJson.explicit,
                href: trackJson.external_urls.spotify
            }
        }
    ), {status: 200})
}