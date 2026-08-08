import { useRef, useState } from "react";
import Webcam from "react-webcam";
import API from "../services/api";
import { toast } from "react-hot-toast";
import { FiEdit3, FiCheckCircle, FiCamera, FiRefreshCw } from "react-icons/fi";

export default function StudentRegistration() {
    const webcamRef = useRef(null);
    const [name, setName] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [department, setDepartment] = useState("CSE");
    const [section, setSection] = useState("A");
    
    const [isRegistering, setIsRegistering] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const handleCapture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            toast.success("Image captured successfully! You can now submit the form.");
        } else {
            toast.error("Failed to capture image.");
        }
    };

    const handleRegister = async () => {
        if (!name || !rollNumber) {
            toast.error("Please fill all details.");
            return;
        }

        if (!capturedImage) {
            toast.error("Please capture your face before registering.");
            return;
        }

        setIsRegistering(true);
        
        const registerPromise = API.post("students/register/", {
            name,
            roll_number: rollNumber,
            department,
            section,
            face_image: capturedImage,
            face_descriptor: null
        });

        toast.promise(registerPromise, {
            loading: 'Registering student...',
            success: '✅ Registration Successful. You can now mark your attendance.',
            error: (err) => err.response?.data?.message || 'Registration failed.'
        });

        try {
            await registerPromise;
            setRegistrationSuccess(true);
        } catch (error) {
            console.error("Registration error:", error);
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-6 md:py-10 px-4 relative">
            
            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-6 md:p-10 w-full max-w-4xl relative z-10">
                <div className="flex justify-center items-center gap-3 mb-2">
                    <FiEdit3 className="text-blue-600 w-8 h-8 md:w-10 md:h-10" />
                    <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900">Student Registration</h1>
                </div>
                <p className="text-gray-600 text-center mb-8 text-lg">Register your details and face to enable magical attendance.</p>
            {registrationSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FiCheckCircle className="text-green-500 w-16 h-16 mb-4" />
                    <h2 className="text-3xl font-bold text-green-600 mb-4">Registration Successful</h2>
                    <p className="text-xl text-gray-700 mb-2">Your face is now officially locked in the system.</p>
                    <p className="text-lg text-gray-500 italic font-semibold">Now go and actually attend your classes! No proxies for you anymore!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex flex-col items-center">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-300 bg-gray-200 w-full aspect-[4/3] flex items-center justify-center">
                        {!capturedImage ? (
                            <>
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    mirrored={true}
                                />
                                {/* Overlay Guide for getting face close */}
                                <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
                                    <div className="w-48 h-64 border-4 border-dashed border-blue-400 rounded-[50%] opacity-70"></div>
                                    <p className="text-white mt-4 font-bold bg-black bg-opacity-50 px-3 py-1 rounded">
                                        Position your face close inside the oval
                                    </p>
                                </div>
                            </>
                        ) : (
                            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                        )}
                    </div>
                    
                    <div className="mt-4 flex justify-center w-full">
                        {!capturedImage ? (
                            <button onClick={handleCapture} className="bg-blue-600 hover:bg-blue-700 hover:-translate-y-[2px] transition-all text-white px-8 py-3 rounded-xl font-bold shadow-md flex items-center text-lg">
                                <FiCamera className="w-5 h-5 mr-2" /> Capture Photo
                            </button>
                        ) : (
                            <button onClick={() => setCapturedImage(null)} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-all text-gray-800 px-8 py-3 rounded-xl font-bold shadow-md flex items-center text-lg">
                                <FiRefreshCw className="w-5 h-5 mr-2" /> Retake Photo
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block font-semibold mb-2 text-gray-700">Full Name</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none rounded-xl p-3"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-2 text-gray-700">Roll Number</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none rounded-xl p-3"
                            placeholder="Enter Roll Number"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-2 text-gray-700">Department</label>
                        <select
                            className="w-full bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none rounded-xl p-3"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="CSE">CSE</option>
                            <option value="CSD">CSD</option>
                            <option value="ECE">ECE</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold mb-2 text-gray-700">Section</label>
                        <select
                            className="w-full bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none rounded-xl p-3"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                        >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>

                    <button
                        onClick={handleRegister}
                        disabled={isRegistering || !capturedImage}
                        className="w-full bg-blue-600 hover:bg-blue-700 hover:-translate-y-[2px] transition-all text-white py-3 rounded-xl font-bold mt-4 disabled:bg-gray-400 disabled:shadow-none disabled:translate-y-0"
                    >
                        {isRegistering ? "Submitting..." : "Submit Registration"}
                    </button>
                </div>
            </div>
            )}
            </div>
        </div>
    );
}
