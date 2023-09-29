import type { APIRoute } from "astro"
import { db } from "../../../firebase/server"
import { getAuth } from "firebase-admin/auth"

export const GET: APIRoute = async({params}) =>{
    const snapshot = await db.collection("users").doc(params.id).get()

    let username = ""
    if(snapshot.exists){
        username = snapshot.data().username
    }

    return new Response(JSON.stringify(username), {status: 200})
}

export const DELETE: APIRoute = async({request, params, redirect}) =>{
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

    if(decodedCookie.user_id !== params.id){
        return new Response(JSON.stringify({error: "Unauthorised access to delete account"}), {status: 401})
    }

    try {
       await db.collection("users").doc(decodedCookie.user_id).delete()
       auth.deleteUser(decodedCookie.user_id)
       
       return new Response(JSON.stringify({msg: "Profile deleted"}), {status: 200})
    } catch (error: any){
        return new Response(JSON.stringify({error: error.errorInfo.message}), {status: 500})
    }
}