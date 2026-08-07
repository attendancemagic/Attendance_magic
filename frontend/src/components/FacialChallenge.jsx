import { useEffect, useRef, useState } from "react";

const CHALLENGES = [
    { id: "TURN_LEFT", text: "Turn Head Left" },
    { id: "TURN_RIGHT", text: "Turn Head Right" },
    { id: "LOOK_UP", text: "Look Up" },
    { id: "LOOK_DOWN", text: "Look Down" },
    { id: "BLINK", text: "Blink Both Eyes" },
    { id: "SMILE", text: "Smile Widely" }
];

export default function FacialChallenge({ onChallengeSuccess }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [challenge, setChallenge] = useState(null);
    const [status, setStatus] = useState("Initializing camera...");
    const [livenessVerified, setLivenessVerified] = useState(false);
    
    // New states for phase control
    const [phase, setPhase] = useState("CAPTURE");
    const phaseRef = useRef("CAPTURE");
    const capturedImageRef = useRef(null);
    
    const cameraRef = useRef(null);
    const successTriggered = useRef(false);
    const faceMeshRef = useRef(null);

    useEffect(() => {
        const randomChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
        setChallenge(randomChallenge);

        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement("script");
                script.src = src;
                script.crossOrigin = "anonymous";
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.body.appendChild(script);
            });
        };

        const initMediaPipe = async () => {
            try {
                await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
                await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");
                
                const FaceMesh = window.FaceMesh;
                const Camera = window.Camera;

                faceMeshRef.current = new FaceMesh({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                    }
                });

                faceMeshRef.current.setOptions({
                    maxNumFaces: 2,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                faceMeshRef.current.onResults((results) => {
                    if (successTriggered.current) return;
                    
                    if (canvasRef.current && videoRef.current) {
                        const canvasCtx = canvasRef.current.getContext('2d');
                        canvasRef.current.width = videoRef.current.videoWidth;
                        canvasRef.current.height = videoRef.current.videoHeight;
                        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                        
                        // Just draw the feed
                        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    }

                    if (phaseRef.current === "CAPTURE") {
                        if (status !== "Ready. Please position your face and click Capture.") {
                            setStatus("Ready. Please position your face and click Capture.");
                        }
                        return;
                    }

                    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                        if (results.multiFaceLandmarks.length > 1) {
                            setStatus("Multiple faces detected! Please ensure only ONE face is in view.");
                            return;
                        }
                        setStatus(`Challenge: ${randomChallenge.text}`);
                        const landmarks = results.multiFaceLandmarks[0];
                        
                        const nose = landmarks[1];
                        const leftCheek = landmarks[234];
                        const rightCheek = landmarks[454];
                        const topHead = landmarks[10];
                        const bottomChin = landmarks[152];

                        const leftDist = nose.x - leftCheek.x;
                        const rightDist = rightCheek.x - nose.x;
                        const yawRatio = leftDist / rightDist;

                        const topDist = nose.y - topHead.y;
                        const bottomDist = bottomChin.y - nose.y;
                        const pitchRatio = topDist / bottomDist;

                        // Blink calculation (Eye Aspect Ratio)
                        const getEAR = (p1, p2, p3, p4, p5, p6) => {
                            const v1 = Math.hypot(landmarks[p2].x - landmarks[p6].x, landmarks[p2].y - landmarks[p6].y);
                            const v2 = Math.hypot(landmarks[p3].x - landmarks[p5].x, landmarks[p3].y - landmarks[p5].y);
                            const h = Math.hypot(landmarks[p1].x - landmarks[p4].x, landmarks[p1].y - landmarks[p4].y);
                            return (v1 + v2) / (2.0 * h);
                        };
                        // Left eye: 33, 160, 158, 133, 153, 144
                        const leftEAR = getEAR(33, 160, 158, 133, 153, 144);
                        // Right eye: 362, 385, 387, 263, 373, 380
                        const rightEAR = getEAR(362, 385, 387, 263, 373, 380);
                        const avgEAR = (leftEAR + rightEAR) / 2;

                        // Smile calculation
                        const mouthLeft = landmarks[61];
                        const mouthRight = landmarks[291];
                        const mouthTop = landmarks[0];
                        const mouthBottom = landmarks[17];
                        const mouthWidth = Math.hypot(mouthLeft.x - mouthRight.x, mouthLeft.y - mouthRight.y);
                        const mouthHeight = Math.hypot(mouthTop.x - mouthBottom.x, mouthTop.y - mouthBottom.y);
                        const smileRatio = mouthWidth / mouthHeight;

                        let success = false;
                        
                        if (randomChallenge.id === "TURN_LEFT") {
                            if (yawRatio > 1.8) success = true;
                        } else if (randomChallenge.id === "TURN_RIGHT") {
                            if (yawRatio < 0.7) success = true;
                        } else if (randomChallenge.id === "LOOK_UP") {
                            if (pitchRatio < 0.7) success = true;
                        } else if (randomChallenge.id === "LOOK_DOWN") {
                            if (pitchRatio > 1.6) success = true;
                        } else if (randomChallenge.id === "BLINK") {
                            if (avgEAR < 0.22) success = true;
                        } else if (randomChallenge.id === "SMILE") {
                            if (smileRatio > 2.2) success = true;
                        }

                        if (success) {
                            successTriggered.current = true;
                            setLivenessVerified(true);
                            setStatus("✅ Liveness Verified!");
                            if (cameraRef.current) cameraRef.current.stop();
                            
                            // Wait a moment so user sees the success message before moving to the next step
                            setTimeout(() => {
                                onChallengeSuccess(capturedImageRef.current);
                            }, 1500);
                        }
                    } else {
                        if (phaseRef.current === "CHALLENGE") {
                            setStatus("Face not detected. Please look at the camera.");
                        }
                    }
                });

                if (videoRef.current) {
                    const camera = new Camera(videoRef.current, {
                        onFrame: async () => {
                            if (videoRef.current && !successTriggered.current && faceMeshRef.current) {
                                await faceMeshRef.current.send({ image: videoRef.current });
                            }
                        },
                        width: 640,
                        height: 480
                    });
                    camera.start();
                    cameraRef.current = camera;
                }
            } catch (error) {
                console.error("Failed to load MediaPipe:", error);
                setStatus("Failed to load tracking modules. Please refresh.");
            }
        };

        initMediaPipe();

        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop();
            }
            if (faceMeshRef.current) {
                faceMeshRef.current.close();
            }
        };
    }, []);

    const handleCapture = () => {
        if (!canvasRef.current) return;
        const imageSrc = canvasRef.current.toDataURL("image/jpeg", 0.9);
        capturedImageRef.current = imageSrc;
        phaseRef.current = "CHALLENGE";
        setPhase("CHALLENGE");
        setStatus(`Challenge: ${challenge?.text}`);
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2">Live Verification</h2>
            <div className={`p-4 rounded-xl font-bold mb-4 text-center w-full text-lg shadow-sm transition-colors duration-300 ${livenessVerified ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {status}
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-black w-full max-w-md aspect-[4/3] flex items-center justify-center">
                {/* Video is hidden, we use canvas to show mirrored feed for better UX */}
                <video ref={videoRef} className="hidden" playsInline></video>
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }} 
                ></canvas>
                {!livenessVerified && phase === "CHALLENGE" && (
                    <div className="absolute inset-0 pointer-events-none border-[3px] border-dashed border-blue-400 opacity-50 rounded-2xl m-4"></div>
                )}
                {phase === "CAPTURE" && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
                        <div className="w-48 h-64 border-4 border-dashed border-white rounded-[50%] opacity-50"></div>
                    </div>
                )}
            </div>
            
            {phase === "CAPTURE" ? (
                <>
                    <p className="text-gray-500 mt-4 text-sm text-center">
                        First, click Capture to take your photo.
                    </p>
                    <button
                        onClick={handleCapture}
                        className="mt-6 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 transition"
                    >
                        📸 Capture Photo
                    </button>
                </>
            ) : (
                <p className="text-gray-500 mt-4 text-sm text-center">
                    {livenessVerified ? "Completing verification..." : "Please follow the challenge above to mark your attendance."}
                </p>
            )}
        </div>
    );
}
