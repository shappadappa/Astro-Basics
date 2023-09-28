import type { APIRoute } from "astro";
import { getAuth } from "firebase-admin/auth";

export const get: APIRoute = async({request, cookies}) =>{
    const auth = getAuth()

    const token = request.headers.get("Authorization")?.split(" ") [1]
    if(!token){
        return new Response(JSON.stringify({error: "No token found"}), {status: 401})
    }

    try{
        await auth.verifyIdToken(token)
    } catch(error){
        return new Response(JSON.stringify({error: "Invalid token"}), {status: 401})
    }

    const sessionCookie = await auth.createSessionCookie(token, {expiresIn: 7 * 24 * 60 * 60 * 1000})

    cookies.set("session", sessionCookie, {path: "/"})

    return new Response(JSON.stringify({msg: "Login successful"}), {status: 200})
}