import React from "react";
import API from "../services/api";
function StudentTable({ students }) {
const downloadExcel = async () => {

    const department = students[0]?.department;
    const section = students[0]?.section;

    if (!department || !section) {

        alert("No attendance data.");

        return;

    }

    try {

        const response = await API.get(

            `export-excel/?department=${department}&section=${section}`,

            {
                responseType: "blob",
            }

        );

        const url = window.URL.createObjectURL(

            new Blob([response.data])

        );

        const link = document.createElement("a");

        link.href = url;

        link.download = `${department}_${section}_Attendance.xlsx`;

        document.body.appendChild(link);

        link.click();

        link.remove();

    }

    catch (error) {

        console.log(error);

        alert("Unable to download Excel");

    }

};
    if (students.length === 0) return null;

    return (

        <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-[22px] border border-[rgba(255,255,255,0.18)] shadow-lg rounded-2xl p-8 mt-8 relative z-10">

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold text-white">

                    👨‍🎓 Student List

                </h2>

                <span className="bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] px-4 py-2 rounded-lg font-semibold">

                    Total Students : {students.length}

                </span>

            </div>

            <div className="overflow-x-auto">
                <button
    onClick={downloadExcel}

    className="mb-4 bg-gradient-to-r from-[#ff5a00] to-[#e63a00] hover:shadow-[0_12px_30px_rgba(255,90,0,0.4)] hover:-translate-y-[2px] transition-all text-white px-5 py-2 rounded-lg font-bold"

>

    📥 Download Excel

</button>

                <table className="w-full border-collapse">

                    <thead>

                        <tr className="bg-[rgba(255,255,255,0.1)] text-gray-200 border-b border-[rgba(255,255,255,0.18)] text-left">

                            <th className="p-3">S.No</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Roll Number</th>
                            <th className="p-3">Department</th>
                            <th className="p-3">Section</th>
                            <th className="px-6 py-4">Time</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            students.map((student, index) => (

                                <tr
                                    key={student.id}
                                    className="border-b border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] text-gray-300 transition-colors"
                                >

                                    <td className="p-3 text-center">

                                        {index + 1}

                                    </td>

                                    <td className="p-3">

                                        {student.name}

                                    </td>

                                    <td className="py-4 text-center">
                                        {student.roll_number}
                                    </td>

                                    <td className="p-3 text-center">

                                        {student.department}

                                    </td>

                                    <td className="p-3 text-center">

                                        {student.section}

                                    </td>
                                    <td className="px-6 py-4 text-center">
    {new Date(student.attendance_time).toLocaleTimeString()}
</td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default StudentTable;