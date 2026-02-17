import { NodeTypes } from 'reactflow'
import { ClientNode } from './ClientNode'
import { L3BalancerNode } from './L3BalancerNode'
import { L7BalancerNode } from './L7BalancerNode'
import { ApiGatewayNode } from './ApiGatewayNode'
import { ProxyNode } from './ProxyNode'
import { ServiceNode } from './ServiceNode'
import { RendererNode } from './RendererNode'

export const nodeTypes: NodeTypes = {
  client: ClientNode,
  l3Balancer: L3BalancerNode,
  l7Balancer: L7BalancerNode,
  apiGateway: ApiGatewayNode,
  proxy: ProxyNode,
  service: ServiceNode,
  renderer: RendererNode,
}
