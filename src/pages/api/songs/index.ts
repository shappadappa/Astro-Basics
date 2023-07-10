import type { APIRoute } from "astro"
import { db } from "../../../firebase/server"

export const post: APIRoute = async({request, redirect}) =>{
  const formData = await request.formData()
  
  const title = formData.get("title")?.toString()
  const artists = formData.get("artists")?.toString()

  if(!title){
    return new Response(JSON.stringify({error: "Title required"}), {status: 400})
  }

  if(!artists){
    return new Response(JSON.stringify({error: "Artist required"}), {status: 400})
  }

  const song = {title: title.trim(), artists: artists.split(",").map(artist => artist.trim())}

  try {
    await db.collection("songs").add(song)
  } catch (error){
    return new Response(JSON.stringify({error: "Something went wrong"}), {
      status: 500,
    })
  }

  return new Response(JSON.stringify(song), {status: 200})
}