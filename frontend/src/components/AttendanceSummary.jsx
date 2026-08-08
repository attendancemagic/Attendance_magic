import { useState } from "react";
import { FiBarChart2, FiCalendar, FiUsers, FiClock } from "react-icons/fi";

function getDateLabel(date) {

    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const current = new Date(date);

    const todayString = today.toISOString().split("T")[0];
    const yesterdayString = yesterday.toISOString().split("T")[0];
    const currentString = current.toISOString().split("T")[0];

    const formattedDate = current
        .toLocaleDateString("en-GB")
        .replaceAll("/", "-");

    if (currentString === todayString) {

        return <span className="flex items-center"><FiCalendar className="mr-2 text-blue-500" /> Today ({formattedDate})</span>;

    }

    if (currentString === yesterdayString) {

        return <span className="flex items-center"><FiCalendar className="mr-2 text-gray-500" /> Yesterday ({formattedDate})</span>;

    }

    return <span className="flex items-center"><FiCalendar className="mr-2 text-gray-500" /> {formattedDate}</span>;

}

function AttendanceSummary({
    groupedSummary,
    fetchStudents
}) {
    const [showHistory, setShowHistory] = useState(false);
    
    const todayString = new Date().toISOString().split("T")[0];
    
    const displayDates = Object.keys(groupedSummary).filter(date => {
        if (showHistory) return true;
        return new Date(date).toISOString().split("T")[0] === todayString;
    }).sort((a, b) => new Date(b) - new Date(a)); // Sort descending

    return (

        <div className="mt-8">

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <FiBarChart2 className="text-blue-600 w-8 h-8" />
                    <h2 className="text-2xl font-bold text-gray-900">
                        Attendance Summary
                    </h2>
                </div>
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <FiClock className="w-4 h-4" />
                    {showHistory ? "Hide History" : "View History"}
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

               {
    displayDates.length > 0 ? (
        displayDates.map((date) => (

        <div key={date} className="col-span-full">

            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">

                {getDateLabel(date)}

            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {

                    groupedSummary[date].map((item, index) => (

                        <div
                            className="bg-white border border-gray-100 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] p-6"
                            key={index}
                        >

                            <h3 className="text-xl font-bold text-gray-900">

                                {item.department} - {item.section}

                            </h3>

                            <p className="text-gray-500 mt-2 font-medium">

                                Students Present

                            </p>

                            <h1 className="text-5xl font-extrabold mt-4 text-blue-600 w-max">

                                {item.student_count}

                            </h1>

                            <button

                                onClick={() =>
                                    fetchStudents(
                                        item.department,
                                        item.section,
                                        true
                                    )
                                }

                                className="mt-6 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all py-3 rounded-xl font-bold flex items-center justify-center gap-2"

                            >

                                <FiUsers className="w-5 h-5" /> View Students

                            </button>

                        </div>

                    ))

                }

            </div>

        </div>

    ))
    ) : (
        <div className="col-span-full py-8 text-center text-gray-500 font-medium">
            No attendance sessions found for today.
        </div>
    )
}
            </div>

        </div>

    );

}

export default AttendanceSummary;