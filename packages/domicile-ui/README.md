# 🌙 Domicile UI - Tactical Architecture Visualization

Interactive visualization of the Domicile contract-driven AI architecture with animated flow sequences.

## 🎯 Features

- **Real-time Flow Animation**: Watch data flow through the DOMICILE → COVENANT → ENGAGE layers
- **Interactive Node Exploration**: Click nodes to see detailed architectural information
- **Three.js Background Effects**: Ambient particle effects for visual depth
- **Tactical UI Design**: Military-inspired interface with gold/sage color scheme
- **Responsive Design**: Adapts to different screen sizes

## 🏗️ Architecture Layers Visualized

### **DOMICILE Layer** - The Source
- **SOURCE**: The Monad where thought converts to matter

### **COVENANT Layer** - The Promise 
- **PACT**: Core agreement refined into structure and rules
- **FORM**: Data structure validation and type safety
- **LAW**: Policy governance and regulatory compliance  
- **TEST**: Automated validation against schemas
- **GATE**: Final governance checkpoint

### **ENGAGE Layer** - The Understanding
- **ACTOR**: Execution engine that performs validated work
- **PROOF**: Cryptographic audit trail and hash chain

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm

### Installation & Development

```bash
# From the root of contract-ai-platform
pnpm domicile:ui

# Or directly in this package
cd packages/domicile-ui
pnpm dev
```

The app will open at `http://localhost:3000`

### Keyboard Shortcuts

- **F** - Toggle flow animation
- **L** - Toggle label visibility  
- **R** - Reset view
- **ESC** - Close info panels

## 🎨 Design Philosophy

This visualization embodies the **ArbiterOS governance-first paradigm**:

- **Visual Contracts**: Each connection represents a formal contract boundary
- **Governed Flow**: The animated beam respects architectural constraints
- **Audit Transparency**: Every step in the flow is traceable and recorded
- **Constitutional Limits**: UI respects the formal policy boundaries

## 🔧 Technical Details

- **React 18** with TypeScript
- **Vite** for development and building
- **Three.js** for background effects (loaded via CDN)
- **Font Awesome** for tactical iconography
- **Custom CSS** for military-grade aesthetics

## 📁 Project Structure

```
packages/domicile-ui/
├── src/
│   ├── App.tsx          # Main visualization component
│   └── main.tsx         # React entry point
├── index.html           # HTML template with CDN imports
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## 🌟 Integration with Domicile

This visualization is part of the larger **Domicile platform** implementing **ArbiterOS** principles:

- **Memory Management**: Visualizes where Circadian operates (Layer 4)
- **Contract Flow**: Shows how ACF instructions flow through governance
- **Audit Trail**: Demonstrates the hash chain from SOURCE to PROOF
- **Policy Enforcement**: Illustrates governance checkpoints (TEST/GATE)

## 🎭 Visual Design Language

- **Gold (#C9A227)**: Active states, primary actions
- **Sage (#909F96)**: Inactive states, secondary text  
- **Hyper White (#e0e0e0)**: Flow illumination, attention
- **Tactical Black**: Base background for tactical aesthetics

## 🔮 Future Enhancements

- Real-time system metrics integration
- Interactive policy editor
- 3D node depth and layering
- Historical flow playback
- Multi-environment comparison