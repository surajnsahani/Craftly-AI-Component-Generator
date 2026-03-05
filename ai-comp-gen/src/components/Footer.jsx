import React from 'react';
import { FaGithub } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="w-full mt-16 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#0e0e10] text-gray-700 dark:text-gray-300 py-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">

                {/* Left Text */}
                <p className="text-[14px]">
                    Made with ❤️ by <span className="font-semibold text-purple-500">Suraj & Durgesh</span>
                </p>

                {/* Right Text / Project Info */}
                <div className="flex items-center gap-4 text-[13px] text-gray-500">
                    <a
                        href="https://github.com/" // Replace this with your actual repo link later!
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on GitHub"
                        className="flex items-center gap-2 hover:text-purple-500 transition-colors text-[14px]"
                    >
                        <FaGithub size={16} /> <span className="hidden sm:inline">GitHub Code</span>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
