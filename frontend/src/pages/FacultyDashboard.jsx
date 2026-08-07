import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import SessionForm from "../components/SessionForm";
import AttendanceSummary from "../components/AttendanceSummary";
import StudentTable from "../components/StudentTable";


function FacultyDashboard() {

    const [summary, setSummary] = useState([]);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const studentTableRef = useRef(null);
    
    const [selectedDepartment, setSelectedDepartment] = useState(null);

const [selectedSection, setSelectedSection] = useState(null);

    const [radius, setRadius] = useState(100);
    const [duration, setDuration] = useState(2);

    const [attendanceLink, setAttendanceLink] = useState("");

    const [expiresAt, setExpiresAt] = useState(null);

    const [timeLeft, setTimeLeft] = useState("");

    const [sessionActive, setSessionActive] = useState(false);

    useEffect(() => {

        fetchSummary();
        checkActiveSession();

    }, []);

    const checkActiveSession = async () => {
        try {
            const response = await API.get("active-session/");
            if (response.data && response.data.id) {
                setSessionActive(true);
                setExpiresAt(response.data.expires_at);
                const link = `https://attendance-magic-xi.vercel.app/attendance/${response.data.id}`;
                setAttendanceLink(link);
            }
        } catch (error) {
            // No active session found - that's fine
            setSessionActive(false);
        }
    };

    useEffect(() => {

        if (!expiresAt) return;

        const timer = setInterval(() => {

            const now = new Date();

            const end = new Date(expiresAt);

            const diff = end - now;

            if (diff <= 0) {

                clearInterval(timer);

                setTimeLeft("00:00");

                setSessionActive(false);

                return;

            }

            const minutes = Math.floor(diff / 60000);

            const seconds = Math.floor((diff % 60000) / 1000);

            setTimeLeft(

                `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

            );

        }, 1000);

        return () => clearInterval(timer);

    }, [expiresAt]);

    const fetchSummary = async () => {

        try {

            const response = await API.get(
                "attendance-summary/"
            );

            setSummary(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

  const fetchStudents = async (
    department,
    section,
    shouldScroll = false
) => {

    setSelectedDepartment(department);
    setSelectedSection(section);

    try {

        const response = await API.get(
            `attendance-list/?department=${department}&section=${section}`
        );

        setStudents(response.data);
       if (shouldScroll) {

    setTimeout(() => {

        studentTableRef.current?.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }, 100);

}

    }

    catch (error) {

        console.log(error);

    }

};
useEffect(() => {

    const interval = setInterval(() => {

        fetchSummary();

        if (selectedDepartment && selectedSection) {

           fetchStudents(
    selectedDepartment,
    selectedSection,
    false
);

        }

    }, 3000);

    return () => clearInterval(interval);

}, [selectedDepartment, selectedSection]);

    const startSession = () => {

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const createSession = async () => {
                    const response = await API.post(
                        "start-session/",
                        {
                            faculty_latitude: position.coords.latitude,
                            faculty_longitude: position.coords.longitude,
                            radius: parseInt(radius) + Math.ceil(position.coords.accuracy || 0),
                            duration_minutes: duration
                        }
                    );

                    console.log(
                        "Faculty Location:",
                        position.coords.latitude,
                        position.coords.longitude
                    );

                    setAttendanceLink(response.data.attendance_link);
                    setExpiresAt(response.data.data.expires_at);
                    setSessionActive(true);
                    alert("Attendance Session Started");
                    fetchSummary();
                };

                try {
                    await createSession();
                } catch (error) {
                    const msg = error.response?.data?.message || "";
                    if (msg.toLowerCase().includes("already active")) {
                        checkActiveSession();
                        alert("An attendance session is already active.");
                    } else {
                        const errorMsg = msg
                            || error.response?.data?.detail
                            || JSON.stringify(error.response?.data)
                            || "Unknown error. Please check your connection.";
                        alert("Unable to Start Session: " + errorMsg);
                    }
                }
            },
            (error) => {
                alert("Please allow location access: " + error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };
    const endSession = async () => {

    try {

        await API.post("end-session/");

        setSessionActive(false);

        setAttendanceLink("");

        setExpiresAt(null);

        setTimeLeft("");

        fetchSummary();

        alert("Attendance Session Ended");

    }

    catch (error) {

        console.log(error);

        alert("Unable to End Session");

    }

};

    const groupedSummary = {};

summary.forEach((item) => {

    const date = item.attendance_date;

    if (!groupedSummary[date]) {

        groupedSummary[date] = [];

    }

    groupedSummary[date].push(item);

});

    return (        <div className="min-h-screen bg-slate-100 p-4 md:p-8">

            <Navbar />

            <h1 className="text-3xl font-bold mb-8">

                Welcome Back 👋

            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                <StatsCard
                    title="Today's Sessions"
                    value={sessionActive ? 1 : 0}
                    color="bg-blue-600"
                />

                <StatsCard
    title="Present Students"
    value={
        summary.reduce(
            (total, item) => total + item.student_count,
            0
        )
    }
    color="bg-green-600"
/>

                <StatsCard
                    title="Status"
                    value={sessionActive ? "Active" : "Inactive"}
                    color="bg-purple-600"
                />

            </div>

            {!sessionActive && (
                <SessionForm
                    radius={radius}
                    duration={duration}
                    setRadius={setRadius}
                    setDuration={setDuration}
                    startSession={startSession}
                />
            )}

            {

                attendanceLink && (

                    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

                        <h2 className="text-2xl font-bold mb-6">

                            🟢 Live Attendance Session

                        </h2>

                        <div className="space-y-4">

                            <p>

                                <strong>Status :</strong>{" "}

                                {

                                    sessionActive ?

                                        <span className="text-green-600 font-bold">

                                            Active

                                        </span>

                                        :

                                        <span className="text-red-600 font-bold">

                                            Expired

                                        </span>

                                }

                            </p>

                            <p>

                                <strong>

                                    Time Remaining :

                                </strong>{" "}

                                <span className="text-blue-700 font-bold text-xl">

                                    {timeLeft}

                                </span>

                            </p>

                            <div>

                                <label className="font-semibold">

                                    Attendance Link

                                </label>

                                <input

                                    className="w-full border rounded-lg p-3 mt-2"

                                    readOnly

                                    value={attendanceLink}

                                />

                            </div>

                            <div className="flex flex-col md:flex-row gap-3 mt-4">
                                <button

                                    onClick={() => {

                                        navigator.clipboard.writeText(
                                            attendanceLink
                                        );

                                        alert(
                                            "Attendance Link Copied"
                                        );

                                    }}

                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl w-full md:w-auto"

                                >

                                    📋 Copy Attendance Link

                                </button>
                                <button

        onClick={endSession}

        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl w-full md:w-auto"

    >

        🛑 End Session

    </button>
                            </div>

                        </div>

                    </div>

                )

            }

            <hr className="my-10" />

            <AttendanceSummary

    groupedSummary={groupedSummary}

    fetchStudents={fetchStudents}

/>
            <div className="mt-6 mb-4">

    <input
        type="text"
        placeholder="🔍 Search by Name or Roll Number"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-xl p-3"
    />

</div>

          <div ref={studentTableRef}>

    <StudentTable
        students={students.filter((student) =>
            student.name.toLowerCase().includes(search.toLowerCase()) ||
            student.roll_number.toLowerCase().includes(search.toLowerCase())
        )}
    />

</div>

        </div>

    );

}

export default FacultyDashboard;