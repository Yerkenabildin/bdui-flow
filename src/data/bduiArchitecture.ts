import { MarkerType } from 'reactflow'
import { BduiNode, BduiEdge } from '../types'

// Layout: left-to-right main flow, services above proxy, renderer path inline
//
//                              Svc A  Svc B  Svc C  Svc D    (сверху)
//                                 \    |     |    /
// Client → L3 → L7 → API GW → L3 → L7 → Proxy → L3 → L7 → Renderer  (в линию)
//                                              ↑
//                                     (после ответов сервисов)

const COL = {
  client: 0,
  l3_1: 230,
  l7_1: 460,
  gw: 690,
  l3_2: 920,
  l7_2: 1150,
  proxy: 1380,
  rendL3: 1850,
  rendL7: 2080,
  renderer: 2310,
}

const CENTER_Y = 350
const SVC_Y = 80  // сервисы сверху

const defaultMarker = {
  type: MarkerType.ArrowClosed,
  color: '#64748b',
  width: 16,
  height: 16,
}

export const nodes: BduiNode[] = [
  // --- Main flow (горизонтальная линия) ---
  {
    id: 'client',
    type: 'client',
    position: { x: COL.client, y: CENTER_Y },
    data: {
      label: 'Mobile App',
      description: 'Мобильное приложение пользователя (iOS/Android)',
      technology: 'iOS / Android',
    },
  },
  {
    id: 'l3-1',
    type: 'l3Balancer',
    position: { x: COL.l3_1, y: CENTER_Y },
    data: {
      label: 'L3 Balancer',
      description: 'Балансировка на транспортном уровне. Распределяет TCP/UDP пакеты по L7-балансировщикам.',
      technology: 'TCP/UDP',
    },
  },
  {
    id: 'l7-1',
    type: 'l7Balancer',
    position: { x: COL.l7_1, y: CENTER_Y },
    data: {
      label: 'L7 Balancer',
      description: 'Балансировка на уровне HTTP. Маршрутизация по заголовкам, путям, весам.',
      technology: 'HTTP / AWACS',
    },
  },
  {
    id: 'gw',
    type: 'apiGateway',
    position: { x: COL.gw, y: CENTER_Y },
    data: {
      label: 'API Gateway',
      description: 'Аутентификация, rate limiting, маршрутизация к бэкенд-сервисам.',
      technology: 'Kong / Custom',
      links: [
        { label: 'Мониторинг API Gateway', url: 'https://nda.ya.ru/t/LGaaDerR7UdfFV' },
        { label: 'Тайминги пути после GW', url: 'https://nda.ya.ru/t/v86B_zRB7UdgmB' },
      ],
    },
  },
  {
    id: 'l3-2',
    type: 'l3Balancer',
    position: { x: COL.l3_2, y: CENTER_Y },
    data: {
      label: 'L3 Balancer',
      description: 'Внутренний L3 балансировщик между Gateway и бэкендом.',
      technology: 'TCP/UDP',
    },
  },
  {
    id: 'l7-2',
    type: 'l7Balancer',
    position: { x: COL.l7_2, y: CENTER_Y },
    data: {
      label: 'L7 Balancer',
      description: 'Балансировка перед superapp-bdui-proxy.',
      technology: 'HTTP / AWACS',
      links: [
        { label: 'L7 перед proxy', url: 'https://nda.ya.ru/t/0aBjaNQe7UdhgS' },
      ],
    },
  },
  {
    id: 'proxy',
    type: 'proxy',
    position: { x: COL.proxy, y: CENTER_Y },
    data: {
      label: 'superapp-bdui-proxy',
      description: 'Проксирует запросы к сервисам, агрегирует ответы, затем отправляет в рендерер. Ждёт все ответы перед отправкой.',
      technology: 'C++',
      links: [
        { label: 'Мониторинг proxy', url: 'https://nda.ya.ru/t/v9i5Uo6_7UdfPT' },
        { label: 'Запросы в сервисы из proxy', url: 'https://nda.ya.ru/t/aF5RZQVf7Udfjf' },
      ],
    },
  },

  // --- Путь к рендереру (продолжение горизонтальной линии) ---
  {
    id: 'l3-rend',
    type: 'l3Balancer',
    position: { x: COL.rendL3, y: CENTER_Y },
    data: {
      label: 'L3 Balancer',
      description: 'L3 балансировка перед рендерером go-superapp-bdui.',
      technology: 'TCP/UDP',
    },
  },
  {
    id: 'l7-rend',
    type: 'l7Balancer',
    position: { x: COL.rendL7, y: CENTER_Y },
    data: {
      label: 'L7 Balancer',
      description: 'L7 балансировка перед рендерером.',
      technology: 'HTTP / AWACS',
    },
  },
  {
    id: 'renderer',
    type: 'renderer',
    position: { x: COL.renderer, y: CENTER_Y },
    data: {
      label: 'go-superapp-bdui',
      description: 'Рендерер BDUI. Получает агрегированные данные от proxy и формирует итоговый UI-ответ.',
      technology: 'Kotlin',
      links: [
        { label: 'Мониторинг superapp-bdui', url: 'https://nda.ya.ru/t/5FoaZb9f7UdfaA' },
      ],
    },
  },

  // --- Services (сверху, fan-out от proxy) ---
  {
    id: 'svc-a',
    type: 'service',
    position: { x: COL.proxy - 200, y: SVC_Y },
    data: {
      label: 'Service A',
      description: 'Бэкенд-сервис, предоставляющий данные для BDUI-компонентов.',
      technology: 'gRPC',
    },
  },
  {
    id: 'svc-b',
    type: 'service',
    position: { x: COL.proxy, y: SVC_Y },
    data: {
      label: 'Service B',
      description: 'Бэкенд-сервис, предоставляющий данные для BDUI-компонентов.',
      technology: 'gRPC',
    },
  },
  {
    id: 'svc-c',
    type: 'service',
    position: { x: COL.proxy + 200, y: SVC_Y },
    data: {
      label: 'Service C',
      description: 'Бэкенд-сервис, предоставляющий данные для BDUI-компонентов.',
      technology: 'gRPC',
    },
  },
  {
    id: 'svc-d',
    type: 'service',
    position: { x: COL.proxy + 400, y: SVC_Y },
    data: {
      label: 'Service D',
      description: 'Бэкенд-сервис, предоставляющий данные для BDUI-компонентов.',
      technology: 'gRPC',
    },
  },
]

