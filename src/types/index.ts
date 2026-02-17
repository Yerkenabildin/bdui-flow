import { Node, Edge } from 'reactflow'

export type BduiNodeType =
  | 'client'
  | 'l3Balancer'
  | 'l7Balancer'
  | 'apiGateway'
  | 'proxy'
  | 'service'
  | 'renderer'

export interface MonitoringLink {
  label: string
  url: string
}

export interface BduiNodeData {
  label: string
  description: string
  technology?: string
  links?: MonitoringLink[]
}

export type BduiNode = Node<BduiNodeData>
export type BduiEdge = Edge

export interface NodeDescription {
  title: string
  purpose: string
  keyFeatures: string[]
  technologies: string[]
}
