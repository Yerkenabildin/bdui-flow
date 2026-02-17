import { BduiNodeType, NodeDescription } from '../types'

export const nodeDescriptions: Record<BduiNodeType, NodeDescription> = {
  client: {
    title: 'Mobile App',
    purpose: 'Мобильное приложение пользователя. Отправляет запрос на получение BDUI-экрана.',
    keyFeatures: [
      'Отправка HTTP-запроса к бэкенду',
      'Рендеринг BDUI-ответа в нативный UI',
      'Кэширование предыдущих ответов',
    ],
    technologies: ['iOS (Swift)', 'Android (Kotlin)'],
  },
  l3Balancer: {
    title: 'L3 Balancer',
    purpose: 'Балансировка на транспортном уровне (TCP/UDP). Распределяет пакеты по серверам на основе IP-адресов.',
    keyFeatures: [
      'Работает на уровне TCP/UDP (Layer 3-4)',
      'ECMP — равномерное распределение по маршрутам',
      'Не инспектирует содержимое пакетов',
      'Очень высокая пропускная способность',
    ],
    technologies: ['ECMP', 'IPVS', 'Maglev'],
  },
  l7Balancer: {
    title: 'L7 Balancer',
    purpose: 'Балансировка на уровне HTTP. Маршрутизирует запросы на основе заголовков, URL, cookies.',
    keyFeatures: [
      'Маршрутизация по HTTP-заголовкам и путям',
      'TLS termination',
      'Health checks бэкендов',
      'Retry и circuit breaking',
    ],
    technologies: ['AWACS'],
  },
  apiGateway: {
    title: 'API Gateway',
    purpose: 'Единая точка входа для API. Аутентификация, авторизация, rate limiting, маршрутизация к внутренним сервисам.',
    keyFeatures: [
      'Аутентификация и авторизация',
      'Rate limiting и throttling',
      'Request/response трансформация',
      'API версионирование',
    ],
    technologies: ['Kong', 'Custom Gateway'],
  },
  proxy: {
    title: 'superapp-bdui-proxy',
    purpose: 'Прокси-сервис BDUI. Параллельно запрашивает данные у бэкенд-сервисов, агрегирует ответы, затем отправляет в рендерер go-superapp-bdui.',
    keyFeatures: [
      'Fan-out: параллельные запросы к сервисам',
      'Агрегация ответов от всех сервисов',
      'Ожидание всех ответов перед отправкой в рендерер',
      'Таймауты и fallback-логика',
    ],
    technologies: ['C++'],
  },
  service: {
    title: 'Backend Service',
    purpose: 'Бэкенд-сервис, предоставляющий данные для формирования BDUI-компонентов. Каждый сервис отвечает за свою доменную область.',
    keyFeatures: [
      'Доменная логика',
      'Формирование данных для BDUI-виджетов',
      'Nginx на поде как reverse proxy',
      'Независимый деплой и масштабирование',
    ],
    technologies: ['gRPC', 'Nginx (reverse proxy на поде)'],
  },
  renderer: {
    title: 'go-superapp-bdui',
    purpose: 'Рендерер BDUI. Получает агрегированные данные от proxy и формирует финальный BDUI-ответ (layout + данные) для мобильного приложения. Использует библиотеку Tovarisch и верстку на DivKit DSL.',
    keyFeatures: [
      'Сборка BDUI-layout из данных сервисов',
      'Верстка на DivKit DSL',
      'Библиотека Tovarisch для компонентов',
      'Оптимизация ответа для мобильных клиентов',
    ],
    technologies: ['Kotlin', 'Tovarisch', 'DivKit DSL'],
  },
}