const edgeStyle = { stroke: '#64748b', strokeWidth: 2 }
const dashedStyle = { stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '6,4' }
const orangeStyle = { stroke: '#f97316', strokeWidth: 2.5 }
const orangeMarker = { type: MarkerType.ArrowClosed as const, color: '#f97316', width: 16, height: 16 }

export const edges: BduiEdge[] = [
  // === ПРЯМОЙ ПУТЬ (request, горизонтальная линия) ===
  { id: 'e-client-l3-1', source: 'client', target: 'l3-1', style: edgeStyle, markerEnd: defaultMarker },
  { id: 'e-l3-1-l7-1', source: 'l3-1', target: 'l7-1', style: edgeStyle, markerEnd: defaultMarker },
  { id: 'e-l7-1-gw', source: 'l7-1', target: 'gw', style: edgeStyle, markerEnd: defaultMarker },
  { id: 'e-gw-l3-2', source: 'gw', target: 'l3-2', style: edgeStyle, markerEnd: defaultMarker },
  { id: 'e-l3-2-l7-2', source: 'l3-2', target: 'l7-2', style: edgeStyle, markerEnd: defaultMarker },
  { id: 'e-l7-2-proxy', source: 'l7-2', target: 'proxy', style: edgeStyle, markerEnd: defaultMarker },

  // === FAN-OUT: Proxy → Services (параллельные запросы, вверх) ===
  {
    id: 'e-proxy-svc-a', source: 'proxy', target: 'svc-a',
    sourceHandle: 'top', targetHandle: 'bottom',
    style: edgeStyle, markerEnd: defaultMarker,
    label: 'parallel', labelStyle: { fontSize: 10, fill: '#6366F1' },
  },
  {
    id: 'e-proxy-svc-b', source: 'proxy', target: 'svc-b',
    sourceHandle: 'top', targetHandle: 'bottom',
    style: edgeStyle, markerEnd: defaultMarker,
  },
  {
    id: 'e-proxy-svc-c', source: 'proxy', target: 'svc-c',
    sourceHandle: 'top', targetHandle: 'bottom',
    style: edgeStyle, markerEnd: defaultMarker,
  },
  {
    id: 'e-proxy-svc-d', source: 'proxy', target: 'svc-d',
    sourceHandle: 'top', targetHandle: 'bottom',
    style: edgeStyle, markerEnd: defaultMarker,
  },

  // === Services → Proxy (response, пунктир, вниз) ===
  {
    id: 'e-resp-svc-a', source: 'svc-a', target: 'proxy',
    sourceHandle: 'bottom', targetHandle: 'top',
    style: dashedStyle, markerEnd: { ...defaultMarker, color: '#94a3b8' },
  },
  {
    id: 'e-resp-svc-b', source: 'svc-b', target: 'proxy',
    sourceHandle: 'bottom', targetHandle: 'top',
    style: dashedStyle, markerEnd: { ...defaultMarker, color: '#94a3b8' },
  },
  {
    id: 'e-resp-svc-c', source: 'svc-c', target: 'proxy',
    sourceHandle: 'bottom', targetHandle: 'top',
    style: dashedStyle, markerEnd: { ...defaultMarker, color: '#94a3b8' },
  },
  {
    id: 'e-resp-svc-d', source: 'svc-d', target: 'proxy',
    sourceHandle: 'bottom', targetHandle: 'top',
    style: dashedStyle, markerEnd: { ...defaultMarker, color: '#94a3b8' },
  },

  // === SEQUENTIAL: Proxy → Renderer (после ожидания, оранжевый, в линию) ===
  {
    id: 'e-proxy-l3-rend', source: 'proxy', target: 'l3-rend',
    style: orangeStyle, markerEnd: orangeMarker,
    label: 'после ответов сервисов',
    labelStyle: { fontSize: 10, fill: '#f97316', fontWeight: 600 },
  },
  { id: 'e-l3-rend-l7-rend', source: 'l3-rend', target: 'l7-rend', style: orangeStyle, markerEnd: orangeMarker },
  { id: 'e-l7-rend-renderer', source: 'l7-rend', target: 'renderer', style: orangeStyle, markerEnd: orangeMarker },
]
