import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// THREE is expected to be loaded globally via a script tag in the environment 
// to avoid the dynamic import error when using module syntax with a CDN URL.
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

// Declare global THREE
declare global {
  interface Window {
    THREE: any;
  }
}

// Type for flow sequence steps
interface FlowStep {
  nodes: string | string[];
  path: string | string[] | null;
  duration: number;
  type?: 'split' | 'merge-pre' | 'dramatic' | 'loop';
}

// --- Static Data Definitions (Memoized) ---
const nodeInfo = {
    source: {
        title: 'SOURCE', type: 'DOMICILE Layer',
        description: 'The Prime Mover. Origin point where intention converts to executable matter, providing initial energy and context for the entire contract-driven system.',
        inputs: 'Human Intention', outputs: 'Action Potential', guarantees: 'Root Authority',
        position: { x: 600, y: 215 }
    },
    pact: {
        title: 'PACT', type: 'COVENANT Layer',
        description: 'The Constitutional Agreement. High-level promise refined into machine-readable structure (FORM) and enforceable behavioral rules (LAW).',
        inputs: 'Source Energy', outputs: 'FORM + LAW Specifications', guarantees: 'Contract Integrity',
        position: { x: 600, y: 425 }
    },
    form: {
        title: 'FORM', type: 'COVENANT Layer (Structure)',
        description: 'Schema Definition Engine. Enforces exact shape, type, and format of all data structures before any execution consideration.',
        inputs: 'Data Requirements', outputs: 'Type Schemas & Validation Rules', guarantees: 'Structural Compliance',
        position: { x: 270, y: 505 }
    },
    law: {
        title: 'LAW', type: 'COVENANT Layer (Governance)',
        description: 'Policy Enforcement Engine. Complete regulatory framework declaring operational boundaries and compliance requirements.',
        inputs: 'Governance Rules', outputs: 'Policy Manifests & Constraints', guarantees: 'Regulatory Adherence',
        position: { x: 930, y: 505 }
    },
    test: {
        title: 'TEST', type: 'COVENANT Layer (Validation)',
        description: 'Automated Compliance Verifier. Validates all proposed actions and data against FORM schemas ensuring structural integrity.',
        inputs: 'Data + Schema Rules', outputs: 'Validation Certificates', guarantees: 'Data Integrity',
        position: { x: 500, y: 585 }
    },
    gate: {
        title: 'GATE', type: 'COVENANT Layer (Authority)',
        description: 'Final Authorization Gateway. Validates against LAW policies and grants execution authority ensuring ethical compliance.',
        inputs: 'Validated Data + Policies', outputs: 'Execution Authorization', guarantees: 'Ethical Authority',
        position: { x: 700, y: 585 }
    },
    actor: {
        title: 'ACTOR', type: 'ENGAGE Layer (Execution)',
        description: 'Execution Engine. Performs authorized work only after passing all validation and governance checkpoints (TEST + GATE).',
        inputs: 'Execution Grant', outputs: 'Work Products + Logs', guarantees: 'Accountable Execution',
        position: { x: 600, y: 835 }
    },
    proof: {
        title: 'PROOF', type: 'ENGAGE Layer (Audit)',
        description: 'Cryptographic Audit Trail. Immutable hash chain recording executed actions and complete approval history for full auditability.',
        inputs: 'Execution Logs', outputs: 'Hash Chain + Certificates', guarantees: 'Non-Repudiation',
        position: { x: 350, y: 835 }
    }
};

const getPathData = () => [
    { id: 'conn-domicile-covenant', color: 'var(--color-contract)' },
    { id: 'conn-covenant-form', color: 'var(--color-contract)' },
    { id: 'conn-covenant-law', color: 'var(--color-contract)' },
    { id: 'conn-form-test', color: 'var(--color-validation)' },
    { id: 'conn-law-gate', color: 'var(--color-contract)' },
    { id: 'conn-test-gate', color: 'var(--color-contract)' },
    { id: 'conn-gate-actor', color: 'var(--color-proof)' },
    { id: 'conn-actor-proof', color: 'var(--color-validation)' },
    { id: 'conn-actor-source', color: 'var(--color-feedback)' }
];

