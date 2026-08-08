import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { FiAward, FiUser, FiLogOut } from "react-icons/fi";

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
        <nav className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100 rounded-3xl p-5 flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <FiAward className="text-blue-600 w-8 h-8" />
                    <h1 className="text-3xl font-bold text-gray-900">
                        Attendance Magic
                    </h1>
                </div>
                <p className="text-gray-500 ml-10">
                    Faculty Portal
                </p>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-center md:text-right text-gray-700">
                    <h2 className="font-bold flex items-center gap-2 justify-center md:justify-end">
                        <FiUser className="text-gray-500" /> {username}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Logged In
                    </p>
                </div>
                <button
                    onClick={logout}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold"
                >
                    <FiLogOut /> Logout
                </button>
            </div>
        </nav>
    );

}

export default Navbar;