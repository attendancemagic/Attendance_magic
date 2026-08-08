import { FiClock, FiCrosshair } from "react-icons/fi";

function SessionForm({

    department,
    section,
    radius,
    duration,

    setDepartment,
    setSection,
    setRadius,
    setDuration,

    startSession

}) {

    return (

        <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 overflow-hidden mt-8">
            <div className="bg-gray-900 px-6 py-8 text-white relative">
                <h2 className="text-2xl font-bold mb-1">Session summary</h2>
                <p className="text-gray-400 text-sm">Review before you go live.</p>
            </div>

            <div className="flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3 text-gray-500">
                        <FiClock className="w-5 h-5" />
                        <span className="font-medium text-sm">Window</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            className="w-20 text-right font-bold text-gray-900 bg-transparent focus:outline-none focus:border-b-2 focus:border-[#ff5a00]"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        />
                        <span className="font-bold text-gray-900">minutes</span>
                    </div>
                </div>

                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3 text-gray-500">
                        <FiCrosshair className="w-5 h-5" />
                        <span className="font-medium text-sm">Geofence</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            className="w-20 text-right font-bold text-gray-900 bg-transparent focus:outline-none focus:border-b-2 focus:border-[#ff5a00]"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                        />
                        <span className="font-bold text-gray-900">meter radius</span>
                    </div>
                </div>

                <div className="px-6 py-6 bg-gray-50 text-center">
                    <button
                        onClick={startSession}
                        className="w-full bg-gradient-to-r from-[#ff5a00] to-[#e63a00] hover:shadow-[0_8px_20px_rgba(255,90,0,0.3)] transition-all text-white font-bold py-3.5 rounded-xl text-[15px]"
                    >
                        Initialize attendance session
                    </button>
                    <p className="text-xs text-gray-500 mt-4 font-medium">A shareable student link is generated instantly.</p>
                </div>
            </div>
        </div>

    );

}

export default SessionForm;