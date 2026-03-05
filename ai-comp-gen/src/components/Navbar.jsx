import React, { useState, useEffect, useRef } from "react";
import { HiSun, HiMoon } from "react-icons/hi2";
import { FaUser } from "react-icons/fa";
import { RiHistoryFill, RiDeleteBin6Line, RiLogoutBoxRLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import { getUser, isLoggedIn, logoutUser, deleteAccount } from "../utils/auth";
import { clearHistory, clearPending } from "../utils/storage";

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [user, setUser] = useState(getUser());
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const onUserChange = () => setUser(getUser());
        window.addEventListener("user:change", onUserChange);

        const onDoc = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("click", onDoc);

        return () => {
            window.removeEventListener("user:change", onUserChange);
            document.removeEventListener("click", onDoc);
        };
    }, []);

    const handleDeleteAccount = () => {
        if (!confirm("Delete your account and all local data?")) return;

        deleteAccount();
        clearHistory();
        clearPending();

        setUser(null);
        navigate("/auth");
    };

    const handleLogout = () => {
        logoutUser();
        setUser(null);
        navigate("/auth");
    };

    const userInitial = (name) =>
        name
            ? name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            : "U";

    return (
        <nav
            className="flex items-center justify-between px-6 md:px-12 lg:px-20 h-[80px]
                       border-b border-gray-200 dark:border-gray-700
                       bg-white dark:bg-[#141319] transition-all duration-300 shadow-sm"
        >
            {/* LOGO */}
            <div className="logo flex items-center gap-2">
                <h3 className="text-[26px] font-bold tracking-wider text-gray-900 dark:text-white">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-700">
                        Craftly
                    </span>
                </h3>

                <span className="hidden md:inline text-gray-500 dark:text-gray-400 text-sm tracking-wide">
                    — AI Component Generator
                </span>
            </div>

            {/* ICONS */}
            <div className="icons flex items-center gap-4 md:gap-5">
                {/* THEME BUTTON */}
                <button
                    title="Toggle Theme"
                    onClick={toggleTheme}
                    className="w-[40px] h-[40px] flex items-center justify-center
                               text-gray-700 dark:text-gray-300 
                               hover:text-purple-500 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]
                               rounded-lg transition-all duration-200"
                >
                    {theme === "dark" ? <HiSun size={20} /> : <HiMoon size={20} />}
                </button>

                {/* AUTH BUTTON */}
                {!isLoggedIn() ? (
                    <button
                        onClick={() => navigate("/auth")}
                        className="px-3 py-2 rounded-md text-sm bg-purple-600 text-white hover:opacity-90">
                        Sign in / Sign up
                    </button>
                ) : (
                    <div className="relative" ref={ref}>
                        {/* USER AVATAR BUTTON */}
                        <button
                            onClick={() => setOpen((v) => !v)}
                            className="min-w-[44px] min-h-[44px] rounded-lg 
                                       hover:bg-gray-100 dark:hover:bg-[#2a2a2a]
                                       flex items-center justify-center transition-colors"
                        >
                            {user?.name ? (
                                <div className="flex items-center justify-center w-9 h-9 rounded-full 
                                                bg-gray-200 dark:bg-zinc-800 text-sm font-semibold 
                                                text-gray-800 dark:text-white">
                                    {userInitial(user.name)}
                                </div>
                            ) : (
                                <FaUser className="text-lg" />
                            )}
                        </button>

                        {/* DROPDOWN */}
                        {open && (
                            <div
                                className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111]
                                           border border-gray-200 dark:border-zinc-800
                                           rounded-xl shadow-xl z-50 py-2 select-none
                                           animate-fadeSlide"
                            >
                                {/* USER HEADER */}
                                <div className="px-4 py-3 text-sm border-b border-gray-100 dark:border-zinc-800">
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {user?.name || "User"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user?.email}
                                    </div>
                                </div>

                                {/* MENU ITEMS */}
                                <MenuButton
                                    onClick={() => {
                                        setOpen(false);
                                        setTimeout(() => navigate("/history"), 50);
                                    }}
                                    icon={<RiHistoryFill className="text-gray-600 dark:text-gray-300 text-lg" />}
                                    label="History"
                                />

                                <MenuButton
                                    onClick={() => {
                                        setOpen(false);
                                        handleDeleteAccount();
                                    }}
                                    icon={<RiDeleteBin6Line className="text-red-600 text-lg" />}
                                    label="Delete account"
                                    danger
                                />

                                <MenuButton
                                    onClick={() => {
                                        setOpen(false);
                                        handleLogout();
                                    }}
                                    icon={<RiLogoutBoxRLine className="text-gray-700 dark:text-gray-300 text-lg" />}
                                    label="Logout"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

const MenuButton = ({ onClick, icon, label, danger }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2.5 text-sm 
                    flex items-center gap-3 transition-colors
                    hover:bg-gray-100 dark:hover:bg-[#17171c]
                    ${danger ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);