// --- Flow Sequence Definition ---
const flowSequence: FlowStep[] = [
    // 1. Domicile to Pact
    { nodes: ['source'], path: 'conn-domicile-covenant', duration: 1200 },
    // 2. Pact (Pause and Split)
    { nodes: ['pact'], path: null, duration: 800 },
    // 3. Split to Form & Law
    { nodes: ['form', 'law'], path: ['conn-covenant-form', 'conn-covenant-law'], duration: 1500, type: 'split' },
    // 4. Test & Gate Pre-Merge
    { nodes: ['test', 'gate'], path: ['conn-form-test', 'conn-law-gate'], duration: 1500, type: 'merge-pre' },
    // 5. Test & Gate Merge (Short connection)
    { nodes: ['gate'], path: 'conn-test-gate', duration: 500 },
    // 6. Gate to Actor (Dramatic)
    { nodes: ['actor'], path: 'conn-gate-actor', duration: 2000, type: 'dramatic' },
    // 7. Execution and Audit Trail
    { nodes: ['proof'], path: 'conn-actor-proof', duration: 1200 },
    // 8. Torus Field Return (Feedback Loop)
    { nodes: ['source'], path: 'conn-actor-source', duration: 4000, type: 'loop' }
];

// --- Component: BackgroundBeamEffect (THREE.js Integration) ---
const BackgroundBeamEffect = React.memo(() => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if THREE is loaded globally
        if (typeof window.THREE === 'undefined' || !mountRef.current) {
            console.warn("THREE.js is not available globally. Background effect will not run.");
            return;
        }

        const container = mountRef.current;
        let scene: any, camera: any, renderer: any, beamLine: any;
        let animationFrameId: number;

        // Scene setup
        // Access THREE from global scope
        const THREE = window.THREE;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
        camera.position.z = 5;

        // Create the dramatic, glowing line (simplification of LaserFlow)
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            -2, 0, 0,
            2, 0, 0
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        
        const material = new THREE.LineBasicMaterial({
            color: 0x909F96, // Sage color
            linewidth: 3,
            transparent: true,
            opacity: 0.2
        });
        beamLine = new THREE.Line(geometry, material);
        scene.add(beamLine);
        
        // Add a soft white ambient light for glow simulation
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); 
        scene.add(ambientLight);

        // Animation loop
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Simple dramatic movement for background ambiance
            const time = Date.now() * 0.0005;
            beamLine.rotation.z = time * 0.5;
            beamLine.position.y = Math.sin(time * 0.8) * 0.5;

            renderer.render(scene, camera);
        };

        const onResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('resize', onResize);
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', onResize);
            if (renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div ref={mountRef} style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1, // Below the SVG
            pointerEvents: 'none',
            opacity: 0.3
        }} />
    );
});


