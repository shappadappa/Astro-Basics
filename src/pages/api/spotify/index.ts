import type { APIRoute } from "astro"

export const get: APIRoute = async({request, redirect}) =>{
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

    if(!request.headers.get("Spotify-Id")){
        return new Response(JSON.stringify({error: "Spotify ID required"}), {status: 400})
    }

    const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${request.headers.get("Spotify-Id")}`, {
        headers: {
            "Authorization": `Bearer ${accessTokenJson.access_token}`
        }
    })

    const trackJson = await trackRes.json()
    
    return new Response(JSON.stringify(
        {track: {
            album: {name: trackJson.album.name, href: trackJson.album.external_urls.spotify}, 
            name: trackJson.name, 
            artists: trackJson.artists.map(artist => {
                return {name: artist.name, href: artist.external_urls.spotify, id: artist.id}
            }),
            href: trackJson.external_urls.spotify
        }
    }), {status: 200})
}

export const post: APIRoute = async({request, redirect}) =>{
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

    let urlProvided = false, formData, url = ""

    try{
        formData = await request.formData()
    } catch(error){
        urlProvided = true

        const body = await request.json()

        if(body.nextLink){
            url = body.nextLink
        } else{
            url = body.previousLink
        }
    }
    
    if(!urlProvided){
        const title = formData.get("title")?.toString().trim()
        const artists = formData.get("artists")?.toString().split(",").map(artist => artist.trim())
        const album = formData.get("album")?.toString().trim()

        if(!title){
            return new Response(JSON.stringify({error: "Title required"}), {status: 400})
        }

        if(artists.length === 1 && artists [0] === ''){
            return new Response(JSON.stringify({error: "Artist/s required"}), {status: 400})
        }

        // for some reason, the spotify api search sometimes doesn't get the correct result unless the last letter is removed from the title
        let q = `remaster%2520track%3A${title.slice(0, title.length - 1)}%2520artist%3A${artists.join(" ")}`

        if(album){
            q += `%2520album:${album}`
        }
        
        q = q.replaceAll(" ", "%2520")
        url = `https://api.spotify.com/v1/search?q=${q}&type=track&limit=5`
    }

    const trackRes = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${accessTokenJson.access_token}`
        }
    })

    const trackJson = await trackRes.json()

    if(trackRes.ok){
        return new Response(JSON.stringify({tracks: trackJson.tracks.items.map(track => {
            return {artists: track.artists, id: track.id, name: track.name, album: track.album}
        }), next: trackJson.tracks.next, previous: trackJson.tracks.previous}), {status: 200})
    } else{
        return new Response(JSON.stringify({error: trackJson.error}), {status: 500})
    }
}