import styles from "./styles/Loader.css"

const Loader = () => {
    return (
        <div className="loader">
            {[...Array(4)].map((_element, index) =>(
                <div key={index} className="ball" style={{"animationDelay": `${index / 10}s`}}></div>
            ))}
        </div>
    );
}
 
export default Loader;