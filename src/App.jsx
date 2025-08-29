import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Mail, Linkedin, Github, ExternalLink, Download, Sun, Moon, Bot, X, Send, User } from 'lucide-react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

// --- Gemini API Integration ---
async function callGeminiAPI(userQuery, portfolioData) {
    const apiKey = "AIzaSyAYcNDRNREJDkHvJs6W8xHvxZLJZncy7ZY"; 

    const systemPrompt = `You are Alvy's friendly and professional portfolio assistant. Your goal is to answer questions from visitors, recruiters, and potential clients based *only* on the information provided in the portfolio data. Be conversational and helpful. If a question is outside the scope of the provided data, politely state that you can only answer questions about Alex's portfolio. Do not invent information.

    Here is the portfolio data:
    Name: ${portfolioData.name}
    Title: ${portfolioData.title}
    Bio: ${portfolioData.bio}
    Skills: ${portfolioData.skills.join(', ')}
    Current Work: ${portfolioData.ongoing.join(', ')}
    Projects: ${portfolioData.projects.map(p => `Title: ${p.title}, Description: ${p.description}, Technologies: ${p.tech.join(', ')}`).join('; ')}
    Contact Info: Email (${portfolioData.contact.email}), LinkedIn (${portfolioData.contact.linkedin}), GitHub (${portfolioData.contact.github}).
    Resume: A resume is available for download.
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("API Error Response:", await response.text());
            return "Sorry, I'm having a little trouble connecting right now. Please try again later.";
        }
        const result = await response.json();
        const candidate = result.candidates?.[0];
        return candidate?.content?.parts?.[0]?.text || "I'm not sure how to answer that. Could you ask a different way?";
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, something went wrong. Please try again in a moment.";
    }
}


// --- Splash Cursor ---
const SplashCursor = () => {
  const createSplash = useCallback((e) => {
    const splash = document.createElement('div');
    splash.className = 'splash';
    document.body.appendChild(splash);

    splash.style.left = `${e.clientX}px`;
    splash.style.top = `${e.clientY}px`;

    const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
    splash.style.setProperty('--splash-color', randomColor);
    
    setTimeout(() => {
        splash.remove();
    }, 1000);
  }, []);

  useEffect(() => {
    window.addEventListener('click', createSplash);
    return () => window.removeEventListener('click', createSplash);
  }, [createSplash]);

  return null; 
};


// --- CSS ---
const customCss = `
.splash{position:fixed;width:10px;height:10px;border-radius:50%;background:var(--splash-color);transform:translate(-50%,-50%);animation:splash-animation .6s ease-out forwards;z-index:9999;pointer-events:none}
@keyframes splash-animation{0%{opacity:1;transform:translate(-50%,-50%) scale(0)}100%{opacity:0;transform:translate(-50%,-50%) scale(15)}}
.pill-nav-container{position:fixed;top:1rem;left:50%;transform:translateX(-50%);z-index:99;width:max-content}
@media (max-width:768px){.pill-nav-container{width:100%;left:0;transform:none;padding:0 1rem}}
.pill-nav{width:max-content;display:flex;align-items:center;box-sizing:border-box}
.pill-nav-items{position:relative;display:flex;align-items:center;height:var(--nav-h, 42px);background:var(--base);backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius:9999px;border: 1px solid rgba(255, 255, 255, 0.1);box-shadow:0 4px 12px rgba(0,0,0,.1)}
.pill-list{list-style:none;display:flex;align-items:stretch;gap:var(--pill-gap, 6px);margin:0;padding:4px;height:100%}
.pill-list>li{display:flex;height:100%}
.pill{display:inline-flex;align-items:center;justify-content:center;height:100%;padding:0 var(--pill-pad-x, 20px);background:var(--pill-bg);color:var(--pill-text);text-decoration:none;border-radius:20px;box-sizing:border-box;font-weight:500;font-size:14px;line-height:1;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;position:relative;overflow:hidden;transition: background-color 0.3s ease, color 0.3s ease}
.pill:hover{background-color: var(--hover-pill-bg); color: var(--hover-pill-text);}
.pill.is-active, .pill.is-active:hover {background: var(--active-pill-bg);color: var(--active-pill-text)}
.chroma-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
@media (max-width: 768px) { .chroma-grid { grid-template-columns: 1fr; } }
.chroma-card { position: relative; padding: 1.5rem; border-radius: 0.75rem; overflow: hidden; }
.dark .chroma-card { background-color: #1e293b; border: 1px solid #334155; }
.light .chroma-card { background-color: #f1f5f9; border: 1px solid #e2e8f0; }
.chroma-card::before, .chroma-card::after { content: ""; position: absolute; top: var(--glow-y); left: var(--glow-x); transform: translate(-50%, -50%); pointer-events: none; }
.chroma-card::before { z-index: 1; opacity: var(--glow-opacity); filter: blur(30px); width: 150px; height: 150px; background: radial-gradient(circle at center, hsla(170, 70%, 50%, 0.8) 0, hsla(170, 70%, 50%, 0) 65%); }
.chroma-card::after { z-index: 2; width: 100%; height: 100%; background-image: radial-gradient( circle at center, hsla(0,0%,0%,0) 30%, hsla(0,0%,0%,.6) 80%, hsla(0,0%,0%,.8) 100% ); }
`;

const StyleInjector = ({ css }) => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [css]);
  return null;
};

// --- PillNav Component ---
const PillNav = ({ items, activeHref, onLinkClick, base, pill, pillText, activePill, activePillText, hoverPill, hoverPillText }) => {
    const handleLinkClick = (e) => onLinkClick && onLinkClick(e);
    const cssVars = { "--base": base, "--pill-bg": pill, "--pill-text": pillText, "--active-pill-bg": activePill, "--active-pill-text": activePillText, "--hover-pill-bg": hoverPill, "--hover-pill-text": hoverPillText };

    return (
        <div className="pill-nav-container">
            <nav className="pill-nav" style={cssVars}>
                <div className="pill-nav-items">
                    <ul className="pill-list">{items.map((item) => <li key={item.href}><a href={item.href} className={`pill${activeHref === item.href ? " is-active" : ""}`} onClick={handleLinkClick}>{item.label}</a></li>)}</ul>
                </div>
            </nav>
        </div>
    );
};

// --- Theme Toggle Component ---
const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'dark');
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    return <motion.button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><AnimatePresence mode="wait">{theme === 'dark' ? <Sun key="sun" /> : <Moon key="moon" />}</AnimatePresence></motion.button>;
};

// --- Looper Components ---
const SkillLooper = ({ skills }) => (
    <div className="relative w-full overflow-hidden h-10"><motion.div className="absolute flex" animate={{ x: ['0%', '-50%'] }} transition={{ ease: 'linear', duration: 30, repeat: Infinity }}>{[...skills, ...skills].map((s, i) => <div key={i} className="flex-shrink-0 items-center rounded-full bg-teal-400/10 px-4 py-1 text-sm text-teal-500 dark:text-teal-300 mx-2">{s}</div>)}</motion.div></div>
);

const HeadlineLooper = ({ headlines }) => (
    <div className="relative w-full overflow-hidden h-8 mt-6"><motion.div className="absolute flex items-center" animate={{ x: ['0%', '-50%'] }} transition={{ ease: 'linear', duration: 40, repeat: Infinity }}>{[...headlines, ...headlines].map((h, i) => <div key={i} className="flex-shrink-0 flex items-center text-sm text-slate-500 dark:text-slate-400 mx-4"><span className="font-semibold mr-2 text-teal-500 dark:text-teal-400">↳</span>{h}</div>)}</motion.div></div>
);

// --- AI Chat Assistant Component ---
const PortfolioAssistant = ({ portfolioData, isVisible, onClose }) => {
    const [messages, setMessages] = useState([{ sender: 'ai', text: `Hi! I'm ${portfolioData.name}'s portfolio assistant. Ask me anything about their skills or projects.` }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const userMessage = { sender: 'user', text: input };
        setMessages(p => [...p, userMessage]);
        setInput('');
        setIsLoading(true);
        const aiResponse = await callGeminiAPI(input, portfolioData);
        setMessages(p => [...p, { sender: 'ai', text: aiResponse }]);
        setIsLoading(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-24 right-6 w-full max-w-sm h-[70vh] max-h-[500px] z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800">
                    <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800"><div className="flex items-center gap-3"><Bot className="text-teal-500" /><h3 className="font-semibold text-slate-800 dark:text-slate-200">Portfolio Assistant</h3></div><button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20} /></button></header>
                    <div className="flex-grow p-4 overflow-y-auto"><div className="flex flex-col gap-4">{messages.map((msg, i) => <div key={i} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>{msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0"><Bot size={18} className="text-teal-500" /></div>}<div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-teal-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-800 rounded-bl-none'}`}><p className="text-sm">{msg.text}</p></div>{msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center shrink-0"><User size={18} /></div>}</div>)}{isLoading && <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0"><Bot size={18} className="text-teal-500" /></div><div className="p-3 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center"><div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse mr-2" /><div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse mr-2 delay-150" /><div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse delay-300" /></div></div>}<div ref={messagesEndRef} /></div></div>
                    <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-800"><div className="relative"><input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about my projects..." className="w-full pl-4 pr-12 py-2 bg-slate-100 dark:bg-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={isLoading} /><button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-teal-500 text-white hover:bg-teal-600 disabled:bg-slate-400" disabled={isLoading || !input.trim()}><Send size={18} /></button></div></form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Chroma Grid Project Component ---
const ChromaGrid = ({ projects }) => {
    const gridRef = useRef(null);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const handleMouseMove = (e) => {
            const { left, top } = grid.getBoundingClientRect();
            const mouseX = e.clientX - left;
            const mouseY = e.clientY - top;

            grid.querySelectorAll("[data-glow]").forEach((elem) => {
                const rect = elem.getBoundingClientRect();
                const elemX = mouseX - (rect.left - left);
                const elemY = mouseY - (rect.top - top);
                elem.style.setProperty('--glow-x', `${elemX}px`);
                elem.style.setProperty('--glow-y', `${elemY}px`);
                elem.style.setProperty('--glow-opacity', '1');
            });
        };
        
        const handleMouseLeave = () => {
             grid.querySelectorAll("[data-glow]").forEach((elem) => {
                 elem.style.setProperty('--glow-opacity', '0');
             });
        }

        grid.addEventListener('mousemove', handleMouseMove);
        grid.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            grid.removeEventListener('mousemove', handleMouseMove);
            grid.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div ref={gridRef} className="chroma-grid">
            {projects.map((p, i) => (
                <div key={i} className="chroma-card" data-glow>
                    <a href={p.link} target="_blank" rel="noreferrer" className="block h-full w-full">
                        <div className="relative z-10">
                            <h3 className="inline-flex items-baseline font-medium text-slate-800 dark:text-slate-200 hover:text-teal-500 dark:hover:text-teal-300 text-lg">
                                <span>{p.title} <ExternalLink className="inline-block h-4 w-4 ml-1" /></span>
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{p.description}</p>
                            <ul className="mt-4 flex flex-wrap">
                                {p.tech.map(t => (
                                    <li key={t} className="mr-1.5 mt-2">
                                        <div className="rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-500 dark:text-teal-300">{t}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </a>
                </div>
            ))}
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    return <Portfolio />;
}

function Portfolio() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'dark');
    const [activeSection, setActiveSection] = useState('#home');
    const [isAssistantVisible, setIsAssistantVisible] = useState(false);

    
    const portfolioData = {
        name: "Nafiz Al Nahian Alvy",
        title: "Software Engineer",
        profileImage: "https://i.ibb.co.com/KcTRnw1w/NAFIZ-AL-NAHIAN-ALVY-PHOTO.png",
        bio: "I’m a passionate software enthusiast with a strong dedication to my craft. I consistently give 100% effort to every task, viewing challenges not as setbacks but as opportunities to learn and grow. With a proven ability to quickly adapt and pick up new technologies, I excel at transforming complex problems into elegant, user-friendly solutions.I have a deep love for building beautiful, interactive, and high-performing web experiences that balance both functionality and design. My adaptability allows me to thrive in any environment, ensuring I deliver value no matter the challenge.",
        ongoing: [ "Research On Bert", "Research On Bert", "Research On Lung Polyps Detection", "Research On Federation Learning" ],
        contact: { email: "nafizalnahianalvy@gmail.com", linkedin: "https://www.linkedin.com/in/nafiz-al-nahian-alvy/", github: "https://github.com/Nahian-Alvy" },
        skills: ["React", "JavaScript", "C#", "ASP.NET", "DJANGO", "PYTHON", "Flutter Basic", "C++", "Java", "PHP", "Software Quality Testing", "Machine Learning","DEEP LEARNING","NLP","COMPUTER VISION","Data Science","R Language"],
        projects: [
             { title: "Agriculture Based E-commerce", description: "A visually-rich e-commerce platform with product previews and micro-interactions Built with C# for Frontend and Backend", tech: ["C#"], link: "https://youtu.be/djP1udUXZ_o"},
             { title: "Online Voting System", description: "Project built with ASP.NET MVC Following The 3-Tier Architecture and DOM Architecture to get data from database and input data into the database using postman", tech: ["ASP.NET MVC"], link: "https://github.com/Nahian-Alvy/Online_Voting_System-Asp.Net_MVC_Backend-"},
             { title: "User Authentication", description: "This Project especially built for validation purpose for user validation to authentication ", tech: ["Django", "Flutter"], link: "https://github.com/Nahian-Alvy/flutter-django-auth-system"},
             { title: "Hatbazar", description: "This is a marketplace platform for buying and selling goods for farmers and getting help from experts.", tech: ["PHP", "CSS", "JAVASCRIPT"], link: "https://github.com/Tasnimul116/hatbazar"},
        ],
        resumeUrl: "https://nafiz-al-nahian-alvy-cv.tiiny.site"
    };

    const navLinks = [ { href: "#home", label: "Home" }, { href: "#projects", label: "Projects" }, { href: "#skills", label: "Skills" }, { href: "#contact", label: "Contact" } ];
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(`#${entry.target.id}`);
                }
            });
        }, { rootMargin: "-30% 0px -70% 0px" });

        navLinks.forEach(link => {
            const section = document.querySelector(link.href);
            if (section) {
                observer.observe(section);
            }
        });

        return () => observer.disconnect();
    }, [navLinks]);


    const handleNavClick = (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
             targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    const navTheme = theme === 'dark' 
        ? { base: 'rgba(15, 23, 42, 0.5)', pill: 'rgba(248, 250, 252, 0.1)', pillText: '#cbd5e1', activePill: '#f8fafc', activePillText: '#0f172a', hoverPill: 'rgba(248, 250, 252, 0.2)', hoverPillText: '#f8fafc' } 
        : { base: 'rgba(255, 255, 255, 0.5)', pill: 'rgba(15, 23, 42, 0.05)', pillText: '#334155', activePill: '#0f172a', activePillText: '#f8fafc', hoverPill: 'rgba(15, 23, 42, 0.1)', hoverPillText: '#0f172a' };
    
    return (
        <div className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-sans leading-relaxed selection:bg-teal-300 selection:text-teal-900">
            <SplashCursor />
            <StyleInjector css={customCss} />
            <PillNav items={navLinks} activeHref={activeSection} onLinkClick={handleNavClick} {...navTheme} />

            <div className="mx-auto min-h-screen w-full px-6 py-12 md:px-12 md:py-20 lg:px-24">
                 <div className="lg:flex lg:justify-between lg:gap-x-24">
                    <header id="home" className="lg:w-2/5 lg:max-w-lg lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:flex-col lg:justify-between lg:py-24 scroll-mt-16">
                        <div>
                           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex flex-col items-center gap-4 mb-4 text-center">
  <img
    src={portfolioData.profileImage}
    alt="Profile"
    className="rounded-full h-40 w-39 border-2 border-slate-300 dark:border-slate-700"
  />
  <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200">
    <a href="/">{portfolioData.name}</a>
  </h1>
  <h2 className="mt-3 text-lg font-medium text-slate-800 dark:text-slate-200">
    {portfolioData.title}
  </h2>
  <p className="mt-4 max-w-md">{portfolioData.bio}</p>
  <HeadlineLooper headlines={portfolioData.ongoing} />
</div>
                            </motion.div>
                        </div>
                         <div className='flex items-center gap-4 mt-8'>
                           <AnimatedButton href={portfolioData.resumeUrl} download>Download CV <Download className="h-4 w-4" /></AnimatedButton>
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-full">
                                <SocialLink href={portfolioData.contact.github} icon={Github} />
                                <SocialLink href={portfolioData.contact.linkedin} icon={Linkedin} />
                                <SocialLink href={`mailto:${portfolioData.contact.email}`} icon={Mail} />
                            </div>
                            <ThemeToggle />
                        </div>
                    </header>
                    
                    <main id="content" className="lg:flex-1 pt-24 lg:py-24">
                        <AnimatedSection id="projects">
                             <h2 className="text-sm font-bold uppercase mb-4 text-slate-600 dark:text-slate-200">Projects</h2>
                             <ChromaGrid projects={portfolioData.projects} />
                        </AnimatedSection>
                        <AnimatedSection id="skills">
                             <h2 className="text-sm font-bold uppercase mb-6 text-slate-600 dark:text-slate-200">Skills</h2>
                             <SkillLooper skills={portfolioData.skills} />
                        </AnimatedSection>
                        <AnimatedSection id="contact">
                            <h2 className="text-sm font-bold uppercase mb-4 text-slate-600 dark:text-slate-200">Get In Touch</h2>
                            <p className="mb-4">I'm always excited to connect. Feel free to reach out!</p>
                             <AnimatedButton href={`mailto:${portfolioData.contact.email}`}>Say Hello</AnimatedButton>
                        </AnimatedSection>
                    </main>
                </div>
            </div>

             <motion.button onClick={() => setIsAssistantVisible(true)} className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-teal-500 text-white shadow-lg flex items-center justify-center" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Open Portfolio Assistant"><Bot size={28} /></motion.button>
            <PortfolioAssistant portfolioData={portfolioData} isVisible={isAssistantVisible} onClose={() => setIsAssistantVisible(false)} />
        </div>
    );
}

// --- Reusable Components ---
const AnimatedButton = ({ children, ...props }) => (
    <motion.a whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-2 rounded-md bg-teal-400/10 px-4 py-2 text-sm font-medium text-teal-500 dark:text-teal-300 hover:bg-teal-400/20" {...props}>{children}</motion.a>
);
const AnimatedSection = ({ id, children }) => {
    const controls = useAnimation();
    const ref = useRef(null);
    useEffect(() => {
        const ob = new IntersectionObserver(([e]) => { if(e.isIntersecting) controls.start({ opacity: 1, y: 0 }); }, { threshold: 0.1 });
        if (ref.current) ob.observe(ref.current);
        return () => ob.disconnect();
    }, [controls]);
    return <motion.section ref={ref} id={id} initial={{ opacity: 0, y: 50 }} animate={controls} transition={{ duration: 0.6 }} className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">{children}</motion.section>;
};
const SocialLink = ({ href, icon: Icon }) => (
    <a className="block p-3 hover:text-slate-800 dark:hover:text-slate-200" href={href} target="_blank" rel="noreferrer"><Icon className="h-5 w-5" /></a>
);

