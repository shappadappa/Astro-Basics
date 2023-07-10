import { useState } from "react"

const AddSongForm = () => {
    const [error, setError] = useState("")

    const handleSubmit = async(e) =>{
        setError("")
        e.preventDefault()

        const formData = new FormData(e.target)

        const res = await fetch("/api/songs", {
            method: "POST",
            body: formData
        })

        const json = await res.json()

        if(res.ok){
            location.href = "/"
        } else{
            setError(json.error)
        }
    }

    return (
        <form onSubmit={e => handleSubmit(e)}>
            {error && 
                <div className="error"><span>!</span>{error}</div>
            }

            <label htmlFor="title">Song Title: </label>
            <input type="text" name="title" id="title" />

            <label htmlFor="artists">Artist/s (comma separated):</label>
            <input type="text" name="artists" id="artists" />

            <input type="submit" value="Add Song" />
        </form>
    );
}
 
export default AddSongForm;