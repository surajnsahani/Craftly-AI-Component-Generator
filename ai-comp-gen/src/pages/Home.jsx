import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Select from 'react-select';
import { BsStars } from "react-icons/bs";
import { HiOutlineCode } from "react-icons/hi";
import Editor from '@monaco-editor/react';
import { IoCopy } from "react-icons/io5";
import { PiExportBold } from "react-icons/pi";
import { ImNewTab } from "react-icons/im";
import { FiRefreshCcw } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { GoogleGenAI } from "@google/genai";
import { toast } from 'react-toastify';
import { IoMdCode } from "react-icons/io";
import { FaEye } from "react-icons/fa";

import { saveGenerated, savePending } from "../utils/storage";
import { getUser } from "../utils/auth";

const Home = () => {
    const navigate = useNavigate();

    const options = [
        { value: 'html-css', label: 'HTML + CSS' },
        { value: 'html-tailwind', label: 'HTML + Tailwind CSS' },
        { value: 'html-bootstrap', label: 'HTML + Bootstrap' },
        { value: 'html-css-js', label: 'HTML + CSS + JS' },
        { value: 'react-cdn', label: 'React (CDN + JSX)' },
        { value: 'react-tailwind-cdn', label: 'React + Tailwind (CDN)' },
    ];


    const [outputScreen, setOutputScreen] = useState(false);
    const [tab, setTab] = useState(1);
    const [prompt, setPrompt] = useState("");
    const [framework, setFramework] = useState(options[0]);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    function extractCode(response) {
        const match = response.match(/```(?:\w+)?\n([\s\S]*?)```/);
        return match ? match[1].trim() : response.trim();
    }

    const editorLanguage =
        framework.value.startsWith("react") ? "javascript" : "html";


    const loadingPhrases = [
        "Building your component…",
        "Crafting clean UI…",
        "Writing structured code…",
        "Adding animations…",
        "Finalizing layout…",
        "Optimizing performance…",
        "Loading design tokens…",
        "Calibrating responsive breakpoints…",
        "Organizing file structure…",
        "Enhancing accessibility…",
        "Refactoring for clarity…",
        "Checking for consistency…",
        "Assembling UI elements…",
        "Rendering preview…",
        "Applying theme styles…"
    ];


    const [phraseIndex, setPhraseIndex] = useState(0);
    // Cycle loading text
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [loading]);


    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

    const buildFrameworkHint = (fw) => {
        if (fw === "react-cdn" || fw === "react-tailwind-cdn") {
            return `
Use React in a way that works directly in a normal browser, without any bundler:

- Return a COMPLETE, standalone HTML document (with <!DOCTYPE html>, <html>, <head>, <body>).
- In the <head>, include:
  - <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  - <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  - <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  ${fw === "react-tailwind-cdn" ? '- <script src="https://cdn.tailwindcss.com"></script>' : ""}
- In the <body>, include <div id="root"></div>.
- At the end of the body, include:
  <script type="text/babel">
    // React code here
    const App = () => {
      // component
    };

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(<App />);
  </script>

Important:
- Do NOT use import/export statements.
- Do NOT require any build step.
- Everything must run directly when the HTML is opened in the browser.
        `;
        }

        // Non-React stacks
        return `
- Use only the specified stack (no React).
- Return a complete HTML snippet (or full document) that can run directly in the browser.
    `;
    };



    async function getResponse() {
        try {
            setLoading(true);
            setCode("");
            setOutputScreen(true);

            const responseStream = await ai.models.generateContentStream({
                model: "gemini-2.5-flash",
                contents: `
You are a world-class Frontend Engineer and Master UI/UX Designer.
Your singular goal is to create absolute **MASTERPIECE** web components. 

Even if the user provides a very simple or vague prompt (like "a login form" or "a button"), you must over-deliver by automatically designing a **premium, highly-polished, and visually stunning** component. 

Here is what the user requested:
- Component Description: ${prompt}
- Framework: ${framework.label} (${framework.value})

### Framework rules:
${buildFrameworkHint(framework.value)}

### Design & Aesthetic Mandates (CRITICAL):
- **Visual Excellence**: The design must WOW the user. It should feel expensive, modern, and state-of-the-art.
- **Colors & Styling**: Do not use plain, boring colors. Use curated, harmonious palettes (e.g., sleek dark modes, vibrant gradients, or glassmorphism).
- **Typography**: Use modern, clean font stacks implicitly (e.g., system fonts or clean sans-serif styles). Ensure excellent hierarchy and readability.
- **Micro-interactions & Animation**: The component MUST feel alive. Add smooth transitions, elegant hover states, subtle entrance animations, and focus ring effects. 
- **Layout**: It must be fully responsive, perfectly centered, and use appropriate padding/margins.

### Coding Requirements:
- Write clean, semantic, and well-structured code.
- Optimize for accessibility (a11y) using proper ARIA labels where applicable.
- YOU MUST OUTPUT RAW CODE ONLY. Do NOT wrap your output in a Markdown fenced code block like \`\`\`html or \`\`\`javascript.
- Do not include external explanations, comments, or any introductory text.
- Start exactly at the first character of the code and end at the last character of the code.
`,
            });

            let fullExtractedCode = "";
            for await (const chunk of responseStream) {
                // If it accidentally starts with ```html or similar, we will strip it later or progressively
                fullExtractedCode += chunk.text;
                setCode(extractCode(fullExtractedCode)); // Real-time update
            }

            // Final extracted pass just in case
            const finalCode = extractCode(fullExtractedCode);
            setCode(finalCode);

            const generatedObj = {
                prompt: prompt,
                framework: framework.value,
                code: finalCode,
                ts: new Date().toISOString(),
                user: getUser()?.email || null
            };

            if (getUser()) {
                saveGenerated(generatedObj);
                toast.success("Generated component saved to your history.", {
                    autoClose: 8000,
                    className: "purple-success purple-progress"
                });
            } else {
                savePending(generatedObj);
                toast.info(
                    "Component created but temporarily. Please sign in to keep it saved on default browser.",
                    {
                        autoClose: 15000,
                        className: "purple-info purple-progress"
                    }
                );
            }


        } catch (error) {
            console.error(error);
            toast.error("Error generating code");
        } finally {
            setLoading(false);
        }
    }

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success("Code copied successfully");
        } catch {
            toast.error("Failed to copy");
        }
    };

    function downloadFile() {
        const fileName = "GenUI-Code.html";
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("File downloaded");
    }

    const refreshPreview = () => {
        setRefreshKey(prev => prev + 1);
        toast.info("Preview refreshed");
    };

    const openInNewTab = () => {
        const newWindow = window.open("", "_blank");
        if (!newWindow) {
            toast.error("Popup blocked. Please allow popups for this site.");
            return;
        }
        const isFullDocument =
            /<!DOCTYPE html>/i.test(code) || /<html[\s>]/i.test(code);

        const htmlToWrite = isFullDocument
            ? code
            : `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Preview</title>
  <style>html,body{margin:0;padding:0;}</style>
</head>
<body>
  ${code}
</body>
</html>`;

        newWindow.document.open();
        newWindow.document.write(htmlToWrite);
        newWindow.document.close();
    };



    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0e0e10] text-gray-900 dark:text-white transition-colors duration-300">
            <Navbar />

            <div className="flex flex-col lg:flex-row flex-1 items-start justify-between gap-8 px-4 md:px-12 py-10 w-full">
                {/* LEFT SECTION */}
                <div className="left w-full lg:w-1/2 bg-white dark:bg-[#141319] rounded-xl p-6 shadow-md border border-gray-200 dark:border-zinc-800 transition-colors duration-300">
                    <h3 className="text-[26px] font-semibold mb-3 text-gray-900 dark:text-white">
                        AI Component Generator
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-[16px] mb-6">
                        Describe your component and let AI generate the complete code for you.
                    </p>

                    <p className='text-[15px] font-[700] mb-2 text-gray-800 dark:text-gray-200'>Select Framework:</p>
                    <Select
                        options={options}
                        value={framework}
                        placeholder="Select a framework..."
                        classNames={{
                            control: ({ isFocused }) =>
                                `border ${isFocused ? 'border-gray-400' : 'border-gray-300 dark:border-gray-700'} 
                   bg-gray-50 dark:bg-[#0b0b0d] text-gray-800 dark:text-white rounded-md shadow-sm hover:border-gray-400 
                   min-h-[48px] px-2`,
                            menu: () =>
                                'bg-white dark:bg-[#0b0b0d] border border-gray-200 dark:border-gray-700 rounded-md mt-2 z-50 shadow-lg',
                            option: ({ isFocused, isSelected }) =>
                                `cursor-pointer px-4 py-2 text-[15px] ${isSelected
                                    ? 'bg-purple-600 text-white'
                                    : isFocused
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                        : 'bg-transparent text-gray-900 dark:text-gray-200'
                                }`,
                            singleValue: () => 'text-gray-900 dark:text-white',
                            placeholder: () => 'text-gray-400 dark:text-gray-500',
                            input: () => 'text-gray-900 dark:text-white',
                        }}
                        unstyled
                        onChange={(e) => setFramework(e)}
                    />

                    <p className='text-[15px] font-[700] mt-5 text-gray-800 dark:text-gray-200'>Describe your component in detail:</p>
                    <textarea
                        onChange={(e) => setPrompt(e.target.value)}
                        value={prompt}
                        className='w-full mt-2 min-h-[200px] rounded-xl bg-gray-100 dark:bg-[#09090B] p-[10px] text-gray-900 dark:text-white resize-none border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-500'
                        style={{ whiteSpace: "pre-wrap" }}
                        placeholder={`Examples:\n• A modern login form with gradient button and smooth hover.\n• A pricing card with three tiers and animations.\n• A navbar with dropdown and smooth transitions.`}
                    ></textarea>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <p className='text-gray-500 dark:text-gray-400 text-[14px]'>
                            Click “Generate” to create your component.
                        </p>
                        <button
                            onClick={getResponse}
                            className="generate flex items-center p-3 rounded-lg border-0 bg-gradient-to-r from-purple-400 to-purple-600 px-4 gap-2 text-white hover:opacity-80 transition-all"
                        >
                            {loading ? <ClipLoader size={15} color='white' /> : <BsStars />}
                            Generate
                        </button>
                    </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="right w-full lg:w-1/2 bg-white dark:bg-[#141319] rounded-xl shadow-md overflow-hidden flex flex-col h-[80vh] border border-gray-200 dark:border-zinc-800 transition-colors duration-300">
                    {!outputScreen ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                            {loading ? (
                                <>
                                    {/* Rotating Loader */}
                                    <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>

                                    {/* Changing phrase */}
                                    <p className="text-[16px] dark:text-gray-300 mt-4 font-medium fade-text">
                                        {loadingPhrases[phraseIndex]}
                                    </p>
                                </>
                            ) : (
                                <>
                                    {/* Default idle state */}
                                    <div className="flex items-center justify-center text-[30px] p-[20px] w-[70px] h-[70px] rounded-full bg-gradient-to-r from-purple-400 to-purple-600">
                                        <HiOutlineCode color='white' />
                                    </div>

                                    <p className='text-[16px] dark:text-gray-400 mt-3'>
                                        Your generated code and preview will appear here.
                                    </p>
                                </>
                            )}
                        </div>

                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="bg-gray-100 dark:bg-[#17171c] flex transition-colors duration-300">
                                <button onClick={() => setTab(1)} className={`w-1/2 p-[12px] rounded-tl-xl transition-all flex items-center justify-center gap-2 ${tab === 1 ? "bg-gray-200 dark:bg-[#333]" : ""}`}>
                                    <IoMdCode /> Code
                                </button>
                                <button onClick={() => setTab(2)} className={`w-1/2 p-[12px] rounded-tr-xl transition-all flex items-center justify-center gap-2 ${tab === 2 ? "bg-gray-200 dark:bg-[#333]" : ""}`}>
                                    <FaEye /> Preview
                                </button>
                            </div>

                            {/* Header */}
                            <div className="bg-gray-100 dark:bg-[#17171c] flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-zinc-800 transition-colors duration-300">
                                <p className='font-semibold text-gray-900 dark:text-white text-[15px]'>
                                    {tab === 1 ? "Code Editor" : "Live Preview"}
                                </p>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {tab === 1 ? (
                                        <>
                                            <button title="Copy Code" className="w-[40px] h-[40px] rounded-xl hover:bg-gray-200 dark:hover:bg-[#333] flex items-center justify-center text-gray-800 dark:text-white" onClick={copyCode}>
                                                <IoCopy />
                                            </button>
                                            <button title="Export File" className="w-[40px] h-[40px] rounded-xl hover:bg-gray-200 dark:hover:bg-[#333] flex items-center justify-center text-gray-800 dark:text-white" onClick={downloadFile}>
                                                <PiExportBold />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button title="Open in New Tab" className="w-[40px] h-[40px] rounded-xl hover:bg-gray-200 dark:hover:bg-[#333] flex items-center justify-center text-gray-800 dark:text-white" onClick={openInNewTab}>
                                                <ImNewTab />
                                            </button>
                                            <button title="Refresh Preview" className="w-[40px] h-[40px] rounded-xl hover:bg-gray-200 dark:hover:bg-[#333] flex items-center justify-center text-gray-800 dark:text-white" onClick={refreshPreview}>
                                                <FiRefreshCcw />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Code / Preview */}
                            <div className="flex-1 overflow-hidden">
                                {tab === 1 ? (
                                    <Editor
                                        height="100%"
                                        theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'}
                                        language={editorLanguage}
                                        value={code}
                                        onChange={(val) => setCode(val)}
                                    />

                                ) : (
                                    <iframe
                                        key={refreshKey}
                                        srcDoc={code}
                                        className="w-full h-full bg-white dark:bg-[#0e0e10] border-none"
                                        title="Preview"
                                    ></iframe>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Home;
