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

        return `📅 Today (${formattedDate})`;

    }

    if (currentString === yesterdayString) {

        return `📅 Yesterday (${formattedDate})`;

    }

    return `📅 ${formattedDate}`;

}

function AttendanceSummary({
    groupedSummary,
    fetchStudents
}) {

    return (

        <div className="mt-8">

            <h2 className="text-2xl font-bold mb-6 text-white">

                📊 Attendance Summary

            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

               {
    Object.keys(groupedSummary).map((date) => (

        <div key={date} className="col-span-full">

            <h2 className="text-xl font-bold text-gray-300 mb-4">

                {getDateLabel(date)}

            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {

                    groupedSummary[date].map((item, index) => (

                        <div
                            className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[22px] border border-[rgba(255,255,255,0.18)] rounded-2xl shadow-lg p-6 relative z-10"
                        >

                            <h3 className="text-xl font-bold text-white">

                                {item.department} - {item.section}

                            </h3>

                            <p className="text-gray-400 mt-2">

                                Students Present

                            </p>

                            <h1 className="text-5xl font-extrabold mt-4 bg-gradient-to-r from-[#ff5a00] to-[#e63a00] bg-clip-text text-transparent w-max">

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

                                className="mt-6 w-full bg-gradient-to-r from-[#ff5a00] to-[#e63a00] hover:shadow-[0_12px_30px_rgba(255,90,0,0.4)] hover:-translate-y-[2px] transition-all text-white py-3 rounded-xl font-bold"

                            >

                                👥 View Students

                            </button>

                        </div>

                    ))

                }

            </div>

        </div>

    ))
}
            </div>

        </div>

    );

}

export default AttendanceSummary;