import { useState } from "react";
import { getAuth, inMemoryPersistence, signInWithEmailAndPassword } from "firebase/auth"
import { app } from "../firebase/client"
import Loader from "./Loader";

const LoginForm = ({signup}) => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [passwordVisible, setPasswordVisible] = useState(false)

    const auth = getAuth(app)
    auth.setPersistence(inMemoryPersistence)

    const createSessionCookie = async(email, password) =>{
        const userCredential = await signInWithEmailAndPassword(auth, email, password)

        const idToken = await userCredential.user.getIdToken()

        const res = await fetch("/api/auth/login", {
            headers: {
                Authorization: `Bearer ${idToken}`
            }
        })

        const json = await res.json()

        if(res.ok){
            window.location.reload(false)
            window.location = "/"
        } else{
            setError(json.error)
        }
    }

    const handleSubmit = async(e) =>{
        setIsLoading(true)
        setError("")
        e.preventDefault()

        const formData = new FormData(e.target)

        if(signup){
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                body: formData
            })
            
            if(res.ok){
                const email = formData.get("email")?.toString()
                const password = formData.get("password")?.toString()

                await createSessionCookie(email, password)
            } else{
                const json = await res.json()
                
                setError(json.error)
            }
        } else{
            const email = formData.get("email")?.toString()
            const password = formData.get("password")?.toString()

            if(!email){
                setError("Email required")
                return
            } else if(!password){
                setError("Password required")
                return
            }

            try{
                await createSessionCookie(email, password)
            } catch(error){
                switch(error.code){
                    case "auth/user-not-found":
                        setError("User not found")
                        break
                    case "auth/wrong-password":
                        setError("Incorrect password")
                        break
                    case "auth/too-many-requests":
                        setError("Too many attempts to login. Try again later")
                        break
                    default:
                        setError(error.code)
                }
            }
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={e => handleSubmit(e)}>
            {error && 
                <div className="error"><span>!</span>{error}</div>
            }

            <label htmlFor="email">Email: </label>
            <input type="email" id="email" name="email"/>

            {signup && 
                <>
                    <label htmlFor="username">Username: </label>
                    <input type="text" id="username" name="username"/>
                </>
            }

            <label htmlFor="password">Password: 
                <button type="button" className="view-password" onClick={() => setPasswordVisible(!passwordVisible)}>
                    {passwordVisible ? 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                            <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                        </svg>
                    :
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                        </svg>               
                    }
                </button>
            </label>
            <input type={passwordVisible ? "text" : "password"} id="password" name="password"/>

            <input type="submit" value={signup ? "Sign Up" : "Login"} />

            {isLoading && 
                <Loader />
            }
        </form>
    );
}
 
export default LoginForm;