import type { APIRoute } from "astro";
import { db } from "../../../firebase/server"
import { getAuth } from "firebase-admin/auth";

export const DELETE: APIRoute = async({request, params}) =>{
    const sessionCookie = request.headers.get("Authorization").split(" ") [1]

    if(!sessionCookie){
        return new Response(JSON.stringify({error: "Session cookie required"}), {status: 400})
    }

    const auth = getAuth()

    let decodedCookie 
    
    try{
        decodedCookie = await auth.verifySessionCookie(sessionCookie)
    } catch(error: any){
        return new Response(JSON.stringify({error: error.errorInfo.message}), {status: 401})
    }

    const songRef = db.collection("songs").doc(params.id)
    const songSnapshot = await songRef.get()

    if(!songSnapshot.exists){
        return new Response(JSON.stringify({error: "Song has not been added to database"}), {status: 400})
    }

    if(decodedCookie.user_id !== songSnapshot.data().userUid){
        return new Response(JSON.stringify({error: "Unauthorised access to delete song"}), {status: 401})
    }

    // calculating the time between the createdAt and now
    if((new Date().getTime() / 1000 - songSnapshot.data().createdAt.seconds) / 3600 / 24 < 5){
        return new Response(JSON.stringify({error: "Cannot remove songs before 5 days after addition"}), {status: 400})
    }

    try{
        const userSnapshots = await db.collection("users").where("likes", "array-contains", params.id).get()

        for(const userSnapshot of userSnapshots.docs){
            let userLikes = userSnapshot.data().likes
            userLikes.splice(userLikes.indexOf(params.id), 1)
            await db.collection("users").doc(userSnapshot.id).update({likes: userLikes})
        }

        const songLikes = (await songRef.get()).data().likes
        const songUserUid = (await songRef.get()).data().userUid

        const songUserRef = db.collection("users").doc(songUserUid)
        const chords = (await songUserRef.get()).data().chords
        const addedSongs = (await songUserRef.get()).data().addedSongs
        await songUserRef.update({chords: chords - songLikes, addedSongs: addedSongs - 1})

        await songRef.delete()
    } catch(error){
        return new Response(JSON.stringify({error: error.errorInfo.message}), {status: 500})
    }

    return new Response(JSON.stringify({msg: "hello world"}), {status: 200})
}