import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Navbar() {

    const [username, setUsername] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        loadProfile();

    }, []);

    const loadProfile = async () => {

        try {

            const response = await API.get(
                "faculty-profile/"
            );

            setUsername(
                response.data.username
            );

        }

        catch (error) {

            console.log(error);

        }

    };

    const logout = () => {

        localStorage.removeItem("access");

        localStorage.removeItem("refresh");

        navigate("/");

    };

    return (

        <nav className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[22px] border border-[rgba(255,255,255,0.18)] shadow-lg rounded-2xl p-5 flex flex-col md:flex-row gap-4 justify-between items-center mb-8 relative z-10">

            <div>

                <h1 className="text-3xl font-bold text-white">

                    🎓 Attendance Magic

                </h1>

                <p className="text-gray-400">

                    Faculty Portal

                </p>

            </div>

            <div className="flex items-center gap-6">

                <div className="text-center md:text-right text-gray-200">

                    <h2 className="font-bold">

                        👤 {username}

                    </h2>

                    <p className="text-gray-400">

                        Logged In

                    </p>

                </div>

                <button

                    onClick={logout}

                    className="bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white px-5 py-2 rounded-xl"

                >

                    Logout

                </button>

            </div>

        </nav>

    );

}

export default Navbar;