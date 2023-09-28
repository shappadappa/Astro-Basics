import type { APIRoute } from "astro"
import { db } from "../../../firebase/server"

export const get: APIRoute = async({params}) =>{
    const snapshot = await db.collection("users").doc(params.id).get()

    let username = ""
    if(snapshot.exists){
        username = snapshot.data().username
    }

    return new Response(JSON.stringify(username), {status: 200})
}