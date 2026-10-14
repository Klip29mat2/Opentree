import React from "react";

const actions = [
    { key: "newProject", label: "New project", glyph: "+", hint: "Start with a clean procedural graph.", accent: "green", action: "Create project" },
    { key: "openProject", label: "Open project", glyph: "↗", hint: "Continue shaping a saved tree.", accent: "amber", action: "Browse files" },
];

export default function StartMenu({ newProject, openProject }) {
    const handlers = { newProject, openProject };
    return <main className="launcher">
        <div className="launcher-grid" aria-hidden="true" />
        <div className="launcher-glow launcher-glow-one" aria-hidden="true" />
        <div className="launcher-glow launcher-glow-two" aria-hidden="true" />
        <section className="launcher-content">
            <div className="brand-lockup">
                <div className="brand-mark" aria-hidden="true">
                    <svg viewBox="0 0 48 48" fill="none">
                        <path d="M24 39V18m0 9-9-8m9 14 10-9M24 21l8-8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M24 5c-5 5-7 9-7 13 4 0 7-2 9-5 2 4 5 6 10 6-1-6-5-11-12-14Z" fill="currentColor" fillOpacity=".23" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M17 40h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                    </svg>
                </div>
                <span className="brand-eyebrow"><i /> PROCEDURAL TREE STUDIO</span>
                <h1>Open<span>Tree</span></h1>
                <p className="launcher-subtitle">A living system, shaped one node at a time.</p>
            </div>

            <div className="launcher-rule"><span>YOUR WORKSPACE</span><i /></div>
            <div className="project-actions">
                {actions.map((item, index) => <button className={`project-card ${item.accent}`} key={item.key} onClick={handlers[item.key]}>
                    <span className="card-index">0{index + 1}</span>
                    <span className="card-glyph">{item.glyph}</span>
                    <span className="card-title">{item.label}</span>
                    <span className="card-hint">{item.hint}</span>
                    <span className="card-action">{item.action}<b>→</b></span>
                </button>)}
            </div>
            <footer className="launcher-footer"><span>NODE-BASED <i /> REAL-TIME 3D <i /> OPEN SOURCE</span><span className="version-mark">BUILDING SOMETHING ALIVE <b>✳</b></span></footer>
        </section>
    </main>;
}