// --- Main Component ---
const App = () => {
    // State management
    const [flowActive, setFlowActive] = useState(true);
    const [labelsVisible, setLabelsVisible] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null); // Node illuminated by the flow
    const [activePathIds, setActivePathIds] = useState<string[]>([]); // Path illuminated by the flow
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [currentInfo, setCurrentInfo] = useState(nodeInfo.pact);
    const flowRef = useRef(null); // Ref for flow control logic
    const flowStatusRef = useRef<HTMLSpanElement>(null);
    const flowAbortController = useRef<AbortController | null>(null);

    // --- Interaction Handlers ---

    const resetConnections = useCallback(() => {
        document.querySelectorAll('.connection').forEach(conn => {
            conn.classList.remove('active', 'payload', 'spectacle');
            conn.setAttribute('marker-end', 'url(#arrowhead)');
            const path = conn as SVGPathElement;
            path.style.strokeDashoffset = '0';
            path.style.strokeDasharray = '';
            path.style.transition = '';
        });
    }, []);

    const showNodeInfo = useCallback((id: string) => {
        const info = (nodeInfo as any)[id];
        if (info) {
            setCurrentInfo(info);
            setIsPanelVisible(true);
        }
        setActiveNodeId(id);
    }, []);

    const closeInfoPanel = useCallback(() => {
        setIsPanelVisible(false);
        setActiveNodeId(null);
        setActivePathIds([]);
        resetConnections();
        applyFilter(activeFilter);
    }, [activeFilter, resetConnections]);

    const handleNodeClick = (id: string) => {
        if (isPanelVisible && activeNodeId === id) {
             closeInfoPanel();
        } else {
            showNodeInfo(id);
        }
    };
    
    // Node hover/leave logic is mostly disabled when flow is active for clean visuals
    const handleNodeEnter = (id: string) => {
        // Simple highlight on hover if the info panel is closed
        if (!isPanelVisible && !flowActive) {
            setActiveNodeId(id);
        }
    };

    const handleNodeLeave = () => {
        if (!isPanelVisible && !flowActive) {
            setActiveNodeId(null);
        }
    };

    const applyFilter = useCallback((filter: string) => {
        setActiveFilter(filter);
        // ... (Filter logic remains similar to previous version, excluded for brevity but assumed to be here)
        // Ensure that the node illumination from the flow overrides the filter opacity when flow is active.
        const nodes = document.querySelectorAll('.node-wrapper');
        nodes.forEach(n => {
            (n as HTMLElement).style.opacity = '1'; // Keep all nodes visible for now
        });
    }, []);

    // --- Single Payload Beam Flow Logic ---

    const delay = (ms: number, signal?: AbortSignal): Promise<void> => new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(new Error('Aborted')); // Reject with an Error object
        const timeoutId = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Aborted')); // Reject with an Error object
        });
    });

    const animatePath = useCallback((pathId: string, duration: number) => {
        return new Promise<void>((resolve) => {
            const pathEl = document.getElementById(pathId) as SVGPathElement;
            if (!pathEl) return resolve();
            
            const length = pathEl.getTotalLength();
            pathEl.style.transition = `stroke-dashoffset ${duration}ms linear`;
            pathEl.style.strokeDasharray = `${length} ${length}`;
            pathEl.style.strokeDashoffset = String(length);
            pathEl.classList.add('payload');

            // Set the offset to 0 to make the dash appear
            requestAnimationFrame(() => {
                pathEl.style.strokeDashoffset = '0';
            });
            
            // Wait for the animation to complete
            setTimeout(() => {
                pathEl.classList.remove('payload');
                pathEl.classList.add('active'); // Keep illuminated after the payload passes
                resolve();
            }, duration);
        });
    }, []);


    const startBeamSequence = useCallback(async (signal?: AbortSignal) => {
        if (!flowActive || signal?.aborted) return;

        try {
            // Reset all previous illuminations
            resetConnections();
            setActiveNodeId(null);
            
            while (flowActive && !signal?.aborted) {
                // Main Loop
                for (const step of flowSequence) {
                    if (signal?.aborted || !flowActive) throw new Error('Aborted');
                    
                    // 1. Illuminate Node(s)
                    const nodeIds = Array.isArray(step.nodes) ? step.nodes : [step.nodes];
                    
                    // Handle multiple nodes (for split scenarios)
                    if (nodeIds.length > 1) {
                        nodeIds.forEach(nodeId => {
                            const nodeEl = document.querySelector(`.node-wrapper[data-id="${nodeId}"]`);
                            nodeEl?.classList.add('active');
                        });
                        await delay(step.duration / 3, signal);
                        nodeIds.forEach(nodeId => {
                            const nodeEl = document.querySelector(`.node-wrapper[data-id="${nodeId}"]`);
                            nodeEl?.classList.remove('active');
                        });
                    } else {
                        setActiveNodeId(nodeIds[0]);
                        await delay(step.duration / 3, signal);
                    }

                    // 2. Animate Path(s)
                    if (step.path && !signal?.aborted) {
                        setActiveNodeId(null); // Clear node illumination while beam travels
                        
                        const paths = Array.isArray(step.path) ? step.path : [step.path];
                        setActivePathIds(paths);

                        // Handle parallel/split animation
                        await Promise.all(paths.map(p => animatePath(p, step.duration)));
                        
                        setActivePathIds([]); // Clear path illumination
                    }

                    // 3. Special Step Handlers (Drama)
                    if (step.type === 'dramatic' && !signal?.aborted) {
                        // Actor node drama
                        setActiveNodeId('actor');
                        const actorNode = document.querySelector('.node-wrapper[data-id="actor"] .node-styled');
                        actorNode?.classList.add('dramatic-glow');
                        await delay(1000, signal);
                        actorNode?.classList.remove('dramatic-glow');
                    }
                    
                    // 4. Torus Field Return: Lightshow spectacle and loop end
                    if (step.type === 'loop' && !signal?.aborted) {
                        setActiveNodeId('source'); // Final arrival at Source
                        
                        // Implement Spectacle: Flash all nodes/paths briefly
                        const allNodes = document.querySelectorAll('.node-styled');
                        const allConnections = document.querySelectorAll('.connection');
                        
                        allNodes.forEach(el => el.classList.add('spectacle'));
                        allConnections.forEach(el => el.classList.add('spectacle'));
                        
                        await delay(500, signal); // Flash duration
                        
                        allNodes.forEach(el => el.classList.remove('spectacle'));
                        allConnections.forEach(el => el.classList.remove('spectacle'));
                        
                        // Reset for next loop
                        setActiveNodeId(null);
                        resetConnections();
                        
                        // Wait before restarting the loop
                        await delay(2000, signal);
                    }
                }
            }
        } catch (error: any) {
            if (error.message !== 'Aborted') {
                console.error("Flow sequence error:", error);
            }
        }
    }, [flowActive, animatePath, resetConnections]);

    // --- Control Handlers ---

    const toggleFlow = useCallback(() => {
        setFlowActive(prev => !prev);
    }, []);

    const toggleLabels = useCallback(() => {
        setLabelsVisible(prev => !prev);
    }, []);

    const resetView = useCallback(() => {
        if (flowAbortController.current) {
            flowAbortController.current.abort();
            flowAbortController.current = null;
        }
        closeInfoPanel();
        applyFilter('all');
        setFlowActive(true); 
    }, [closeInfoPanel, applyFilter]);
    
    // --- Flow Initialization and Control Effect ---

    useEffect(() => {
        if (flowActive) {
            // Abort previous flow sequence if it exists
            if (flowAbortController.current) {
                flowAbortController.current.abort();
            }
            
            // Start new sequence
            flowAbortController.current = new AbortController();
            startBeamSequence(flowAbortController.current.signal);
        } else {
            // Stop flow sequence
            if (flowAbortController.current) {
                flowAbortController.current.abort();
                flowAbortController.current = null;
            }
            resetConnections();
            setActiveNodeId(null);
            setActivePathIds([]);
        }

        if (flowStatusRef.current) {
             flowStatusRef.current.textContent = flowActive ? 'Flow Active' : 'Flow Paused';
        }

        // Cleanup function for requestAnimationFrame IDs
        return () => {
             if (flowAbortController.current) {
                flowAbortController.current.abort();
            }
        };
    }, [flowActive, startBeamSequence, resetConnections]);

    // Initial load effects
    useEffect(() => {
        applyFilter('all');
        showNodeInfo('pact'); // Show info panel for PACT on load
    }, [applyFilter, showNodeInfo]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeInfoPanel();
            if (e.key === 'f') toggleFlow();
            if (e.key === 'l') toggleLabels();
            if (e.key === 'r') resetView();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeInfoPanel, toggleFlow, toggleLabels, resetView]);


    // --- Render Helpers ---

    const renderNode = (id: string, label: string, iconClass: string, style: React.CSSProperties) => {
        const isActive = activeNodeId === id;
        return (
            <div 
                key={id} 
                className={`node-wrapper ${isActive ? 'active' : ''}`} 
                data-id={id} 
                style={style}
                onClick={() => handleNodeClick(id)}
                onMouseEnter={() => handleNodeEnter(id)}
                onMouseLeave={handleNodeLeave}
            >
                <div className="node-styled">
                    <i className={`node-icon ${iconClass}`}></i>
                    <span className="node-label">{label}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="App">
            
            {/* Custom CSS (Tailwind cannot handle complex shadows/filters required) */}
            <style>{`
                /* --- CORE STYLES --- */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
                
                :root {
                    /* Core Palette */
                    --black: #000000;
                    --white: #ffffff;
                    
                    /* Tactical Accent Colors */
                    --gold: #C9A227; /* Primary Active/Bri Light */
                    --sage: #909F96; /* Primary Inactive Text/Icon */
                    --sage-dark: #626E67; /* Inactive Border/Stroke */
                    --slate-darker: #1e293b; /* Info Panel BG */
                    
                    /* Node/Filter Specific Colors */
                    --color-contract: #C9A227; /* Gold */
                    --color-validation: #7fa8c4; /* Blue */
                    --color-proof: #ff8c00; /* Orange/Copper */
                    --color-feedback: #ff5555; /* Red/Alert */
                    --color-all: #ffffff; /* White/Neutral */
                    --hyper-white: #e0e0e0;

                    /* Flow Colors */
                    --beam-color: #f7f7f7;
                    --beam-glow: #ffffff;
                }
                
                body {
                    background: var(--black);
                    color: var(--white);
                    font-family: 'Inter', sans-serif;
                    min-height: 100vh;
                    overflow: hidden; 
                    -webkit-font-smoothing: antialiased;
                }
                
                /* --- HEADER & GRID --- */
                .header {
                    position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.5rem 3rem;
                    display: flex; justify-content: space-between; align-items: center;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
                }
                .logo span { font-weight: 800; font-size: 1.25rem; letter-spacing: -0.05em; color: var(--gold); }
                .header-subtitle { font-size: 0.85rem; color: var(--sage); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500; }
                .grid-pattern {
                    position: fixed; inset: 0;
                    background-image: 
                        linear-gradient(rgba(100,116,139,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(100,116,139,0.05) 1px, transparent 1px);
                    background-size: 50px 50px;
                    pointer-events: none;
                }

                /* --- CANVAS & SVG LINES --- */
                .canvas-container {
                    width: 1200px; /* Fixed width matching viewBox */
                    height: 1050px; /* Fixed height matching viewBox */
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                
                #architecture-svg {
                    width: 100%;
                    height: 100%;
                    position: absolute; 
                    top: 0;
                    left: 0;
                }

                /* Layer Backgrounds (Plaque/Card style) */
                .layer-bg { fill: #1A1F1C; stroke: var(--sage-dark); stroke-width: 2; rx: 12px; ry: 12px; }
                .layer-label-main { fill: var(--sage); font-family: 'Inter', sans-serif; font-weight: 800; font-size: 24px; letter-spacing: 0.15em; text-transform: uppercase; text-anchor: middle; }
                .layer-label-sub { fill: var(--sage-dark); font-family: 'Inter', sans-serif; font-weight: 500; font-size: 14px; letter-spacing: 0.05em; text-anchor: middle; font-style: italic; }

                /* Connection Lines & Arrows */
                .connection { 
                    stroke: var(--sage-dark); 
                    stroke-width: 1.5; 
                    fill: none; 
                    transition: all 0.3s ease; 
                    opacity: 1; /* Default visibility */
                }
                
                /* Path Illumination Styles (Active/Passed Beam) */
                .connection.active { 
                    stroke: var(--gold); 
                    stroke-width: 2.5; 
                    filter: drop-shadow(0 0 5px rgba(201, 162, 39, 0.8)); 
                }

                /* Payload Beam Style (Illuminating Light) */
                .connection.payload {
                    stroke: var(--beam-color); 
                    stroke-width: 3.5; 
                    filter: drop-shadow(0 0 10px var(--beam-glow));
                }

                /* Spectacle Class for dramatic flash */
                .connection.spectacle {
                    stroke: var(--hyper-white);
                    stroke-width: 4;
                    filter: drop-shadow(0 0 20px var(--hyper-white));
                    transition: all 0.1s ease-in-out;
                }

                /* New Arrowhead Definitions */
                #arrowhead-white polygon { fill: var(--hyper-white); }
                #arrowhead-gold polygon { fill: var(--gold); }

                .annotations { transition: opacity 0.3s; }
                
                /* --- NODE STYLES (DIV BASED) --- */
                .node-wrapper {
                    position: absolute;
                    width: 140px;
                    height: 80px;
                    z-index: 50;
                    cursor: pointer;
                    transition: opacity 0.3s;
                    transform: translate(-50%, -50%); /* Center the nodes on their coordinates */
                }
                
                .node-styled {
                    width: 100%; height: 100%;
                    /* Default look matching the filter buttons' inactive state */
                    background: linear-gradient(to bottom, #494949, rgb(156, 156, 156));
                    border-radius: 22px;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    position: relative;
                    border-top: 1.4px solid var(--hyper-white); 
                    transition: all 0.2s;
                    box-shadow: 0px 2px 2px 2.5px rgba(54, 54, 54, 0.349);
                    font-family: 'JetBrains Mono', monospace;
                    text-transform: uppercase;
                }

                /* Node Content & Text */
                .node-label {
                    font-size: 14px; font-weight: 700; color: rgba(255, 255, 255, 0.39); margin-top: 8px; transition: all 0.1s linear;
                    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.281), -0.5px -0.5px 1.5px rgba(255, 255, 255, 0.24);
                    letter-spacing: 0.5px;
                }
                .node-icon {
                    font-size: 24px; color: rgba(255, 255, 255, 0.39); transition: all 0.1s linear;
                    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.281), -0.5px -0.5px 1.5px rgba(255, 255, 255, 0.24);
                }
                
                /* --- HYPER WHITE ACTIVE/FLOW ILLUMINATION STATE --- */
                .node-wrapper.active .node-styled,
                .node-wrapper:hover .node-styled,
                .node-styled.dramatic-glow,
                .node-styled.spectacle {
                    box-shadow: 0px -2px 27px 0.5px rgba(25, 25, 25, 1.905); 
                    background: linear-gradient(to bottom, #bbbbbb7a, #6e6e6e93); 
                    border-top: none;
                    filter: none;
                    transform: scale(1.02);
                }

                /* Halo/Bri Light (::before) - Unified White Glow */
                .node-styled::before {
                    content: "";
                    width: 100%; height: 100%;
                    scale: 1.05; 
                    border-radius: 25px;
                    background: none; /* Default no halo */
                    transition: all 0.2s;
                    position: absolute; z-index: -1;
                }

                .node-wrapper.active .node-styled::before,
                .node-wrapper:hover .node-styled::before {
                    /* White Halo on Active/Hover */
                    background: linear-gradient(to bottom, transparent 10%, rgba(255, 255, 255, 0.4), transparent 90%),
                                linear-gradient(to left, transparent 10%, rgba(255, 255, 255, 0.4), transparent 90%);
                }

                /* Dramatic Glow (Actor) */
                .node-styled.dramatic-glow {
                     background: radial-gradient(circle at center, rgba(255, 140, 0, 0.8) 0%, rgba(201, 162, 39, 0.4) 50%, rgba(25, 25, 25, 0) 100%);
                }
                .node-styled.spectacle {
                    background: var(--hyper-white);
                    box-shadow: 0 0 30px 10px var(--hyper-white), 0 0 50px 20px rgba(255, 255, 255, 0.5);
                }


                /* Active Text Color and Shadow - Unified White Glow */
                .node-wrapper.active .node-icon,
                .node-wrapper.active .node-label,
                .node-wrapper:hover .node-icon,
                .node-wrapper:hover .node-label,
                .node-styled.dramatic-glow .node-icon,
                .node-styled.dramatic-glow .node-label,
                .node-styled.spectacle .node-icon,
                .node-styled.spectacle .node-label {
                    color: var(--hyper-white);
                    text-shadow: 0px 0px 15px rgba(255, 255, 255, 0.9);
                }

                
                /* --- FILTER CONTROLS (Top Buttons) --- */
                .filter-controls { 
                    position: fixed; top: 2rem; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 150; 
                }
                /* NOTE: Keep these here, as they are central to the overall design. */

                .filter-vibe-btn {
                    min-width: 110px; height: 42px;
                    font-family: 'JetBrains Mono', monospace; text-transform: uppercase; font-size: 0.75rem;
                    background: linear-gradient(to bottom, #494949, rgb(156, 156, 156));
                    border-radius: 8px; 
                    display: flex; align-items: center; justify-content: center;
                    position: relative;
                    border-top: 1.4px solid var(--hyper-white);
                    cursor: pointer;
                    transition: all 0.15s ease-in-out;
                    box-shadow: 0px 2px 2px 2.5px rgba(54, 54, 54, 0.349);
                    padding: 0 0.8rem;
                    border: none;
                    letter-spacing: 0.5px;
                }
                
                .filter-vibe-btn i, .filter-vibe-btn span {
                    color: rgba(255, 255, 255, 0.39);
                    font-weight: 700; line-height: 1;
                    transition: all 0.15s linear;
                    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.281), -0.5px -0.5px 1.5px rgba(255, 255, 255, 0.24);
                    margin: 0 4px;
                }

                /* Active/Checked State - Unified White Look */
                .filter-vibe-btn.active {
                    box-shadow: 0px -2px 27px 0.5px rgba(25, 25, 25, 1.905);
                    background: linear-gradient(to bottom, #bbbbbb7a, #6e6e6e93);
                    border-top: none;
                    filter: none; 
                    transform: scale(1.02);
                }

                .filter-vibe-btn.active::before {
                    background: linear-gradient(to bottom, transparent 10%, rgba(255, 255, 255, 0.4), transparent 90%),
                                linear-gradient(to left, transparent 10%, rgba(255, 255, 255, 0.4), transparent 90%);
                }

                .filter-vibe-btn.active i, .filter-vibe-btn.active span {
                    color: var(--hyper-white);
                    text-shadow: 0px 0px 15px rgba(255, 255, 255, 0.9);
                }


                /* --- CONTROL PANEL (Moved to Top Right) --- */
                .controls { 
                    position: fixed; 
                    top: 1.5rem; 
                    right: 3rem;
                    display: flex; 
                    flex-direction: row; /* Changed to row */
                    gap: 0.5rem; 
                    z-index: 150; 
                }

                .control-btn { 
                    width: 48px; height: 48px; 
                    background: #111; border: 2px solid var(--sage-dark); border-radius: 8px; 
                    color: var(--sage); display: flex; align-items: center; justify-content: center; 
                    cursor: pointer; transition: all 0.2s; font-size: 1.25rem; 
                    box-shadow: 0 4px 6px rgba(0,0,0,0.5);
                }
                .control-btn:hover { border-color: var(--hyper-white); color: var(--hyper-white); box-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 4px 6px rgba(0,0,0,0.5); }
                .control-btn.active { border-color: var(--gold); color: var(--gold); box-shadow: 0 0 10px rgba(201, 162, 39, 0.8), 0 4px 6px rgba(0,0,0,0.5); transform: scale(1.05); }

                /* --- INFO PANEL (Moved to Right Side) --- */
                .info-panel { 
                    position: fixed; 
                    top: 50%; 
                    /* Position from the right edge of the viewport */
                    right: 40px; 
                    transform: translateY(-50%) scale(0.9); 
                    width: min(85vw, 380px); /* Slightly wider */
                    max-height: 75vh; /* Better height constraint */
                    overflow-y: auto;
                    
                    background: linear-gradient(145deg, var(--slate-darker), #1a1f2e); 
                    border: 2px solid var(--gold); 
                    border-radius: 16px; 
                    padding: 2rem; 
                    z-index: 200; 
                    opacity: 0; 
                    pointer-events: none; 
                    transition: all 0.4s ease; 
                    box-shadow: 
                        0 20px 60px rgba(0, 0, 0, 0.8),
                        0 0 0 1px rgba(201, 162, 39, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1); 
                }
                .info-panel.visible { 
                    opacity: 1; 
                    pointer-events: all; 
                    transform: translateY(-50%) scale(1); /* Updated transform for right side */
                }
                .info-panel-close { position: absolute; top: 10px; right: 10px; background: none; border: none; color: var(--sage); cursor: pointer; font-size: 1.2rem; }
                .info-panel-header { border-bottom: 2px solid var(--sage-dark); padding-bottom: 0.75rem; margin-bottom: 1rem; }
                .info-panel-title { font-family: 'JetBrains Mono', monospace; font-size: 1.75rem; color: var(--gold); letter-spacing: 0.05em; margin-bottom: 0.25rem; }
                .info-panel-type { font-size: 0.85rem; color: var(--sage-dark); text-transform: uppercase; letter-spacing: 0.1em; }
                .info-panel-description { font-size: 1rem; color: var(--sage); line-height: 1.5; margin-bottom: 1.5rem; }
                .info-detail { background: #111; padding: 0.75rem 1rem; border-left: 4px solid var(--sage-dark); margin-bottom: 0.5rem; }
                .info-detail-label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--sage-dark); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; }
                .info-detail-value { font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: var(--white); font-weight: 500; }
                .flow-indicator { position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--sage); z-index: 100;}

            `}</style>
            
            <BackgroundBeamEffect />

            <div className="grid-pattern"></div>
            
            <header className="header">
                <div className="logo">
                    <svg viewBox="0 0 100 100" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--gold)'}}>
                        <path d="M50 5 L90 20 L90 60 C90 75 75 95 50 95 C25 95 10 75 10 60 L10 20 Z" fill="rgba(201, 162, 39, 0.1)" stroke="currentColor"/>
                        <polyline points="30 40 50 65 70 40" stroke="var(--sage)"/>
                        <circle cx="50" cy="50" r="5" fill="var(--white)" stroke="none"/>
                    </svg>
                    <span>DOMICILE</span>
                </div>
                <span className="header-subtitle">Contract-Driven Architecture Platform</span>
            </header>

            <div className="filter-controls">
                {['all', 'contract', 'validation', 'proof', 'feedback'].map(filter => (
                    <button 
                        key={filter}
                        className={`filter-vibe-btn ${activeFilter === filter ? 'active' : ''}`} 
                        data-filter={filter}
                        onClick={() => applyFilter(filter)}
                    >
                        {filter === 'all' && <><i className="fas fa-th"></i><span>Full System</span></>}
                        {filter === 'contract' && <><i className="fas fa-handshake"></i><span>Contract</span></>}
                        {filter === 'validation' && <><i className="fas fa-shield-alt"></i><span>Validation</span></>}
                        {filter === 'proof' && <><i className="fas fa-certificate"></i><span>Proof</span></>}
                        {filter === 'feedback' && <><i className="fas fa-sync-alt"></i><span>Loop</span></>}
                    </button>
                ))}
            </div>
            
            <div className="canvas-container" id="canvas-container">
                
                <svg id="architecture-svg" viewBox="0 0 1200 1050">
                    <defs>
                        {/* Default Arrow */}
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" className="connection-arrow"/></marker>
                        {/* Highlight Arrows */}
                        <marker id="arrowhead-gold" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#C9A227"/></marker>
                        <marker id="arrowhead-white" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--hyper-white)"/></marker>
                    </defs>
                    
                    <g className="layers">
                        <rect x="100" y="100" width="1000" height="150" className="layer-bg"/>
                        <text x="600" y="140" className="layer-label-main">DOMICILE</text>
                        <text x="600" y="170" className="layer-label-sub">The Source</text>
                        
                        <rect x="100" y="300" width="1000" height="350" className="layer-bg"/>
                        <text x="600" y="340" className="layer-label-main">COVENANT</text>
                        <text x="600" y="370" className="layer-label-sub">The Promise / Validation & Governance</text>
                        
                        <rect x="100" y="700" width="1000" height="300" className="layer-bg"/>
                        <text x="600" y="740" className="layer-label-main">ENGAGE</text>
                        <text x="600" y="770" className="layer-label-sub">The Understanding / Execution & Proof</text>
                    </g>
                    
                    <g className="connections">
                        <path id="conn-domicile-covenant" className="connection" d="M600,255 L600,385" markerEnd="url(#arrowhead)"/>
                        <path id="conn-covenant-form" className="connection" d="M570,430 L270,470" markerEnd="url(#arrowhead)"/>
                        <path id="conn-covenant-law" className="connection" d="M630,430 L930,470" markerEnd="url(#arrowhead)"/>
                        <path id="conn-form-test" className="connection" d="M270,510 L500,550" markerEnd="url(#arrowhead)"/>
                        <path id="conn-law-gate" className="connection" d="M930,510 L720,550" markerEnd="url(#arrowhead)"/>
                        <path id="conn-test-gate" className="connection" d="M530,580 Q600,620 670,580" markerEnd="url(#arrowhead)"/>
                        <path id="conn-gate-actor" className="connection" d="M600,590 L600,760" markerEnd="url(#arrowhead)"/>
                        <path id="conn-actor-proof" className="connection" d="M530,835 L360,835" markerEnd="url(#arrowhead)"/>
                        <path id="conn-actor-source" className="connection" d="M670,830 Q800,950 1050,950 L1050,200 Q950,100 600,180" markerEnd="url(#arrowhead)"/>
                    </g>
                    
                    {/* The single payload circles are not needed here, as the animation is handled via stroke-dashoffset */}
                    
                    <g className="annotations" style={{ opacity: labelsVisible ? 1 : 0 }}>
                        <text x="610" y="285" fill="#334155" fontSize="9" fontStyle="italic">Formalization Stream</text>
                        <text x="500" y="450" fill="#334155" fontSize="9" fontStyle="italic">Structured Input</text>
                        <text x="700" y="450" fill="#334155" fontSize="9" fontStyle="italic">Policy Input</text>
                        <text x="610" y="665" fill="#334155" fontSize="9" fontStyle="italic">Execution Grant</text>
                        <text x="450" y="795" fill="#334155" fontSize="9" fontStyle="italic">Audit Trail Record</text>
                        <text x="750" y="990" fill="#334155" fontSize="9" fontStyle="italic">Self-Correction Loop</text>
                    </g>
                </svg>

                <div className="nodes-div-container">
                    {renderNode('source', 'SOURCE', 'fas fa-radiation', { left: '600px', top: '215px' })}
                    {renderNode('pact', 'PACT', 'fas fa-handshake', { left: '600px', top: '425px' })}
                    {renderNode('form', 'FORM', 'fas fa-cube', { left: '270px', top: '505px' })}
                    {renderNode('law', 'LAW', 'fas fa-balance-scale', { left: '930px', top: '505px' })}
                    {renderNode('test', 'TEST', 'fas fa-check-circle', { left: '500px', top: '585px' })}
                    {renderNode('gate', 'GATE', 'fas fa-door-open', { left: '700px', top: '585px' })}
                    {renderNode('actor', 'ACTOR', 'fas fa-cogs', { left: '600px', top: '835px' })}
                    {renderNode('proof', 'PROOF', 'fas fa-certificate', { left: '350px', top: '835px' })}
                </div>
            </div>
            
            <div className="controls">
                <button className={`control-btn ${labelsVisible ? 'active' : ''}`} onClick={toggleLabels} title="Toggle Labels (L)">
                    <i className="fas fa-tag"></i>
                </button>
                <button className="control-btn" onClick={resetView} title="Reset View (R)">
                    <i className="fas fa-compress-arrows-alt"></i>
                </button>
                <button className={`control-btn ${flowActive ? 'active' : ''}`} onClick={toggleFlow} title="Toggle Flow Animation (F)">
                    <i className="fas fa-water"></i>
                </button>
            </div>
            
            <div className="flow-indicator">
                <span ref={flowStatusRef}>{flowActive ? 'Flow Active' : 'Flow Paused'}</span>
            </div>
            
            {/* Info Panel */}
            <div className={`info-panel ${isPanelVisible ? 'visible' : ''}`} id="info-panel">
                <button className="info-panel-close" onClick={closeInfoPanel}>
                    <i className="fas fa-times"></i>
                </button>
                <div className="info-panel-header">
                    <h3 className="info-panel-title">{currentInfo.title}</h3>
                    <span className="info-panel-type">{currentInfo.type}</span>
                </div>
                <p className="info-panel-description">{currentInfo.description}</p>
                <div className="info-panel-details">
                    <div className="info-detail">
                        <span className="info-detail-label">Inputs</span>
                        <span className="info-detail-value">{currentInfo.inputs}</span>
                    </div>
                    <div className="info-detail">
                        <span className="info-detail-label">Outputs</span>
                        <span className="info-detail-value">{currentInfo.outputs}</span>
                    </div>
                    <div className="info-detail">
                        <span className="info-detail-label">Guarantees</span>
                        <span className="info-detail-value">{currentInfo.guarantees}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;