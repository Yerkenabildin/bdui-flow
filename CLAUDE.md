# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive educational visualizer for modern distributed system architecture (BigTech-style backend). Shows the complete request flow from mobile client through DNS, CDN, load balancers, API gateways, Kubernetes, microservices, caches, databases, and message queues.

## Build and Development Commands

```bash
npm install    # Install dependencies
npm run dev    # Start dev server (http://localhost:5173)
npm run build  # Production build
npm run preview # Preview production build
```

## Architecture

### Tech Stack
- **React 18** + **TypeScript** + **Vite**
- **React Flow** - graph visualization
- **Zustand** - state management
- **Tailwind CSS** - styling
- **Lucide React** - icons

### Project Structure
```
src/
├── components/
│   ├── flow/           # React Flow components
│   │   ├── nodes/      # Custom node types (Client, DNS, CDN, LB, DC, etc.)
│   │   └── edges/      # AnimatedEdge for request visualization
│   ├── controls/       # Playback, scenario selector, navigation
│   └── panels/         # Info panel, legend
├── data/
│   ├── architecture.ts # Node/edge definitions for each view level
│   └── scenarios/      # Animation step definitions
├── stores/             # Zustand stores (animation, navigation, scenario)
└── types/              # TypeScript interfaces
```

### View Levels
1. **Global** - Client → DNS → CDN → Global LB → Data Centers (EU, US, Asia)
2. **Datacenter** - Regional LB → API Gateway → Auth → Rate Limiter → K8s Cluster
3. **Cluster** - Ingress → Services → Pods → Sidecars → Cache/DB/Kafka

### Key Components
- `FlowCanvas` - main visualization canvas with React Flow
- `PlaybackControls` - play/pause/step animation controls
- `AnimatedEdge` - edge with flying particle animation
- Custom nodes in `src/components/flow/nodes/` - each infrastructure component type

### Adding New Scenarios
Edit `src/data/scenarios/index.ts`. Each scenario has:
- `steps[]` - array of animation steps with fromNode, toNode, type, description
- `initialViewLevel` - starting zoom level (global/datacenter/cluster)

### Adding New Node Types
1. Create component in `src/components/flow/nodes/`
2. Use `BaseNode` wrapper with icon and color
3. Register in `src/components/flow/nodes/index.ts` nodeTypes
