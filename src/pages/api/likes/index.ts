import type { APIRoute } from "astro"
import { db } from "../../../firebase/server"
import { getAuth } from "firebase-admin/auth"

export const POST: APIRoute = async({request}) =>{
    const sessionCookie = request.headers.get("Authorization")?.split(" ") [1]
    const body = await request.json()
    
    const auth = getAuth()

    let decodedCookie

    try{
        decodedCookie = await auth.verifySessionCookie(sessionCookie)
    } catch(error){
        return new Response(JSON.stringify({error: error.errorInfo.message}), {status: 401})
    }

    const loggedInUserRef = db.collection("users").doc(decodedCookie.user_id)
    let loggedInUserLikes = (await loggedInUserRef.get()).data().likes

    const songRef = db.collection("songs").doc(body.spotifyId)
    let songLikes = (await songRef.get()).data().likes

    const songUserId = (await songRef.get()).data().userUid
    const songUserRef = db.collection("users").doc(songUserId)
    let songUserChords = (await songUserRef.get()).data().chords

    if(loggedInUserLikes.includes(body.spotifyId)){
        loggedInUserLikes.splice(loggedInUserLikes.indexOf(body.spotifyId), 1)
        await loggedInUserRef.update({likes: loggedInUserLikes})
        await songRef.update({likes: songLikes - 1})
        await songUserRef.update({chords: songUserChords - 1})
    } else{
        await loggedInUserRef.update({likes: [...loggedInUserLikes, body.spotifyId]})
        await songRef.update({likes: songLikes + 1})
        await songUserRef.update({chords: songUserChords + 1})
    }

    return new Response(JSON.stringify({msg: "Hello world"}), {status: 200})
}