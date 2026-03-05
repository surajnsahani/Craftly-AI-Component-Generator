// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getHistory, deleteHistoryItem, clearHistory } from "../utils/storage";

const History = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const remove = (index) => {
        deleteHistoryItem(index);
        setHistory(getHistory());
    };

    const exportItem = (item) => {
        const blob = new Blob([item.code || ""], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "component.html";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClearAll = () => {
        if (!window.confirm("Clear all saved components from this browser?")) return;
        clearHistory();
        setHistory([]);
    };

    const formatTime = (item) => {
        const ts = item.savedAt || item.ts;
        if (!ts) return "";
        try {
            return new Date(ts).toLocaleString();
        } catch {
            return "";
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0e0e10] text-gray-900 dark:text-white transition-colors duration-300">
            <Navbar />

            {/* MAIN CONTENT */}
            <main className="flex-1 px-4 md:px-12 py-10 w-full">
                <div className="max-w-5xl mx-auto w-full">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                                History
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                View and manage components generated in this browser.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/")}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-[#15141b] hover:bg-gray-50 dark:hover:bg-[#1c1b23] transition"
                        >
                            ⟵ Back to builder
                        </button>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-[#141319] shadow-md backdrop-blur-sm p-5 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Saved components
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {history.length === 0
                                        ? "No components saved yet."
                                        : `You have ${history.length} saved component${history.length > 1 ? "s" : ""}.`}
                                </p>
                            </div>

                            {history.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="px-3 py-1.5 text-xs md:text-sm rounded-md bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {history.length === 0 ? (
                            <div className="mt-4 flex flex-col items-center justify-center gap-2 py-10 text-center">
                                <div className="w-10 h-10 rounded-full border border-dashed border-gray-400/60 flex items-center justify-center text-gray-400 text-xl">
                                    <button onClick={() => navigate("/")}>+</button>
                                </div>

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Generate a component to see it appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-2 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                {history.map((item, i) => (
                                    <div
                                        key={i}
                                        className="border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50/95 dark:bg-[#171721] px-4 py-3 flex flex-col gap-2"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    Prompt
                                                </span>
                                                <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                                                    {item.prompt || "No prompt stored"}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end gap-1 text-right">
                                                {formatTime(item) && (
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                        {formatTime(item)}
                                                    </span>
                                                )}
                                                {item.framework && (
                                                    <span className="inline-flex items-center rounded-full bg-gray-200 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-gray-800 dark:text-gray-100">
                                                        {item.framework}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <button
                                                onClick={() => exportItem(item)}
                                                className="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#141319] text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#1d1c24] transition"
                                            >
                                                Export
                                            </button>

                                            <button
                                                onClick={() => remove(i)}
                                                className="px-3 py-1.5 text-xs rounded-md border border-red-500/80 text-red-600 dark:text-red-400 bg-transparent hover:bg-red-50/80 dark:hover:bg-red-950/40 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default History;
