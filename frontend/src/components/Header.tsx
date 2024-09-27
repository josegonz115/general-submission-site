import { Link } from "@tanstack/react-router"

const Header = () => {
    return (
        <div className="bg-uci-blue w-[100vw] h-10 flex justify-between">
            <p className="my-auto ml-5 text-white drop-shadow"><Link to="/" className="text-white">General Submission Drive</Link></p>
            <nav className="my-auto mr-5">
                <ul className="flex gap-5">
                    <li><Link to="/" className="text-white hover:underline [&.active]:font-bold">Home</Link></li>
                    <li><Link to="/uploaded" className="text-white hover:underline [&.active]:font-bold">Uploaded</Link></li>
                </ul>
            </nav>
        </div>
    )
};

export default Header