import React from "react";
import API from "../services/api";
import { FiUsers, FiDownload } from "react-icons/fi";
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

        <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100 rounded-3xl p-8 mt-8">

            <div className="flex justify-between items-center mb-6">

                <div className="flex items-center gap-2">
                    <FiUsers className="text-blue-600 w-7 h-7" />
                    <h2 className="text-2xl font-bold text-gray-900">
                        Student List
                    </h2>
                </div>

                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-xl font-semibold">

                    Total Students : {students.length}

                </span>

            </div>

            <div className="overflow-x-auto">
                <button
                    onClick={downloadExcel}

                    className="mb-4 bg-green-600 hover:bg-green-700 hover:-translate-y-[2px] transition-all text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md w-max"

                >

                    <FiDownload className="mr-2" /> Download Excel

                </button>

                <table className="w-full border-collapse">

                    <thead>

                        <tr className="bg-gray-50 text-gray-700 border-b border-gray-200 text-left">

                            <th className="p-3 rounded-tl-lg">S.No</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Roll Number</th>
                            <th className="p-3">Department</th>
                            <th className="p-3">Section</th>
                            <th className="px-6 py-4 rounded-tr-lg">Time</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            students.map((student, index) => (

                                <tr
                                    key={student.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 text-gray-700 transition-colors"
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