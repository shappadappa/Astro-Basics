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

    const userRef = db.collection("users").doc(decodedCookie.user_id)
    let userLikes = (await userRef.get()).data().likes

    const songRef = db.collection("songs").doc(body.spotifyId)
    let songLikes = (await songRef.get()).data().likes

    if(userLikes.includes(body.spotifyId)){
        userLikes.splice(userLikes.indexOf(body.spotifyId), 1)
        await userRef.update({likes: userLikes})
        await songRef.update({likes: songLikes - 1})
    } else{
        await userRef.update({likes: [...userLikes, body.spotifyId]})
        await songRef.update({likes: songLikes + 1})
    }

    return new Response(JSON.stringify({msg: "Hello world"}), {status: 200})
}