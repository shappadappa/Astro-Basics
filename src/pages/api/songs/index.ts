import type { APIRoute } from "astro"
import { db } from "../../../firebase/server"
import { getAuth } from "firebase-admin/auth"

export const post: APIRoute = async({request, redirect}) =>{
  const auth = getAuth()
  const sessionCookie = request.headers.get("Authorization").split(" ") [1]

  if(!sessionCookie){
    return new Response(JSON.stringify({error: "Session cookie required"}), {status: 400})
  }

  const decodedCookie = await auth.verifySessionCookie(sessionCookie)
  
  try {
    const body = await request.json()

    const song = {spotifyId: body.spotifyId, userUid: decodedCookie.uid, createdAt: new Date()}

    await db.collection("songs").add(song)

    return new Response(JSON.stringify(song), {status: 200})
  } catch (error){
    return new Response(JSON.stringify({error: "Something went wrong"}), {
      status: 500,
    })
  }
}