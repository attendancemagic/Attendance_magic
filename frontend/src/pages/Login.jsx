import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import API from "../services/api";
import { toast, Toaster } from "react-hot-toast";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const login = async () => {
        setLoading(true);
        const loadingToast = toast.loading("Processing...");

        try {
            const response = await API.post(
                "login/",
                {
                    username,
                    password,
                }
            );

            localStorage.setItem(
                "access",
                response.data.access
            );

            localStorage.setItem(
                "refresh",
                response.data.refresh
            );

            toast.success("Login Successful!", { id: loadingToast });
            navigate("/faculty");

        }
        catch (error) {
            toast.error("Invalid Username or Password", { id: loadingToast });
            setMessage("Invalid Username or Password");

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen relative flex items-center justify-center md:block font-sans overflow-hidden bg-black animate-fade-in">
            <Toaster position="top-center" />
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes videoZoom {
                        from { transform: scale(1.03); }
                        to { transform: scale(1); }
                    }
                    @keyframes slideInRight {
                        from { opacity: 0; transform: translateX(50px) translateY(-50%); }
                        to { opacity: 1; transform: translateX(0) translateY(-50%); }
                    }
                    @keyframes slideInMobile {
                        from { opacity: 0; transform: translateY(40px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fadeIn 1.2s ease-out forwards;
                    }
                    .animate-video-zoom {
                        animation: videoZoom 6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .animate-slide-right {
                        animation: slideInMobile 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    @media (min-width: 768px) {
                        .animate-slide-right {
                            animation: slideInRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                    }
                    
                    /* Custom placeholder color */
                    input::placeholder {
                        color: rgba(255, 255, 255, 0.65);
                    }
                `}
            </style>

            {/* Fixed Video Background */}
            <div className="fixed inset-0 z-0">
                <video 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    className="w-full h-full object-cover animate-video-zoom"
                >
                    <source src="https://res.cloudinary.com/qpzoydhi/video/upload/v1786119799/WhatsApp_Video_2026-08-06_at_2.32.07_PM_or6slo.mp4" type="video/mp4" />
                </video>
                
                {/* Subtle base vignette & radial shadow around screen edges */}
                <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)]"></div>

                {/* Smooth cinematic transition fade from video to login area (Dark gradient to support white text) */}
                <div 
                    className="absolute inset-y-0 right-0 w-full md:w-[70%] lg:w-[60%] xl:w-[50%] pointer-events-none hidden md:block" 
                    style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.85) 100%)' }}
                ></div>

                {/* Additional Frosted Blur fading in from the left */}
                <div 
                    className="absolute inset-y-0 right-0 w-full md:w-[60%] lg:w-[50%] pointer-events-none bg-[rgba(255,255,255,0.03)] backdrop-blur-[20px] hidden md:block"
                    style={{ 
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 60%)', 
                        maskImage: 'linear-gradient(to right, transparent, black 60%)' 
                    }}
                ></div>
            </div>

            {/* Global Logo - Moved slightly higher and hidden entirely on mobile */}
            <img 
                src="https://res.cloudinary.com/qpzoydhi/image/upload/v1786119954/IMG_2908_myf0nj.png" 
                alt="SPARCX Logo" 
                className="absolute top-[28px] left-[48px] w-[160px] z-50 object-contain drop-shadow-[0_4px_15px_rgba(0,0,0,0.4)] hidden md:block"
            />

            {/* Right-aligned Glassmorphism Login Card (Perfectly centered on mobile) */}
            <div className="relative md:absolute md:right-[6%] lg:right-[8%] md:top-1/2 w-full px-5 sm:px-8 md:px-0 max-w-[480px] z-20 animate-slide-right mx-auto md:mx-0">
                
                <div 
                    className="w-full p-8 sm:p-10"
                    style={{
                        background: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(22px)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: '28px',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.35), 0 0 40px rgba(255,102,0,0.12)'
                    }}
                >
                    <div className="text-left mb-10">
                        <h2 className="text-[38px] sm:text-[42px] font-extrabold text-white mb-2 tracking-tight">
                            Welcome <span className="text-[#ff5a00]">Back</span>
                        </h2>
                        <p className="text-gray-300 font-medium text-[16px] sm:text-[17px] tracking-wide">
                            Login to your account to continue
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Username Input */}
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors duration-300">
                                    <User className="h-[20px] w-[20px]" style={{ color: 'rgba(255,255,255,0.7)' }} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full h-[60px] pl-[52px] pr-5 rounded-[16px] focus:outline-none focus:ring-[2px] focus:ring-[#ff5a00]/50 transition-all duration-300 text-white font-medium text-[16px]"
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.15)'
                                    }}
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.15)';
                                        e.target.style.borderColor = '#ff5a00';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.08)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors duration-300">
                                    <Lock className="h-[20px] w-[20px]" style={{ color: 'rgba(255,255,255,0.7)' }} strokeWidth={2.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="block w-full h-[60px] pl-[52px] pr-12 rounded-[16px] focus:outline-none focus:ring-[2px] focus:ring-[#ff5a00]/50 transition-all duration-300 text-white font-medium text-[16px]"
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.15)'
                                    }}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.15)';
                                        e.target.style.borderColor = '#ff5a00';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.08)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                                    }}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-5 flex items-center hover:text-white transition-colors"
                                    style={{ color: 'rgba(255,255,255,0.7)' }}
                                >
                                    {showPassword ? <EyeOff className="h-[20px] w-[20px]" strokeWidth={2.5} /> : <Eye className="h-[20px] w-[20px]" strokeWidth={2.5} />}
                                </button>
                            </div>
                        </div>

                        {/* Additional Options */}
                        <div className="flex items-center justify-between text-[14px] pt-2 pb-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        className="peer w-[20px] h-[20px] rounded-[6px] appearance-none checked:bg-[#ff5a00] checked:border-[#ff5a00] transition-all cursor-pointer"
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)'
                                        }}
                                    />
                                    <svg className="absolute w-[12px] h-[12px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="font-medium text-gray-300 group-hover:text-white transition-colors tracking-wide">Remember me</span>
                            </label>
                            <a href="#" className="font-medium text-[#ff5a00] hover:text-[#ff8c00] transition-colors tracking-wide">Forgot password?</a>
                        </div>

                        {/* Error Message */}
                        {message && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 backdrop-blur-md text-red-200 rounded-xl text-[15px] text-center font-semibold animate-fade-in shadow-sm">
                                {message}
                            </div>
                        )}

                        {/* Login Button */}
                        <div className="pt-4">
                            <button
                                onClick={login}
                                disabled={loading}
                                className={`w-full h-[60px] flex items-center justify-center gap-3 ${loading ? 'bg-orange-500/50 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-[#ff5a00] to-[#e63a00] hover:shadow-[0_12px_30px_rgba(255,90,0,0.4)] hover:-translate-y-[2px]'} text-white font-bold text-[18px] tracking-wide rounded-[18px] shadow-[0_4px_20px_rgba(255,90,0,0.3)] transition-all duration-300 group`}
                            >
                                <span>{loading ? "Processing..." : "Login"}</span>
                                {!loading && (
                                    <ArrowRight className="w-[22px] h-[22px] group-hover:translate-x-1.5 transition-transform duration-300" strokeWidth={2.5} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
