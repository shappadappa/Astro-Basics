import type { APIRoute } from "astro";

export const GET: APIRoute = async ({cookies}) => {
  cookies.delete("session", {
    path: "/",
  })

  return new Response(JSON.stringify({msg: "Logged out"}), {status: 200})
}