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

        <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[22px] border border-[rgba(255,255,255,0.18)] shadow-[0_30px_80px_rgba(0,0,0,0.35)] rounded-2xl p-8 relative z-10">

            <h2 className="text-2xl font-bold text-white mb-8">

                🚀 Start Attendance Session

            </h2>

            {/* <div className="grid md:grid-cols-2 gap-6">

                <div>

                    <label className="block font-semibold mb-2">

                        Department

                    </label>

                    <select

                        className="w-full border rounded-xl p-3"

                        value={department}

                        onChange={(e)=>
                            setDepartment(e.target.value)
                        }

                    >

                        <option>CSE</option>
                        <option>CSD</option>
                        <option>ECE</option>

                    </select>

                </div>

                <div>

                    <label className="block font-semibold mb-2">

                        Section

                    </label>

                    <select

                        className="w-full border rounded-xl p-3"

                        value={section}

                        onChange={(e)=>
                            setSection(e.target.value)
                        }

                    >

                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                        <option>D</option>

                    </select>

                </div>

            </div> */}

            <div className="grid md:grid-cols-2 gap-6 mt-8">

                <div>

                    <label className="block font-semibold mb-2 text-gray-200">

                        📍 Attendance Radius

                    </label>

                    <input

                        type="number"

                        className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white focus:bg-[rgba(255,255,255,0.15)] focus:border-[#ff5a00] transition-all outline-none rounded-xl p-3"

                        value={radius}

                        onChange={(e)=>
                            setRadius(e.target.value)
                        }

                    />

                    <p className="text-sm text-gray-400 mt-2">

                        Students must be inside this radius.

                    </p>

                </div>

                <div>

                    <label className="block font-semibold mb-2 text-gray-200">

                        ⏱ Session Duration

                    </label>

                    <input

                        type="number"

                        className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white focus:bg-[rgba(255,255,255,0.15)] focus:border-[#ff5a00] transition-all outline-none rounded-xl p-3"

                        value={duration}

                        onChange={(e)=>
                            setDuration(e.target.value)
                        }

                    />

                    <p className="text-sm text-gray-400 mt-2">

                        Attendance closes automatically.

                    </p>

                </div>

            </div>

            <button

                onClick={startSession}

                className="mt-10 w-full bg-gradient-to-r from-[#ff5a00] to-[#e63a00] hover:shadow-[0_12px_30px_rgba(255,90,0,0.4)] hover:-translate-y-[2px] transition-all text-white font-bold py-4 rounded-xl"

            >

                🚀 Start Attendance Session

            </button>

        </div>

    );

}

export default SessionForm;