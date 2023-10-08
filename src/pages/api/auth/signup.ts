import type { APIRoute } from "astro";
import { getAuth } from "firebase-admin/auth";
import { app, db } from "../../../firebase/server"

export const POST: APIRoute = async ({request, redirect}) => {
  const auth = getAuth(app)

  const formData = await request.formData()

  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()
  const username = formData.get("username")?.toString()

  if(!email){
    return new Response(JSON.stringify({error: "Email required"}), {status: 400})
  }

  if(!username){
    return new Response(JSON.stringify({error: "Username required"}), {status: 400})
  }

  if(!password){
    return new Response(JSON.stringify({error: "Password required"}), {status: 400})
  }
  
  const usernameInUse = !(await db.collection("users").where("username", "==", username).get()).empty

  if(usernameInUse){
    return new Response(JSON.stringify({error: "Username already in use"}), {status: 400})
  }
  
  
  try {
    await auth.createUser({
      email,
      password,
      displayName: username
    }).then(async(user) =>{
      await db.collection("users").doc(user.uid).set({likes: [], username, chords: 0})
    })
  } catch (error: any) {
    return new Response(JSON.stringify({error: error.errorInfo.message}), {status: 400})
  }

  return redirect("/login");
}