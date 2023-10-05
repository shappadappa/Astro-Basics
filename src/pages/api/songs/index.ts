import type { APIRoute } from "astro"
import { db } from "../../../firebase/server"
import { getAuth } from "firebase-admin/auth"

export const POST: APIRoute = async({request}) =>{
  const auth = getAuth()
  const sessionCookie = request.headers.get("Authorization").split(" ") [1]

  if(!sessionCookie){
    return new Response(JSON.stringify({error: "Session cookie required"}), {status: 400})
  }

  let decodedCookie

  try{
    decodedCookie = await auth.verifySessionCookie(sessionCookie)
  } catch(error: any){
    return new Response(JSON.stringify({error: error.errorInfo.message}), {status: 401})
  }

  const body = await request.json()
  const songSnapshot = await db.collection("songs").doc(body.spotifyId).get()

  if(songSnapshot.exists){
    return new Response(JSON.stringify({error: "Song has already been added. Try another song"}), {status: 400})
  }
  
  try{
    const song = {userUid: decodedCookie.uid, createdAt: new Date(), likes: 0}

    await db.collection("songs").doc(body.spotifyId).set(song)

    return new Response(JSON.stringify(song), {status: 200})
  } catch (error){
    return new Response(JSON.stringify({error: "Something went wrong"}), {
      status: 500,
    })
  }
}