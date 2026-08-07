import { useEffect, useState, useRef } from "react";
import FacialChallenge from "../components/FacialChallenge";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import * as faceapi from "@vladmandic/face-api";
import { toast } from "react-hot-toast";

function StudentAttendance() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [attendanceDone, setAttendanceDone] = useState(false);

    const [name, setName] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [department, setDepartment] = useState("");
    const [section, setSection] = useState("");

    const [verified, setVerified] = useState(false);
    const [distance, setDistance] = useState(null);

    const [faceImage, setFaceImage] = useState(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [inputRollNumber, setInputRollNumber] = useState("");
    const [faceVerified, setFaceVerified] = useState(false);
    const [capturedDescriptor, setCapturedDescriptor] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null);

    const deviceId = (() => {
        let id = localStorage.getItem("device_id");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("device_id", id);
        }
        return id;
    })();

    useEffect(() => {
        const initFaceApi = async () => {
            try {
                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setIsModelsLoaded(true);
            } catch (error) {
                console.error("Failed to load models:", error);
                toast.error("Failed to load facial recognition models.");
            }
        };

        initFaceApi();
        loadSession();

        const interval = setInterval(async () => {
            try {
                await API.get(`session/${id}/`);
            } catch (error) {
                if (
                    error.response &&
                    (error.response.status === 400 ||
                     error.response.status === 404)
                ) {
                    setSessionExpired(true);
                    clearInterval(interval);
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [id]);

    const verifyFace1to1 = async () => {
        const cleanRollNumber = inputRollNumber.trim();
        if (!cleanRollNumber) {
            toast.error("Please enter your Roll Number.");
            return;
        }
        setIsMatching(true);
        setVerificationStatus(null);
        try {
            const res = await API.get(`students/?roll_number=${cleanRollNumber}`);
            const studentsList = res.data;
            if (studentsList.length === 0) {
                setVerificationStatus({ type: 'NOT_REGISTERED' });
                setIsMatching(false);
                return;
            }
            
            const student = studentsList[0];
            if (!student.face_image_url) {
                setVerificationStatus({ type: 'ERROR', message: 'Registered face not found. Please register again.' });
                setIsMatching(false);
                return;
            }

            const img = document.createElement('img');
            img.crossOrigin = "Anonymous";
            const imgLoadPromise = new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            img.src = student.face_image_url;
            await imgLoadPromise;
            
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (!detection) {
                setVerificationStatus({ type: 'ERROR', message: 'Could not detect face in registered image.' });
                setIsMatching(false);
                return;
            }

            const distance = faceapi.euclideanDistance(detection.descriptor, capturedDescriptor);
            if (distance < 0.6) {
                setFaceVerified(true);
                setName(student.name);
                setRollNumber(student.roll_number);
                setDepartment(student.department);
                setSection(student.section);
                setVerificationStatus({ type: 'SUCCESS', studentName: student.name });
            } else {
                setVerificationStatus({ type: 'FACE_MISMATCH' });
            }
        } catch (error) {
            console.error("Verification error", error);
            setVerificationStatus({ type: 'ERROR', message: 'An error occurred during verification.' });
        } finally {
            setIsMatching(false);
        }
    };

    const loadSession = async () => {

        try {

            const response = await API.get(
                `session/${id}/`
            );

            setSession(response.data);

          setDepartment(response.data.department || "CSE");
setSection(response.data.section || "A");

        }

        // catch (error) {

        //     console.log(error);

        //     alert("Session Not Found");

        // }/
        catch (error) {

    if (
        error.response &&
        (error.response.status === 400 ||
         error.response.status === 404)
    ) {

        setSessionExpired(true);

    } else {

        alert("Unable to connect to server.");

    }

}

        finally {

            setLoading(false);

        }

    };

    const verifyLocation = (isAuto = false) => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await API.post(
                        "verify-location/",
                        {
                            session_id: id,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                        }
                    );
                    
                    setVerified(response.data.verified);
                    setDistance(response.data.distance);
                    
                    if (response.data.verified) {
                        toast.success("Location Verified Successfully");
                    } else {
                        toast.error("You are outside the attendance area.");
                    }
                } catch (error) {
                    toast.error("Failed to verify location. Check network or server.");
                }
            },
            (error) => {
                toast.error("Unable to fetch location: " + error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    useEffect(() => {
        if (session && !verified) {
            verifyLocation(true);
        }
    }, [session]);

   if (sessionExpired) {

    return (

        <div className="min-h-screen flex items-center justify-center bg-slate-100">

            <div className="bg-white p-10 rounded-2xl shadow-xl text-center">

                <h1 className="text-3xl font-bold text-red-600">

                    ⏰ Attendance Session Expired

                </h1>

                <p className="mt-4 text-gray-600">

                    This attendance session has ended.

                </p>

            </div>

        </div>

    );

}

if (loading) {

    return (

        <h2 className="text-center mt-20 text-2xl">

            Loading...

        </h2>

    );

}

    if (!session) {

        return (

            <h2 className="text-center mt-20 text-red-600 text-2xl">

                Session Not Available

            </h2>

        );

    }
const markAttendance = async () => {

    if (!verified) {

        alert("Please verify your location first.");

        return;

    }

    if (!faceImage) {

        alert("Please capture your face.");

        return;

    }

    try {
        const attendancePromise = API.post(
            "mark-attendance/",
            {
                session_id: id,
                name,
                roll_number: rollNumber,
                department,
                section,
                device_id: deviceId,
                face_image: faceImage
            }
        );

        toast.promise(attendancePromise, {
            loading: 'Submitting attendance...',
            success: 'Attendance recorded successfully!',
            error: (err) => err.response?.data?.message || 'Failed to mark attendance.'
        });

        await attendancePromise;
        setAttendanceDone(true);

    } catch (error) {
        console.error("Attendance error:", error.response?.data);
    }

};

if (attendanceDone) {

    return (

        <div className="min-h-screen bg-slate-100 flex justify-center items-center py-6 md:py-10 px-4">

            <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10 w-full max-w-2xl text-center">

                <div className="text-7xl">

                    ✅

                </div>

                <h1 className="text-4xl font-bold text-green-600 mt-5">

                    Attendance Submitted

                </h1>

                <p className="text-gray-600 mt-5 text-lg">

                    Your attendance has been recorded successfully.

                </p>

                <div className="bg-slate-100 rounded-xl p-5 mt-8 text-left">

                    <p>

                        <strong>Name :</strong> {name}

                    </p>

                    <p>

                        <strong>Roll Number :</strong> {rollNumber}

                    </p>

                    <p>

                        <strong>Department :</strong> {department}

                    </p>

                    <p>

                        <strong>Section :</strong> {section}

                    </p>

                </div>

                <p className="mt-8 text-gray-500">

                    You may now close this page.

                </p>

            </div>

        </div>

    );

}

    return (

        <div className="min-h-screen bg-slate-100 flex justify-center items-center py-6 md:py-10 px-4">

            <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10 w-full max-w-2xl">

                <h1 className="text-3xl md:text-4xl font-bold text-blue-700">

                    🎓 Attendance Magic

                </h1>

                <p className="text-gray-500 mt-2">

                    Student Attendance

                </p>

                <hr className="my-6" />

                <h2 className="text-2xl font-bold">

                    Session Details

                </h2>

                <div className="mt-5 space-y-3">

                    {/* <p>

                        <strong>Department :</strong>

                        {" "}

                        {session.department}

                    </p>

                    <p>

                        <strong>Section :</strong>

                        {" "}

                        {session.section}

                    </p> */}

                    <p>

                        <strong>Faculty :</strong>

                        {" "}

                        {session.faculty}

                    </p>

                    <p>

                        <strong>

                            Attendance Radius :

                        </strong>

                        {" "}

                        {session.radius} meters

                    </p>

                </div>

                <hr className="my-8" />

                <h2 className="text-2xl font-bold mb-5">

                    📍 Verify Your Location

                </h2>

                <p className="text-gray-500 mb-4">

                    Please verify your location before entering your attendance details.

                </p>

                <div className="space-y-4">

                    <p>

                        <strong>Status :</strong>{" "}

                        {

                            verified ?

                                <span className="text-green-600 font-bold">

                                    ✅ Verified

                                </span>

                                :

                                <span className="text-orange-600 font-bold">

                                    Waiting for Verification

                                </span>

                        }

                    </p>

                    {

                        distance !== null && (

                            <p>

                                <strong>

                                    Distance :

                                </strong>

                                {" "}

                                {distance} meters

                            </p>

                        )

                    }

                    {
                        !verified && distance !== null && (

                            <div className="bg-red-100 text-red-700 p-4 rounded-xl">

                                ❌ You are outside the attendance area.

                            </div>

                        )

                    }

                    {                        verified && (

                            <>

                                <hr className="my-8" />
                                <div className="mb-6">
                                    {!faceImage ? (
                                        <FacialChallenge onChallengeSuccess={async (imgSrc) => {
                                            if (!isModelsLoaded) {
                                                toast.error("Models not loaded yet.");
                                                return;
                                            }
                                            setIsMatching(true);
                                            setFaceImage(imgSrc);
                                            
                                            try {
                                                const img = document.createElement("img");
                                                const imgLoadPromise = new Promise(resolve => {
                                                    img.onload = resolve;
                                                    img.onerror = () => resolve(); // prevent hang on error
                                                });
                                                img.src = imgSrc;
                                                await imgLoadPromise;
                                                
                                                const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                                                
                                                if (!detection) {
                                                    toast.error("Face not detected clearly. Try again.");
                                                    setFaceImage(null);
                                                    setIsMatching(false);
                                                    return;
                                                }
                                                
                                                setCapturedDescriptor(detection.descriptor);
                                            } catch (error) {
                                                console.error("Capture processing error:", error);
                                                toast.error("Error processing face. Please try again.");
                                                setFaceImage(null);
                                            } finally {
                                                setIsMatching(false);
                                            }
                                        }} />
                                    ) : (
                                        <div className="text-center">
                                            <h2 className="text-2xl font-bold mb-4">Face Verification</h2>
                                            <img src={faceImage} alt="Captured Face" className="w-full rounded-xl border max-w-md mx-auto" />
                                            {isMatching ? (
                                                <p className="text-blue-600 font-semibold mt-3 text-lg">⏳ Identifying face...</p>
                                            ) : (
                                                <p className="text-green-600 font-semibold mt-3 text-lg">
                                                    ✅ Challenge Completed Successfully
                                                </p>
                                            )}
                                            <button 
                                                onClick={() => {setFaceImage(null); setName(''); setRollNumber('');}} 
                                                className="mt-6 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition flex items-center justify-center mx-auto w-full md:w-auto"
                                            >
                                                🔄 Retake Photo
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {faceImage && !faceVerified && (
                                    <>
                                        <h2 className="text-2xl font-bold mt-8 mb-4">Enter Roll Number to Verify</h2>
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                className="w-full border rounded-xl p-3"
                                                placeholder="Enter your Roll Number"
                                                value={inputRollNumber}
                                                onChange={(e) => setInputRollNumber(e.target.value)}
                                            />
                                            <button
                                                onClick={verifyFace1to1}
                                                disabled={isMatching || !inputRollNumber}
                                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold"
                                            >
                                                {isMatching ? "Verifying..." : "Verify Face"}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {faceImage && faceVerified && (
                                    <>
                                        <h2 className="text-2xl font-bold mt-8 mb-6">
                                            Student Details
                                        </h2>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block font-semibold mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full border rounded-xl p-3 bg-gray-100"
                                                    placeholder="Auto-filled"
                                                    value={name}
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-semibold mb-2">Roll Number</label>
                                                <input
                                                    type="text"
                                                    className="w-full border rounded-xl p-3 bg-gray-100"
                                                    placeholder="Auto-filled"
                                                    value={rollNumber}
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-semibold mb-2">Department</label>
                                                <input
                                                    type="text"
                                                    className="w-full border rounded-xl p-3 bg-gray-100"
                                                    placeholder="Auto-filled"
                                                    value={department}
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-semibold mb-2">Section</label>
                                                <input
                                                    type="text"
                                                    className="w-full border rounded-xl p-3 bg-gray-100"
                                                    placeholder="Auto-filled"
                                                    value={section}
                                                    readOnly
                                                />
                                            </div>
                                            <button
                                                onClick={markAttendance}
                                                disabled={!rollNumber || isMatching}
                                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl text-lg font-semibold"
                                            >
                                                ✅ Submit Attendance
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        )
                    }
                </div>


            </div>

            {/* Modal for Verification Status */}
            {verificationStatus && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transform transition-all scale-100">
                        {verificationStatus.type === 'NOT_REGISTERED' && (
                            <>
                                <div className="text-6xl mb-4">🤷</div>
                                <h3 className="text-2xl font-bold text-red-600 mb-2">Not Registered</h3>
                                <p className="text-gray-600 mb-8 font-medium">No registration found for this Roll Number. Please register first.</p>
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => setVerificationStatus(null)} className="px-5 py-3 w-full bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-gray-700 transition">Close</button>
                                    <button onClick={() => navigate("/register")} className="px-5 py-3 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition">Register Now</button>
                                </div>
                            </>
                        )}
                        {verificationStatus.type === 'FACE_MISMATCH' && (
                            <>
                                <div className="text-6xl mb-4">🚫</div>
                                <h3 className="text-2xl font-bold text-red-600 mb-2">Face Mismatch</h3>
                                <p className="text-gray-600 mb-8 font-medium">Face does not match the registered student for this Roll Number.</p>
                                <button onClick={() => setVerificationStatus(null)} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md transition">Try Again</button>
                            </>
                        )}
                        {verificationStatus.type === 'SUCCESS' && (
                            <>
                                <div className="text-6xl mb-4">✅</div>
                                <h3 className="text-2xl font-bold text-green-600 mb-2">Face Verified</h3>
                                <p className="text-gray-600 mb-8 font-medium text-lg">Welcome, {verificationStatus.studentName}!</p>
                                <button onClick={() => setVerificationStatus(null)} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition">Continue</button>
                            </>
                        )}
                        {verificationStatus.type === 'ERROR' && (
                            <>
                                <div className="text-6xl mb-4">⚠️</div>
                                <h3 className="text-2xl font-bold text-orange-600 mb-2">Verification Error</h3>
                                <p className="text-gray-600 mb-8 font-medium">{verificationStatus.message}</p>
                                <button onClick={() => setVerificationStatus(null)} className="w-full py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-gray-700 transition">Close</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>

    );

}

export default StudentAttendance;