// src/pages/Auth.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveUser, getUser, setSessionLoggedIn } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useTheme from "../hooks/useTheme";
import { HiSun, HiMoon, HiArrowLeftCircle } from "react-icons/hi2";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [mode, setMode] = useState("signup");
    const [loading, setLoading] = useState(false);

    // login state
    const [login, setLogin] = useState({ email: "", password: "" });
    const [loginTouched, setLoginTouched] = useState({ email: false, password: false });
    const [loginSubmitted, setLoginSubmitted] = useState(false);
    const [loginErrors, setLoginErrors] = useState({ email: "", password: "", form: "" });

    // signup state
    const [signup, setSignup] = useState({ first: "", last: "", email: "", password: "" });
    const [signupTouched, setSignupTouched] = useState({
        first: false,
        last: false,
        email: false,
        password: false,
    });
    const [signupSubmitted, setSignupSubmitted] = useState(false);
    const [signupErrors, setSignupErrors] = useState({
        first: "",
        last: "",
        email: "",
        password: "",
        form: "",
    });

    const firstInputRef = useRef(null);

    // base input classes (light + dark)
    const inputBase =
        "mt-1 w-full rounded-md px-3 py-2 text-sm " +
        "bg-gray-100 dark:bg-[#050509] " +
        "text-gray-900 dark:text-white " +
        "placeholder:text-gray-500 dark:placeholder:text-gray-500 " +
        "focus:outline-none focus:ring-2 focus:ring-purple-500/80";

    const inputStyle = {
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#3f3f46",
    };

    // ---------- IMAGES (mode + theme) ----------

    const signupImages = {
        dark: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
        light: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80",
    };

    const loginImages = {
        dark: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=80",
        light: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
    };

    const bgImage =
        mode === "signup"
            ? theme === "dark"
                ? signupImages.dark
                : signupImages.light
            : theme === "dark"
                ? loginImages.dark
                : loginImages.light;

    // Very soft overlays for both themes
    const imageOverlay =
        theme === "dark"
            ? "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.55))"
            : "linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.35))";

    const imageBackground = `${imageOverlay}, url('${bgImage}') center/cover`;

    // Change heading/subtitle based on mode
    const imageText =
        mode === "signup"
            ? {
                line1: "Explore the Height.",
                line2: "A calm, focused space to sign in and get things done.",
            }
            : {
                line1: "Back to the summit.",
                line2: "Jump back into your components in seconds.",
            };

    // ---------- VALIDATION HELPERS ----------

    const validateLogin = (values) => {
        const errs = {};
        if (!values.email.trim()) errs.email = "Email is required.";
        else if (!emailRegex.test(values.email.trim())) errs.email = "Enter a valid email.";
        if (!values.password.trim()) errs.password = "Password is required.";
        else if (values.password.length < 6) errs.password = "Min 6 characters.";
        return errs;
    };

    const validateSignup = (values) => {
        const errs = {};
        if (!values.first.trim()) errs.first = "First name is required.";
        if (!values.last.trim()) errs.last = "Last name is required.";
        if (!values.email.trim()) errs.email = "Email is required.";
        else if (!emailRegex.test(values.email.trim())) errs.email = "Enter a valid email.";
        if (!values.password.trim()) errs.password = "Password is required.";
        else if (values.password.length < 6) errs.password = "Use 6+ chars.";
        return errs;
    };

    const showLoginError = (f) => !!(loginTouched[f] || loginSubmitted) && !!loginErrors[f];
    const showSignupError = (f) => !!(signupTouched[f] || signupSubmitted) && !!signupErrors[f];

    // focus first input when switching modes
    useEffect(() => {
        setTimeout(() => firstInputRef.current?.focus(), 50);
        setLoginErrors((s) => ({ ...s, form: "" }));
        setSignupErrors((s) => ({ ...s, form: "" }));
    }, [mode]);

    // ---------- BLUR HANDLERS ----------

    const handleLoginBlur = (field) => {
        setLoginTouched((prev) => ({ ...prev, [field]: true }));
        const errs = validateLogin(login);
        setLoginErrors((prev) => ({ ...prev, [field]: errs[field] || "" }));
    };

    const handleSignupBlur = (field) => {
        setSignupTouched((prev) => ({ ...prev, [field]: true }));
        const errs = validateSignup(signup);
        setSignupErrors((prev) => ({ ...prev, [field]: errs[field] || "" }));
    };

    // ---------- LOGIN HANDLER ----------

    const handleLogin = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoginSubmitted(true);
        setLoading(true);
        setLoginErrors((prev) => ({ ...prev, form: "" }));

        const validation = validateLogin(login);
        if (Object.keys(validation).length > 0) {
            setLoginErrors((prev) => ({
                ...prev,
                ...validation,
                form: "Please fix highlighted fields.",
            }));
            setLoading(false);
            return;
        }

        setTimeout(() => {
            const user = getUser();
            if (!user) {
                setLoginErrors((s) => ({ ...s, form: "No account found. Please sign up." }));
                toast.error("No account found. Please sign up.");
                setLoading(false);
                return;
            }

            if (
                user.email.trim().toLowerCase() === login.email.trim().toLowerCase() &&
                user.password === login.password
            ) {
                setSessionLoggedIn();
                toast.success("Welcome back!");
                setLoading(false);
                navigate("/");
            } else {
                setLoginErrors((s) => ({ ...s, form: "Invalid email or password." }));
                toast.error("Invalid credentials");
                setLoading(false);
            }
        }, 450);
    };

    // ---------- SIGNUP HANDLER ----------

    const handleSignup = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setSignupSubmitted(true);
        setLoading(true);
        setSignupErrors((prev) => ({ ...prev, form: "" }));

        const validation = validateSignup(signup);
        if (Object.keys(validation).length > 0) {
            setSignupErrors((prev) => ({
                ...prev,
                ...validation,
                form: "Please fix highlighted fields.",
            }));
            setLoading(false);
            return;
        }

        setTimeout(() => {
            const existing = getUser();
            if (
                existing &&
                existing.email &&
                existing.email.trim().toLowerCase() === signup.email.trim().toLowerCase()
            ) {
                setSignupErrors((s) => ({
                    ...s,
                    form: "Account already exists. Please log in.",
                }));
                toast.error("Account exists. Please log in.");
                setMode("login");
                setLoading(false);
                return;
            }

            const userObj = {
                name: `${signup.first.trim()} ${signup.last.trim()}`.trim(),
                email: signup.email.trim().toLowerCase(),
                password: signup.password,
            };

            try {
                const ok = saveUser(userObj);
                if (!ok) {
                    toast.error("Failed to save account (storage blocked).");
                    setSignupErrors((s) => ({
                        ...s,
                        form: "Failed to save account. Check browser settings.",
                    }));
                    setLoading(false);
                    return;
                }

                toast.success("Account created — signed in");
                setLoading(false);
                navigate("/");
            } catch (err) {
                console.error("signup save error:", err);
                toast.error("Failed to save account");
                setSignupErrors((s) => ({ ...s, form: "Failed to save account." }));
                setLoading(false);
            }
        }, 700);
    };

    // animation
    const formVariants = {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
    };

    const formOrder = mode === "login" ? "md:order-1" : "md:order-2";
    const imageOrder = mode === "login" ? "md:order-2" : "md:order-1";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0e0e10] text-gray-900 dark:text-white transition-colors duration-300 px-4 py-8">
            <div className="w-full max-w-4xl">
                {/* Mobile theme toggle */}
                <div className="flex justify-end mb-3 md:hidden">
                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 rounded-full bg-gray-200 dark:bg-black/40 border border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-black/70 transition"
                        title="Toggle theme"
                    >
                        {theme === "dark" ? <HiSun size={18} /> : <HiMoon size={18} />}
                    </button>
                </div>

                <div
                    className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-black/40 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                    style={{ perspective: "1000px" }}
                >
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(10,10,12,0.95), rgba(12,12,14,0.98))",
                        }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* image panel */}
                            <div
                                className={`${imageOrder} hidden md:flex items-end p-6 relative`}
                                style={{
                                    background: imageBackground,
                                    minHeight: 460,
                                }}
                            >


                                {/* Theme toggle icon (desktop) */}
                                <button
                                    onClick={toggleTheme}
                                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition"
                                    title="Toggle theme"
                                >
                                    {theme === "dark" ? <HiSun size={18} /> : <HiMoon size={18} />}
                                </button>

                                <div className="text-white max-w-sm pb-10">
                                    <div className="px-3 py-1 bg-white/10 border border-white/10 inline-block mb-4 rounded-md text-xs tracking-wide uppercase">
                                        CRAFTLY PROJECT
                                    </div>
                                    <h2 className="text-3xl font-extrabold">{imageText.line1}</h2>
                                    <p className="text-sm text-white/70 mt-1">{imageText.line2}</p>
                                </div>

                            </div>

                            {/* form panel */}
                            <div className={`${formOrder} p-5 bg-white dark:bg-[#050718] md:border-l md:border-white/5`}>
                                <div className="max-w-md mx-auto flex flex-col h-full">
                                    {/* title */}
                                    <div className="mb-4">
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {mode === "signup" ? "Create an account" : "Welcome back"}
                                        </h1>

                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                            {mode === "signup" ? (
                                                <>
                                                    Already have an account?{" "}
                                                    <button
                                                        onClick={() => {
                                                            setMode("login");
                                                            setLoginSubmitted(false);
                                                        }}
                                                        className="text-purple-500 dark:text-purple-300 underline underline-offset-2 hover:text-purple-400"
                                                    >
                                                        Log in
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    Don’t have an account?{" "}
                                                    <button
                                                        onClick={() => {
                                                            setMode("signup");
                                                            setSignupSubmitted(false);
                                                        }}
                                                        className="text-purple-500 dark:text-purple-300 underline underline-offset-2 hover:text-purple-400"
                                                    >
                                                        Sign up
                                                    </button>
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {/* main box */}
                                    <motion.div
                                        initial="hidden"
                                        animate="show"
                                        variants={{ show: { transition: { staggerChildren: 0.02 } } }}
                                    >
                                        <div
                                            className="flex flex-col bg-transparent rounded-md"
                                            style={{ maxHeight: "70vh", height: "100%" }}
                                        >
                                            {/* SCROLL AREA */}
                                            <div className="flex-1 overflow-y-auto pr-1">
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={mode}
                                                        initial="hidden"
                                                        animate="show"
                                                        exit="hidden"
                                                        variants={formVariants}
                                                    >
                                                        <form
                                                            onSubmit={
                                                                mode === "signup"
                                                                    ? handleSignup
                                                                    : handleLogin
                                                            }
                                                            className="space-y-3"
                                                            noValidate
                                                        >
                                                            {mode === "signup" && (
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="text-xs text-gray-700 dark:text-gray-300">
                                                                            First name
                                                                        </label>
                                                                        <input
                                                                            ref={
                                                                                mode === "signup"
                                                                                    ? firstInputRef
                                                                                    : null
                                                                            }
                                                                            className={inputBase}
                                                                            style={inputStyle}
                                                                            value={signup.first}
                                                                            onChange={(e) =>
                                                                                setSignup((prev) => ({
                                                                                    ...prev,
                                                                                    first: e.target.value,
                                                                                }))
                                                                            }
                                                                            onBlur={() =>
                                                                                handleSignupBlur("first")
                                                                            }
                                                                            aria-invalid={
                                                                                !!signupErrors.first &&
                                                                                (signupTouched.first ||
                                                                                    signupSubmitted)
                                                                            }
                                                                        />
                                                                        <div className="text-xs text-red-400 mt-1 min-h-[16px]">
                                                                            {showSignupError("first")
                                                                                ? signupErrors.first
                                                                                : ""}
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <label className="text-xs text-gray-700 dark:text-gray-300">
                                                                            Last name
                                                                        </label>
                                                                        <input
                                                                            className={inputBase}
                                                                            style={inputStyle}
                                                                            value={signup.last}
                                                                            onChange={(e) =>
                                                                                setSignup((prev) => ({
                                                                                    ...prev,
                                                                                    last: e.target.value,
                                                                                }))
                                                                            }
                                                                            onBlur={() =>
                                                                                handleSignupBlur("last")
                                                                            }
                                                                            aria-invalid={
                                                                                !!signupErrors.last &&
                                                                                (signupTouched.last ||
                                                                                    signupSubmitted)
                                                                            }
                                                                        />
                                                                        <div className="text-xs text-red-400 mt-1 min-h-[16px]">
                                                                            {showSignupError("last")
                                                                                ? signupErrors.last
                                                                                : ""}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* email */}
                                                            <div>
                                                                <label className="text-xs text-gray-700 dark:text-gray-300">
                                                                    Email
                                                                </label>
                                                                <input
                                                                    type="email"
                                                                    ref={mode === "login" ? firstInputRef : null}
                                                                    className={inputBase}
                                                                    style={inputStyle}
                                                                    value={
                                                                        mode === "signup"
                                                                            ? signup.email
                                                                            : login.email
                                                                    }
                                                                    onChange={(e) =>
                                                                        mode === "signup"
                                                                            ? setSignup((prev) => ({
                                                                                ...prev,
                                                                                email: e.target.value,
                                                                            }))
                                                                            : setLogin((prev) => ({
                                                                                ...prev,
                                                                                email: e.target.value,
                                                                            }))
                                                                    }
                                                                    onBlur={() =>
                                                                        mode === "signup"
                                                                            ? handleSignupBlur("email")
                                                                            : handleLoginBlur("email")
                                                                    }
                                                                    aria-invalid={
                                                                        !!(
                                                                            mode === "signup"
                                                                                ? signupErrors.email
                                                                                : loginErrors.email
                                                                        ) &&
                                                                        (mode === "signup"
                                                                            ? signupTouched.email ||
                                                                            signupSubmitted
                                                                            : loginTouched.email ||
                                                                            loginSubmitted)
                                                                    }
                                                                />
                                                                <div className="text-xs text-red-400 mt-1 min-h-[16px]">
                                                                    {mode === "signup"
                                                                        ? showSignupError("email")
                                                                            ? signupErrors.email
                                                                            : ""
                                                                        : showLoginError("email")
                                                                            ? loginErrors.email
                                                                            : ""}
                                                                </div>
                                                            </div>

                                                            {/* password */}
                                                            <div>
                                                                <label className="text-xs text-gray-700 dark:text-gray-300">
                                                                    Password
                                                                </label>
                                                                <input
                                                                    type="password"
                                                                    className={inputBase}
                                                                    style={inputStyle}
                                                                    value={
                                                                        mode === "signup"
                                                                            ? signup.password
                                                                            : login.password
                                                                    }
                                                                    onChange={(e) =>
                                                                        mode === "signup"
                                                                            ? setSignup((prev) => ({
                                                                                ...prev,
                                                                                password: e.target.value,
                                                                            }))
                                                                            : setLogin((prev) => ({
                                                                                ...prev,
                                                                                password: e.target.value,
                                                                            }))
                                                                    }
                                                                    onBlur={() =>
                                                                        mode === "signup"
                                                                            ? handleSignupBlur("password")
                                                                            : handleLoginBlur("password")
                                                                    }
                                                                    aria-invalid={
                                                                        !!(
                                                                            mode === "signup"
                                                                                ? signupErrors.password
                                                                                : loginErrors.password
                                                                        ) &&
                                                                        (mode === "signup"
                                                                            ? signupTouched.password ||
                                                                            signupSubmitted
                                                                            : loginTouched.password ||
                                                                            loginSubmitted)
                                                                    }
                                                                />
                                                                <div className="text-xs text-red-400 mt-1 min-h-[16px]">
                                                                    {mode === "signup"
                                                                        ? showSignupError("password")
                                                                            ? signupErrors.password
                                                                            : ""
                                                                        : showLoginError("password")
                                                                            ? loginErrors.password
                                                                            : ""}
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>

                                            {/* CTA BUTTON AREA */}
                                            <div className="pt-3 mt-2 border-t border-gray-200 dark:border-white/5">
                                                <button
                                                    className="w-full py-3 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-black font-semibold shadow-xl hover:brightness-110 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                    type="button"
                                                    onClick={() =>
                                                        mode === "signup"
                                                            ? handleSignup()
                                                            : handleLogin()
                                                    }
                                                    disabled={loading}
                                                >
                                                    {loading
                                                        ? mode === "signup"
                                                            ? "Creating..."
                                                            : "Signing in..."
                                                        : mode === "signup"
                                                            ? "Create account"
                                                            : "Log in"}
                                                </button>

                                                <div className="text-xs text-red-400 mt-2 min-h-[16px]">
                                                    {mode === "signup"
                                                        ? signupErrors.form
                                                        : loginErrors.form}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="text-center mt-3">
                                        <button
                                            onClick={() => navigate("/")}
                                            className="gap-1 text-xs text-gray-500 dark:text-gray-400 hover:underline transition"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <HiArrowLeftCircle className="text-[12px]" />
                                                Back to home
                                            </div>
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
