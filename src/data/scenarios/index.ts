import { Scenario } from '../../types'

export const scenarios: Scenario[] = [
  {
    id: 'create-order',
    name: 'Создание заказа (полный путь + SAGA)',
    description: 'Запрос в EU DC: авторизация, SAGA через Kafka, репликация в другие ДЦ',
    initialViewLevel: 'global',
    steps: [
      // ========== ПУТЬ ЗАПРОСА ОТ КЛИЕНТА ==========
      {
        id: 'step-1',
        fromNode: 'client',
        toNode: 'dns',
        type: 'request',
        title: 'DNS Lookup',
        description: 'Резолвинг доменного имени в IP адрес',
        detailedInfo: `ЗАЧЕМ: Браузер/приложение не знает IP адрес сервера, только домен api.store.com.

ЧТО ПРОИСХОДИТ:
1. Приложение отправляет DNS запрос
2. DNS сервер (Route 53) проверяет геолокацию клиента по IP
3. Возвращает IP ближайшего edge-сервера (CDN)

ПАТТЕРН: Service Discovery — автоматическое определение адреса сервиса.
Geo-DNS позволяет направлять пользователей в ближайший ДЦ.`,
        duration: 600,
        realLatency: 25,
        payload: { query: 'api.store.com', type: 'A', clientIP: '203.0.113.50' },
      },
      {
        id: 'step-2',
        fromNode: 'dns',
        toNode: 'cdn',
        type: 'response',
        title: 'DNS Response → CDN IP',
        description: 'Получен IP ближайшего CDN edge-сервера',
        detailedInfo: `ЗАЧЕМ: Направить трафик на ближайшую к пользователю точку присутствия.

ЧТО ПРОИСХОДИТ:
1. DNS возвращает Anycast IP (один IP, но много серверов)
2. Сеть автоматически маршрутизирует на ближайший сервер
3. TTL=300 сек — клиент будет кэшировать ответ 5 минут

ПАТТЕРН: Anycast — один IP адрес анонсируется из множества локаций.
Снижает latency на 50-200ms за счёт географической близости.`,
        duration: 400,
        realLatency: 5,
        payload: { ip: '104.16.123.96', ttl: 300, location: 'Frankfurt Edge' },
      },
      {
        id: 'step-3',
        fromNode: 'cdn',
        toNode: 'global-lb',
        type: 'request',
        title: 'CDN → Global Load Balancer',
        description: 'CDN проверяет кэш и проксирует на origin',
        detailedInfo: `ЗАЧЕМ: CDN кэширует статику и защищает origin от DDoS.

ЧТО ПРОИСХОДИТ:
1. CDN проверяет кэш — для POST запросов всегда cache miss
2. TLS termination на edge (экономит латентность)
3. Добавляет заголовки: CF-Ray (трейсинг), CF-IPCountry (геолокация)
4. Проксирует запрос на Global Load Balancer

ПАТТЕРН: Edge Computing — обработка ближе к пользователю.
WAF (Web Application Firewall) фильтрует вредоносные запросы.`,
        duration: 500,
        realLatency: 8,
        payload: { method: 'POST', path: '/api/v1/orders', headers: { 'CF-Ray': '8a1b2c3d', 'CF-IPCountry': 'DE' } },
      },
      {
        id: 'step-4',
        fromNode: 'global-lb',
        toNode: 'dc-eu',
        type: 'request',
        title: 'Выбор Data Center',
        description: 'Global LB выбирает оптимальный датацентр',
        detailedInfo: `ЗАЧЕМ: Распределить нагрузку между ДЦ и обеспечить отказоустойчивость.

ЧТО ПРОИСХОДИТ:
1. GLB проверяет health check всех ДЦ (каждые 10 сек)
2. Анализирует метрики: latency, load, capacity
3. Учитывает геолокацию клиента (из CF-IPCountry)
4. Выбирает EU DC как ближайший и здоровый

ПАТТЕРН: Global Load Balancing — распределение между регионами.
Active-Active — все ДЦ обслуживают трафик (vs Active-Passive).`,
        duration: 300,
        realLatency: 2,
        payload: { selectedDC: 'eu-central-1', reason: 'lowest_latency', latency: '12ms', health: 'healthy' },
      },
      {
        id: 'step-5',
        fromNode: 'dc-eu',
        toNode: 'dc-eu-lb',
        type: 'request',
        title: 'Вход в Data Center',
        description: 'Запрос попадает на региональный балансировщик',
        detailedInfo: `ЗАЧЕМ: Распределить нагрузку внутри ДЦ между инстансами.

ЧТО ПРОИСХОДИТ:
1. Трафик проходит через Border Router
2. Firewall проверяет IP whitelist и базовые правила
3. Regional LB принимает TCP соединение

ПАТТЕРН: Perimeter Security — защита на границе сети.
DMZ (Demilitarized Zone) — буферная зона между интернетом и внутренней сетью.`,
        duration: 100,
        realLatency: 1,
      },
      {
        id: 'step-6',
        fromNode: 'dc-eu-lb',
        toNode: 'dc-eu-gw',
        type: 'request',
        title: 'Regional LB → API Gateway',
        description: 'Балансировка на один из инстансов API Gateway',
        detailedInfo: `ЗАЧЕМ: Равномерно распределить нагрузку между API Gateway инстансами.

ЧТО ПРОИСХОДИТ:
1. HAProxy применяет алгоритм Least Connections
2. Выбирает инстанс с минимальным числом активных соединений
3. Поддерживает connection pooling для эффективности
4. Health check отключает нездоровые инстансы

ПАТТЕРН: L7 Load Balancing — балансировка на уровне HTTP.
Sticky Sessions не используются — stateless архитектура.`,
        duration: 150,
        realLatency: 2,
        payload: { algorithm: 'least_connections', targetInstance: 'api-gw-03', activeConnections: 127 },
      },

      // ========== АВТОРИЗАЦИЯ ==========
      {
        id: 'step-7',
        fromNode: 'dc-eu-gw',
        toNode: 'dc-eu-auth',
        type: 'request',
        title: 'JWT Token Validation (локальная + online)',
        description: 'API Gateway валидирует токен локально + проверяет blacklist',
        detailedInfo: `ЗАЧЕМ: Убедиться что запрос от авторизованного пользователя.

ЧТО ПРОИСХОДИТ:
1. API Gateway извлекает Bearer token из Authorization header
2. ЛОКАЛЬНАЯ проверка (без сети, ~1ms):
   - Подпись RS256 проверяется публичным ключом (cached)
   - Expiration (exp) — не истёк ли токен
   - Issuer (iss), Audience (aud) — валидность claims
3. Если подпись OK → проверяем blacklist в Auth Service

ПАТТЕРН: Token-based Authentication — stateless аутентификация.
В BigTech 99% запросов валидируются локально без похода в Auth Service.
Поход в Auth нужен только для blacklist check (logout/revoke).`,
        duration: 50,
        realLatency: 1,
        payload: { token: 'eyJhbGciOiJSUzI1NiIs...', localChecks: ['signature', 'expiration', 'issuer'], publicKeyId: 'key-2024-01' },
      },
      {
        id: 'step-8',
        fromNode: 'dc-eu-auth',
        toNode: 'dc-eu-session',
        type: 'request',
        title: 'Token Blacklist Check (Redis)',
        description: 'Проверка что токен не был отозван (logout/security)',
        detailedInfo: `ЗАЧЕМ: JWT нельзя инвалидировать без blacklist (токен валиден до exp).

ЧТО ПРОИСХОДИТ:
1. SISMEMBER blacklist:tokens <jti> — проверка в Set (~0.1ms)
2. Если токен в blacklist → 401 Unauthorized
3. Опционально: проверка device fingerprint
4. Bloom Filter может использоваться для оптимизации

ПАТТЕРН: Token Blacklisting — единственный способ отзыва JWT.
Redis Set с TTL = max token lifetime (обычно 24h).
BigTech: ~99.9% токенов НЕ в blacklist → быстрый happy path.`,
        duration: 30,
        realLatency: 0.5,
        payload: { operation: 'SISMEMBER', key: 'blacklist:tokens', jti: 'abc123-xyz789', ttl: 86400 },
      },
      {
        id: 'step-9',
        fromNode: 'dc-eu-session',
        toNode: 'dc-eu-auth',
        type: 'response',
        title: 'Token NOT in Blacklist',
        description: 'Redis: токен не отозван, всё OK',
        detailedInfo: `ЗАЧЕМ: Подтвердить что токен не был отозван.

ЧТО ПРОИСХОДИТ:
1. SISMEMBER вернул 0 → токен НЕ в blacklist
2. Это значит пользователь не делал logout
3. Токен валиден — можно продолжать

РЕЗУЛЬТАТ: Аутентификация завершена за ~80ms.
User context из JWT claims (не из Redis!) — stateless.`,
        duration: 20,
        realLatency: 0.1,
        payload: { inBlacklist: false, responseTime: '0.1ms' },
      },
      {
        id: 'step-10',
        fromNode: 'dc-eu-auth',
        toNode: 'dc-eu-gw',
        type: 'response',
        title: 'Auth OK + JWT Claims Extracted',
        description: 'User context извлечён из JWT claims (stateless)',
        detailedInfo: `ЗАЧЕМ: Передать информацию о пользователе downstream сервисам.

ЧТО ПРОИСХОДИТ:
1. User context извлекается из JWT claims (НЕ из БД!)
2. Claims содержат: sub (userId), roles, permissions, tenant
3. API Gateway добавляет в headers: X-User-Id, X-Roles, X-Permissions
4. Downstream сервисы доверяют этим headers (внутри mesh)

ПАТТЕРН: Claims-based Identity — все данные в токене.
Zero Trust: внутри mesh сервисы проверяют mTLS + headers.
Stateless: Auth Service НЕ хранит сессии — всё в JWT.`,
        duration: 30,
        realLatency: 1,
        payload: { source: 'jwt_claims', userId: 'user_123', permissions: ['orders:create', 'orders:read'], tenant: 'default' },
      },

      // ========== RATE LIMITING ==========
      {
        id: 'step-10b',
        fromNode: 'dc-eu-gw',
        toNode: 'dc-eu-ratelimit',
        type: 'request',
        title: 'Rate Limit Check',
        description: 'API Gateway проверяет лимиты запросов',
        detailedInfo: `ЗАЧЕМ: Защита от перегрузки и DDoS, fair usage между пользователями.

ЧТО ПРОИСХОДИТ:
1. Rate Limiter получает запрос с X-User-Id
2. Проверяет Redis: текущий счётчик для user_123
3. Применяет Token Bucket алгоритм
4. Лимиты: 100 req/min для обычных пользователей, 1000 для premium

ПАТТЕРН: Distributed Rate Limiting — единый счётчик для всех инстансов.
Token Bucket — плавное ограничение с возможностью burst.`,
        duration: 50,
        realLatency: 1,
        payload: { userId: 'user_123', endpoint: '/api/v1/orders', currentRate: 45, limit: 100 },
      },
      {
        id: 'step-10c',
        fromNode: 'dc-eu-ratelimit',
        toNode: 'dc-eu-cache',
        type: 'request',
        title: 'Rate Limiter → Redis',
        description: 'Проверка и инкремент счётчика в Redis',
        detailedInfo: `ЗАЧЕМ: Централизованное хранение счётчиков для всех API Gateway инстансов.

ЧТО ПРОИСХОДИТ:
1. INCR rate:user_123:orders (атомарный инкремент)
2. EXPIRE устанавливает TTL=60 сек (sliding window)
3. Если счётчик > limit → возврат 429 Too Many Requests
4. Если OK → запрос проходит дальше

ПАТТЕРН: Sliding Window Rate Limiting в Redis.
Lua script для атомарности INCR + EXPIRE.`,
        duration: 30,
        realLatency: 0.5,
        payload: { key: 'rate:user_123:orders:1705315800', operation: 'INCR', ttl: 60 },
      },
      {
        id: 'step-10d',
        fromNode: 'dc-eu-cache',
        toNode: 'dc-eu-ratelimit',
        type: 'response',
        title: 'Rate Limit OK',
        description: 'Redis подтверждает что лимит не превышен',
        detailedInfo: `ЗАЧЕМ: Разрешить или заблокировать запрос.

ЧТО ПРОИСХОДИТ:
1. Redis вернул текущее значение счётчика: 46
2. 46 < 100 (лимит) → запрос разрешён
3. Добавляются headers: X-RateLimit-Remaining: 54
4. Если бы превысили → HTTP 429 + Retry-After header

РЕЗУЛЬТАТ: Запрос прошёл rate limiting, quota обновлена.`,
        duration: 20,
        realLatency: 0.1,
        payload: { allowed: true, current: 46, limit: 100, remaining: 54, resetAt: '2024-01-15T10:31:00Z' },
      },
      {
        id: 'step-10e',
        fromNode: 'dc-eu-ratelimit',
        toNode: 'dc-eu-gw',
        type: 'response',
        title: 'Rate Limit Passed',
        description: 'Rate Limiter разрешает запрос',
        detailedInfo: `ЗАЧЕМ: API Gateway должен знать результат проверки.

ЧТО ПРОИСХОДИТ:
1. Rate Limiter возвращает OK
2. API Gateway добавляет rate limit headers в response
3. Клиент видит сколько запросов осталось
4. Запрос продолжает путь в Kubernetes

ПАТТЕРН: API Gateway как Policy Enforcement Point.
Rate limit headers для клиентского backoff.`,
        duration: 20,
        realLatency: 0.5,
        payload: { status: 'allowed', headers: { 'X-RateLimit-Limit': 100, 'X-RateLimit-Remaining': 54 } },
      },

      // ========== K8S ROUTING ==========
      {
        id: 'step-11',
        fromNode: 'dc-eu-gw',
        toNode: 'dc-eu-ingress',
        type: 'request',
        title: 'Route to Kubernetes',
        description: 'API Gateway маршрутизирует в K8s кластер',
        detailedInfo: `ЗАЧЕМ: API Gateway — точка входа, K8s — среда выполнения сервисов.

ЧТО ПРОИСХОДИТ:
1. API Gateway определяет target service по path (/api/v1/orders → Order Service)
2. Добавляет headers: X-User-Id, X-Request-Id, X-Trace-Id
3. Rate limiting уже пройден ✓
4. Проксирует в K8s Ingress Controller

ПАТТЕРН: API Gateway Pattern — единая точка входа.
Request Enrichment — добавление метаданных к запросу.`,
        duration: 150,
        realLatency: 2,
        payload: { targetService: 'order-service', headers: { 'X-User-Id': 'user_123', 'X-Trace-Id': 'trace_abc123' } },
      },
      {
        id: 'step-12',
        fromNode: 'dc-eu-ingress',
        toNode: 'dc-eu-order-svc',
        type: 'request',
        title: 'K8s Ingress → Order Service',
        description: 'NGINX Ingress роутит на Service по правилам',
        detailedInfo: `ЗАЧЕМ: Ingress — L7 роутер внутри Kubernetes.

ЧТО ПРОИСХОДИТ:
1. NGINX Ingress сопоставляет path с Ingress Rule
2. Правило: /api/v1/orders/* → order-service:8080
3. Добавляет K8s-специфичные headers
4. Направляет на ClusterIP Service

ПАТТЕРН: Ingress Controller — внешний доступ к сервисам K8s.
Path-based routing — разные paths → разные сервисы.`,
        duration: 100,
        realLatency: 1,
        payload: { ingressRule: 'orders-ingress', path: '/api/v1/orders', targetPort: 8080 },
      },
      {
        id: 'step-13',
        fromNode: 'dc-eu-order-svc',
        toNode: 'dc-eu-order-pod',
        type: 'request',
        title: 'K8s Service → Pod',
        description: 'Service выбирает здоровый Pod',
        detailedInfo: `ЗАЧЕМ: Service — абстракция над множеством Pod реплик.

ЧТО ПРОИСХОДИТ:
1. K8s Service (ClusterIP) получает запрос
2. kube-proxy выбирает Pod по алгоритму (round-robin по умолчанию)
3. Проверяет readiness probe — Pod должен быть Ready
4. Направляет на выбранный Pod

ПАТТЕРН: Service Discovery внутри K8s.
Pods эфемерны — Service обеспечивает стабильный endpoint.`,
        duration: 50,
        realLatency: 0.5,
        payload: { selectedPod: 'order-pod-7b4f9-x2k4n', replicas: 3, readyReplicas: 3 },
      },

      // ========== ORDER SERVICE LOGIC ==========
      {
        id: 'step-14',
        fromNode: 'dc-eu-order-pod',
        toNode: 'dc-eu-order-db',
        type: 'request',
        title: 'Order Pod → Order DB (через Envoy)',
        description: 'Запись заказа в изолированную БД сервиса',
        detailedInfo: `ЗАЧЕМ: Database per Service — каждый микросервис имеет свою БД.

ЧТО ПРОИСХОДИТ:
1. Order Pod содержит 2 контейнера: App + Envoy Sidecar
2. App делает запрос к БД, Envoy sidecar перехватывает трафик
3. Envoy применяет mTLS, connection pooling, circuit breaker
4. Запрос идёт в Order DB (изолирована от других сервисов)

ПАТТЕРН: Database per Service — никаких shared databases.
Envoy Sidecar внутри Pod обеспечивает Zero Trust Security.
Istiod (control plane) управляет конфигурацией всех sidecar.`,
        duration: 100,
        realLatency: 2,
        payload: { mtls: true, database: 'order_db', connectionPool: { maxConnections: 100 } },
      },
      {
        id: 'step-14b',
        fromNode: 'dc-eu-order-pod',
        toNode: 'dc-eu-order-db',
        type: 'request',
        title: 'Create Order (PENDING)',
        description: 'Сохранение заказа в БД со статусом PENDING',
        detailedInfo: `ЗАЧЕМ: Зафиксировать намерение создать заказ до начала SAGA.

ЧТО ПРОИСХОДИТ:
1. Валидация входных данных (items, quantities, prices)
2. Расчёт total amount
3. INSERT в orders таблицу со статусом PENDING
4. Генерация orderId (UUID v4)

ПАТТЕРН: SAGA Pattern начинается — это первый шаг.
Статус PENDING — заказ создан, но не подтверждён.
При ошибке на следующих шагах — компенсирующая транзакция.`,
        duration: 200,
        realLatency: 25,
        payload: { orderId: 'order_789', status: 'PENDING', items: [{ productId: 'prod_456', qty: 2, price: 49.99 }], total: 99.98 },
      },
      {
        id: 'step-15',
        fromNode: 'dc-eu-order-db',
        toNode: 'dc-eu-order-pod',
        type: 'response',
        title: 'Order Persisted',
        description: 'PostgreSQL подтверждает сохранение',
        detailedInfo: `ЗАЧЕМ: Гарантировать что заказ сохранён перед продолжением.

ЧТО ПРОИСХОДИТ:
1. PostgreSQL выполняет INSERT в транзакции
2. WAL (Write-Ahead Log) фиксирует изменение
3. fsync на диск — данные durable
4. Возвращает подтверждение с orderId

ПАТТЕРН: ACID транзакция — Atomicity, Consistency, Isolation, Durability.
Теперь можно безопасно начать распределённую SAGA.`,
        duration: 150,
        realLatency: 20,
        payload: { success: true, orderId: 'order_789', createdAt: '2024-01-15T10:30:00Z' },
      },

      // ========== SAGA: PUBLISH TO KAFKA ==========
      {
        id: 'step-16',
        fromNode: 'dc-eu-order-pod',
        toNode: 'dc-eu-kafka',
        type: 'async',
        title: 'Publish OrderCreated Event',
        description: 'Событие в domain topic orders.created',
        detailedInfo: `ЗАЧЕМ: Запустить асинхронную обработку другими сервисами.

ЧТО ПРОИСХОДИТ:
1. Order Service публикует событие в topic: orders.created
2. Key: order_789 (партиционирование по orderId)
3. acks=all — запись на все реплики перед подтверждением
4. Schema Registry валидирует Avro schema события

ПАТТЕРН: Domain-specific Topics — orders.*, payments.*, inventory.*
Event-Driven Architecture — коммуникация через события.
SAGA Choreography — сервисы подписаны на нужные topics.`,
        duration: 100,
        realLatency: 5,
        payload: { topic: 'orders.created', key: 'order_789', partition: 3, schemaId: 'orders-v2' },
      },

      // ========== SAGA: INVENTORY ==========
      {
        id: 'step-17',
        fromNode: 'dc-eu-kafka',
        toNode: 'dc-eu-inventory-pod',
        type: 'async',
        title: 'Inventory Consumes Event',
        description: 'Consumer group читает из orders.created topic',
        detailedInfo: `ЗАЧЕМ: Проверить и зарезервировать товар на складе.

ЧТО ПРОИСХОДИТ:
1. Consumer group "inventory-orders-consumer" подписан на orders.created
2. Kafka доставляет событие одному consumer в группе
3. Consumer читает offset, обрабатывает, коммитит offset
4. Idempotency key (orderId) предотвращает дублирование

ПАТТЕРН: Consumer Group — параллельная обработка партиций.
Topic naming: <domain>.<event> — inventory читает orders.created.`,
        duration: 150,
        realLatency: 10,
        payload: { consumerGroup: 'inventory-orders-consumer', topic: 'orders.created', partition: 3, offset: 1547892 },
      },
      {
        id: 'step-18',
        fromNode: 'dc-eu-inventory-pod',
        toNode: 'dc-eu-inventory-db',
        type: 'request',
        title: 'Reserve Stock',
        description: 'Резервирование товара с блокировкой',
        detailedInfo: `ЗАЧЕМ: Гарантировать что товар не будет продан дважды.

ЧТО ПРОИСХОДИТ:
1. SELECT FOR UPDATE — блокировка строки товара
2. Проверка: available_qty >= requested_qty
3. UPDATE: available_qty -= 2, reserved_qty += 2
4. Если недостаточно — rollback и compensating event

ПАТТЕРН: Pessimistic Locking — блокировка на время операции.
Reservation Pattern — резервирование ресурса до подтверждения.
Two-Phase: reserve → confirm/cancel.`,
        duration: 200,
        realLatency: 30,
        payload: { productId: 'prod_456', requestedQty: 2, action: 'reserve', lockType: 'FOR UPDATE' },
      },
      {
        id: 'step-19',
        fromNode: 'dc-eu-inventory-db',
        toNode: 'dc-eu-inventory-pod',
        type: 'response',
        title: 'Stock Reserved Successfully',
        description: 'Товар зарезервирован, остаток обновлён',
        detailedInfo: `ЗАЧЕМ: Подтвердить резервацию для продолжения SAGA.

ЧТО ПРОИСХОДИТ:
1. Транзакция успешно завершена (COMMIT)
2. available_qty уменьшен на 2
3. reserved_qty увеличен на 2
4. Reservation записана с orderId для отслеживания

РЕЗУЛЬТАТ: Товар заблокирован для этого заказа.
Следующий шаг SAGA — оплата.`,
        duration: 100,
        realLatency: 15,
        payload: { reserved: true, productId: 'prod_456', newAvailable: 48, newReserved: 12, reservationId: 'res_xyz' },
      },
      {
        id: 'step-20',
        fromNode: 'dc-eu-inventory-pod',
        toNode: 'dc-eu-kafka',
        type: 'async',
        title: 'Publish InventoryReserved',
        description: 'Событие в topic inventory.reserved',
        detailedInfo: `ЗАЧЕМ: Уведомить другие сервисы что inventory step выполнен.

ЧТО ПРОИСХОДИТ:
1. Публикация в topic: inventory.reserved
2. Payment consumer group подписан на этот topic
3. Correlation ID (orderId) связывает все события SAGA
4. При ошибке оплаты → inventory.reservation-cancelled

ПАТТЕРН: Domain Events — inventory.reserved, inventory.released.
Compensating Events — для отката при ошибках.`,
        duration: 100,
        realLatency: 5,
        payload: { topic: 'inventory.reserved', key: 'order_789', reservationId: 'res_xyz', correlationId: 'saga_order_789' },
      },

      // ========== SAGA: PAYMENT ==========
      {
        id: 'step-21',
        fromNode: 'dc-eu-kafka',
        toNode: 'dc-eu-payment-pod',
        type: 'async',
        title: 'Payment Service Consumes',
        description: 'Consumer читает из inventory.reserved topic',
        detailedInfo: `ЗАЧЕМ: Начать обработку платежа после успешной резервации.

ЧТО ПРОИСХОДИТ:
1. Consumer group "payment-inventory-consumer" подписан на inventory.reserved
2. Event содержит orderId, amount, correlationId
3. Payment Service начинает процесс оплаты
4. Idempotency: проверка что платёж не был уже обработан

ПАТТЕРН: Cross-domain Events — payment слушает inventory topic.
SAGA продолжается — inventory OK, теперь payment.`,
        duration: 150,
        realLatency: 10,
        payload: { consumerGroup: 'payment-inventory-consumer', topic: 'inventory.reserved', orderId: 'order_789', amountToPay: 99.98 },
      },
      {
        id: 'step-21b',
        fromNode: 'dc-eu-payment-pod',
        toNode: 'dc-eu-payment-db',
        type: 'request',
        title: 'Save Payment Transaction',
        description: 'Запись транзакции в Payment DB перед вызовом Stripe',
        detailedInfo: `ЗАЧЕМ: Audit trail — все платёжные операции должны логироваться.

ЧТО ПРОИСХОДИТ:
1. INSERT в transactions: orderId, amount, status='PENDING'
2. Idempotency key сохраняется для защиты от дублей
3. Created_at timestamp для аудита
4. Только после записи — вызов Stripe API

ПАТТЕРН: Write-Ahead Logging для платежей.
PCI DSS требует логирование всех операций.
При падении после Stripe — можно восстановить состояние.`,
        duration: 100,
        realLatency: 15,
        payload: { orderId: 'order_789', amount: 99.98, status: 'PENDING', idempotencyKey: 'idem_xyz123' },
      },
      {
        id: 'step-21c',
        fromNode: 'dc-eu-payment-db',
        toNode: 'dc-eu-payment-pod',
        type: 'response',
        title: 'Transaction Logged',
        description: 'Payment DB подтвердила запись',
        detailedInfo: `ЗАЧЕМ: Убедиться что транзакция залогирована перед Stripe.

ЧТО ПРОИСХОДИТ:
1. PostgreSQL подтвердил INSERT
2. Теперь безопасно вызывать Stripe
3. При любом исходе — транзакция в БД

РЕЗУЛЬТАТ: Audit trail создан, можно продолжать.`,
        duration: 50,
        realLatency: 10,
        payload: { transactionId: 'txn_local_456', status: 'PENDING', logged: true },
      },
      {
        id: 'step-21d',
        fromNode: 'dc-eu-payment-pod',
        toNode: 'dc-eu-payment-db',
        type: 'request',
        title: 'Update Transaction (Stripe Response)',
        description: 'Обновление статуса после ответа Stripe',
        detailedInfo: `ЗАЧЕМ: Зафиксировать результат вызова Stripe API.

ЧТО ПРОИСХОДИТ:
1. Stripe API вызван (authorize) — ~500ms
2. Stripe вернул transactionId и status
3. UPDATE transactions SET stripe_id, status='AUTHORIZED'
4. Теперь можно публиковать событие в Kafka

ПАТТЕРН: External Service Integration.
Сначала пишем в свою БД, потом в Kafka (Outbox Pattern).`,
        duration: 500,
        realLatency: 350,
        payload: { stripeTransactionId: 'pi_3abc123', status: 'AUTHORIZED', cardLast4: '4242' },
      },
      {
        id: 'step-22',
        fromNode: 'dc-eu-payment-pod',
        toNode: 'dc-eu-kafka',
        type: 'async',
        title: 'Publish PaymentCompleted',
        description: 'Событие в topic payments.completed',
        detailedInfo: `ЗАЧЕМ: Уведомить другие сервисы об успешной оплате.

ЧТО ПРОИСХОДИТ:
1. Payment транзакция сохранена в БД ✓
2. Stripe авторизовал платёж ✓
3. Публикуем событие в topic: payments.completed
4. При ошибке публикации — retry с idempotency

ПАТТЕРН: Transactional Outbox — сначала БД, потом событие.
Гарантирует consistency между БД и Kafka.
Domain topic: payments.completed / payments.failed.`,
        duration: 100,
        realLatency: 5,
        payload: { topic: 'payments.completed', key: 'order_789', transactionId: 'txn_abc123', amount: 99.98, status: 'authorized' },
      },

      // ========== SAGA: COMPLETE ORDER ==========
      {
        id: 'step-23',
        fromNode: 'dc-eu-kafka',
        toNode: 'dc-eu-order-pod',
        type: 'async',
        title: 'Order Service Receives Payment Event',
        description: 'Consumer читает из payments.completed topic',
        detailedInfo: `ЗАЧЕМ: Финализировать заказ после успешной оплаты.

ЧТО ПРОИСХОДИТ:
1. Consumer group "order-payments-consumer" подписан на payments.completed
2. Получает событие для order_789 (correlation ID)
3. Все шаги SAGA успешны: order ✓, inventory ✓, payment ✓
4. Статус меняется на CONFIRMED

ПАТТЕРН: SAGA Completion — все participants подтвердили.
Distributed Transaction через domain events.`,
        duration: 100,
        realLatency: 10,
        payload: { consumerGroup: 'order-payments-consumer', topic: 'payments.completed', orderId: 'order_789', sagaStatus: 'completing' },
      },
      {
        id: 'step-24',
        fromNode: 'dc-eu-order-pod',
        toNode: 'dc-eu-order-db',
        type: 'request',
        title: 'Update Order → CONFIRMED',
        description: 'Финальное обновление статуса заказа',
        detailedInfo: `ЗАЧЕМ: Зафиксировать успешное завершение SAGA.

ЧТО ПРОИСХОДИТ:
1. UPDATE orders SET status = 'CONFIRMED' WHERE id = order_789
2. Добавление payment_transaction_id
3. Установка confirmed_at timestamp
4. Trigger может отправить notification event

ПАТТЕРН: State Machine — PENDING → CONFIRMED.
Eventual Consistency достигнута — все системы согласованы.
SAGA успешно завершена!`,
        duration: 150,
        realLatency: 20,
        payload: { orderId: 'order_789', newStatus: 'CONFIRMED', transactionId: 'txn_abc123' },
      },

      // ========== CROSS-DC REPLICATION ==========
      {
        id: 'step-25',
        fromNode: 'dc-eu-kafka',
        toNode: 'cross-dc-kafka',
        type: 'async',
        title: 'Cross-DC Event Replication',
        description: 'MirrorMaker реплицирует события в другие регионы',
        detailedInfo: `ЗАЧЕМ: Синхронизировать данные между датацентрами.

ЧТО ПРОИСХОДИТ:
1. Kafka MirrorMaker 2 работает как consumer+producer
2. Читает события из EU Kafka
3. Публикует в US и Asia Kafka кластеры
4. Сохраняет ordering и exactly-once semantics

ПАТТЕРН: Multi-Region Replication — geo-distributed система.
Active-Active — все регионы могут принимать запросы.
Eventual Consistency между регионами (~100ms lag).`,
        duration: 300,
        realLatency: 80,
        payload: { replication: 'async', sourceCluster: 'eu-kafka', targetClusters: ['us-kafka', 'asia-kafka'], lag: '~100ms' },
      },
      {
        id: 'step-26',
        fromNode: 'dc-eu-order-db',
        toNode: 'dc-us-db',
        type: 'async',
        title: 'DB Streaming Replication → US',
        description: 'PostgreSQL реплицирует данные в US',
        detailedInfo: `ЗАЧЕМ: Read replicas в других регионах для низкой latency чтения.

ЧТО ПРОИСХОДИТ:
1. PostgreSQL Streaming Replication
2. WAL (Write-Ahead Log) отправляется на replica
3. US DB применяет WAL — hot standby
4. Async mode — не блокирует primary при задержках сети

ПАТТЕРН: Single-Leader Replication — один master, много replicas.
Read replicas — масштабирование чтения.
RPO (Recovery Point Objective) — потеря данных при failover ~секунды.`,
        duration: 400,
        realLatency: 50,
        payload: { replication: 'streaming', mode: 'async', lag: '~50ms', walPosition: '0/1A2B3C4D' },
      },
      {
        id: 'step-27',
        fromNode: 'dc-eu-order-db',
        toNode: 'dc-asia-db',
        type: 'async',
        title: 'DB Streaming Replication → Asia',
        description: 'PostgreSQL реплицирует данные в Asia',
        detailedInfo: `ЗАЧЕМ: Локальные read replicas для пользователей в Азии.

ЧТО ПРОИСХОДИТ:
1. WAL stream идёт из EU в Asia через dedicated network
2. Больше lag из-за географического расстояния
3. Asia DB работает в hot standby режиме
4. Может стать primary при failover EU

ПАТТЕРН: Geo-Distributed Database.
Cross-region latency: EU→Asia ~150-200ms.
Trade-off: consistency vs latency.`,
        duration: 500,
        realLatency: 150,
        payload: { replication: 'streaming', mode: 'async', lag: '~200ms', distance: '~10000km' },
      },

      // ========== INTER-SERVICE CALL ==========
      {
        id: 'step-28',
        fromNode: 'dc-eu-order-pod',
        toNode: 'dc-eu-user-pod',
        type: 'request',
        title: 'Order Pod → User Pod (Service Mesh)',
        description: 'Межсервисный вызов через Envoy sidecar proxies',
        detailedInfo: `ЗАЧЕМ: Получить данные пользователя для уведомления о заказе.

ЧТО ПРОИСХОДИТ:
1. Order Pod делает gRPC вызов GetUser
2. Envoy sidecar (внутри Order Pod) перехватывает трафик
3. mTLS: взаимная аутентификация через SPIFFE IDs
4. Circuit Breaker защищает от каскадных отказов
5. User Pod получает запрос через свой Envoy sidecar

ПАТТЕРН: Service Mesh — Pod-to-Pod через sidecar proxies.
Istiod управляет конфигурацией всех Envoy.
Zero Trust: весь трафик внутри кластера шифруется.`,
        duration: 80,
        realLatency: 3,
        payload: { protocol: 'gRPC', method: 'GetUser', mtls: true, circuitBreaker: true },
      },
      {
        id: 'step-29',
        fromNode: 'dc-eu-user-pod',
        toNode: 'dc-eu-cache',
        type: 'request',
        title: 'User Pod → Redis Cache',
        description: 'Проверка кэша через Envoy sidecar',
        detailedInfo: `ЗАЧЕМ: Избежать запроса в БД если данные в кэше.

ЧТО ПРОИСХОДИТ:
1. Envoy открывает соединение из connection pool
2. Redis: GET user:user_123
3. Cache key включает версию схемы (v1:user:user_123)
4. TTL: 1 час — баланс между свежестью и нагрузкой на БД

ПАТТЕРН: Cache-Aside (Lazy Loading).
Сервис сам управляет кэшем, не БД.
Connection pooling снижает overhead на TCP handshakes.`,
        duration: 50,
        realLatency: 0.5,
        payload: { key: 'v1:user:user_123', operation: 'GET', connectionPool: 'redis-pool' },
      },
      {
        id: 'step-30',
        fromNode: 'dc-eu-cache',
        toNode: 'dc-eu-user-pod',
        type: 'response',
        title: 'Cache MISS',
        description: 'Redis: данных нет в кэше',
        detailedInfo: `ЗАЧЕМ: Показать полный путь при cache miss.

ЧТО ПРОИСХОДИТ:
1. Redis вернул nil — ключ не найден
2. User Service должен запросить данные из БД
3. После получения — записать в кэш (Cache-Aside)

ПАТТЕРН: Cache-Aside — сервис сам управляет кэшем.
Cache miss → DB read → Cache write.`,
        duration: 10,
        realLatency: 0.1,
        payload: { hit: false, key: 'v1:user:user_123' },
      },
      {
        id: 'step-30b',
        fromNode: 'dc-eu-user-pod',
        toNode: 'dc-eu-user-db',
        type: 'request',
        title: 'User Pod → User DB',
        description: 'Запрос данных пользователя из БД',
        detailedInfo: `ЗАЧЕМ: Cache miss — нужно получить данные из источника правды.

ЧТО ПРОИСХОДИТ:
1. SELECT * FROM users WHERE id = 'user_123'
2. PostgreSQL выполняет index scan (primary key)
3. Возвращает данные пользователя
4. ~50ms вместо ~2ms из кэша

ПАТТЕРН: Database per Service — User Service владеет User DB.
Никакой другой сервис не имеет прямого доступа.`,
        duration: 50,
        realLatency: 8,
        payload: { query: 'SELECT * FROM users WHERE id = $1', params: ['user_123'] },
      },
      {
        id: 'step-30c',
        fromNode: 'dc-eu-user-db',
        toNode: 'dc-eu-user-pod',
        type: 'response',
        title: 'User DB → User Pod',
        description: 'PostgreSQL возвращает данные пользователя',
        detailedInfo: `ЗАЧЕМ: Получены актуальные данные из БД.

ЧТО ПРОИСХОДИТ:
1. PostgreSQL вернул row с данными
2. User Service десериализует в объект
3. Данные готовы для возврата + кэширования

РЕЗУЛЬТАТ: Данные получены за ~50ms.`,
        duration: 30,
        realLatency: 5,
        payload: { userId: 'user_123', email: 'john.doe@example.com', name: 'John Doe', createdAt: '2023-06-15' },
      },
      {
        id: 'step-30d',
        fromNode: 'dc-eu-user-pod',
        toNode: 'dc-eu-cache',
        type: 'request',
        title: 'Cache Write (SET)',
        description: 'Запись данных в кэш для следующих запросов',
        detailedInfo: `ЗАЧЕМ: Следующий запрос получит данные из кэша (~2ms).

ЧТО ПРОИСХОДИТ:
1. SET v1:user:user_123 <serialized_data>
2. EXPIRE 3600 — TTL 1 час
3. Кэш прогрет — следующий запрос будет cache hit

ПАТТЕРН: Cache-Aside (Lazy Loading).
Write-through не используем — только при чтении.
TTL балансирует свежесть vs нагрузку на БД.`,
        duration: 10,
        realLatency: 0.5,
        payload: { key: 'v1:user:user_123', ttl: 3600, operation: 'SET' },
      },
      {
        id: 'step-31',
        fromNode: 'dc-eu-cache',
        toNode: 'dc-eu-user-pod',
        type: 'response',
        title: 'Cache Write OK',
        description: 'Redis подтвердил запись',
        detailedInfo: `ЗАЧЕМ: Убедиться что кэш записан.

ЧТО ПРОИСХОДИТ:
1. Redis вернул OK
2. Данные закэшированы на 1 час
3. Можно вернуть ответ в Order Service

РЕЗУЛЬТАТ: Cache miss обработан за ~100ms.
Следующий запрос будет ~2ms (cache hit).`,
        duration: 5,
        realLatency: 0.1,
        payload: { status: 'OK', cached: true },
      },
      {
        id: 'step-31b',
        fromNode: 'dc-eu-user-pod',
        toNode: 'dc-eu-order-pod',
        type: 'response',
        title: 'User Pod → Order Pod (Response)',
        description: 'User данные возвращаются в Order Service',
        detailedInfo: `ЗАЧЕМ: Order Service получил данные для email уведомления.

ЧТО ПРОИСХОДИТ:
1. User Pod формирует gRPC response с данными пользователя
2. Envoy sidecar отправляет ответ через mesh
3. Order Pod получает данные через свой sidecar
4. Order Service может отправить email уведомление

РЕЗУЛЬТАТ: User данные получены за ~120ms (cache miss).
При cache hit было бы ~50ms.
Service Mesh обеспечил безопасную коммуникацию.`,
        duration: 50,
        realLatency: 2,
        payload: { email: 'john.doe@example.com', name: 'John Doe', userId: 'user_123' },
      },

      // ========== RESPONSE TO CLIENT (обратный путь) ==========
      {
        id: 'step-32',
        fromNode: 'dc-eu-order-pod',
        toNode: 'dc-eu-order-svc',
        type: 'response',
        title: 'Order Pod → K8s Service',
        description: 'Response начинает обратный путь',
        detailedInfo: `ЗАЧЕМ: Response должен пройти обратно через всю инфраструктуру.

ЧТО ПРОИСХОДИТ:
1. Order Pod формирует HTTP response
2. Envoy sidecar добавляет response headers (x-envoy-*)
3. Response идёт на K8s Service endpoint
4. Service передаёт дальше на Ingress

ПАТТЕРН: Response проходит тот же путь что и request.
Каждый компонент может добавить свои headers/metrics.`,
        duration: 30,
        realLatency: 0.5,
        payload: { orderId: 'order_789', status: 'CONFIRMED', responseCode: 201 },
      },
      {
        id: 'step-33',
        fromNode: 'dc-eu-order-svc',
        toNode: 'dc-eu-ingress',
        type: 'response',
        title: 'K8s Service → Ingress',
        description: 'Response проходит через Ingress Controller',
        detailedInfo: `ЗАЧЕМ: Ingress собирает метрики и логи response.

ЧТО ПРОИСХОДИТ:
1. NGINX Ingress получает response от upstream
2. Логирует: response_time, status_code, upstream_addr
3. Добавляет server timing headers
4. Передаёт на API Gateway

ПАТТЕРН: Observability на каждом уровне.
Access logs для debugging и audit.`,
        duration: 20,
        realLatency: 0.5,
        payload: { upstreamResponseTime: '1.2s', statusCode: 201 },
      },
      {
        id: 'step-34',
        fromNode: 'dc-eu-ingress',
        toNode: 'dc-eu-gw',
        type: 'response',
        title: 'Ingress → API Gateway',
        description: 'API Gateway добавляет финальные headers',
        detailedInfo: `ЗАЧЕМ: API Gateway — последняя точка обработки перед выходом из ДЦ.

ЧТО ПРОИСХОДИТ:
1. API Gateway получает response
2. Добавляет headers: X-Request-Id, X-Response-Time
3. Rate limit headers: X-RateLimit-Remaining
4. CORS headers если нужно

ПАТТЕРН: Response Enrichment.
Единообразные headers для всех API.`,
        duration: 30,
        realLatency: 1,
        payload: { headers: { 'X-Request-Id': 'req_abc123', 'X-Response-Time': '1.3s' } },
      },
      {
        id: 'step-35',
        fromNode: 'dc-eu-gw',
        toNode: 'dc-eu-lb',
        type: 'response',
        title: 'API Gateway → Regional LB',
        description: 'Response выходит из API слоя',
        detailedInfo: `ЗАЧЕМ: LB записывает метрики успешности backend.

ЧТО ПРОИСХОДИТ:
1. HAProxy получает response
2. Обновляет статистику backend (success rate)
3. Освобождает connection в pool
4. Передаёт на DC border

ПАТТЕРН: Health monitoring через response codes.
5xx увеличивает error rate → circuit breaker.`,
        duration: 20,
        realLatency: 0.5,
        payload: { backendResponseTime: '1.35s', connectionReused: true },
      },
      {
        id: 'step-35b',
        fromNode: 'dc-eu-lb',
        toNode: 'dc-eu',
        type: 'response',
        title: 'Regional LB → DC Border',
        description: 'Response выходит из внутренней сети ДЦ',
        detailedInfo: `ЗАЧЕМ: Трафик проходит через border router ДЦ.

ЧТО ПРОИСХОДИТ:
1. Regional LB отправляет response
2. Border router маршрутизирует наружу
3. NAT преобразует internal IP → external

ПАТТЕРН: Network boundary — выход из private network.`,
        duration: 10,
        realLatency: 0.5,
        payload: { direction: 'egress', protocol: 'HTTPS' },
      },
      {
        id: 'step-35c',
        fromNode: 'dc-eu',
        toNode: 'global-lb',
        type: 'response',
        title: 'DC → Global LB',
        description: 'Response возвращается на Global Load Balancer',
        detailedInfo: `ЗАЧЕМ: GLB отслеживает latency каждого ДЦ.

ЧТО ПРОИСХОДИТ:
1. Global LB получает response от EU DC
2. Записывает метрику: response_time для health scoring
3. Передаёт response дальше к CDN

ПАТТЕРН: Response metrics для адаптивной балансировки.
Медленный ДЦ получает меньше трафика.`,
        duration: 20,
        realLatency: 1,
        payload: { dcResponseTime: '1.4s', dcHealth: 'healthy' },
      },
      {
        id: 'step-36',
        fromNode: 'global-lb',
        toNode: 'cdn',
        type: 'response',
        title: 'Global LB → CDN Edge',
        description: 'Response достигает CDN edge server',
        detailedInfo: `ЗАЧЕМ: CDN может кэшировать GET responses.

ЧТО ПРОИСХОДИТ:
1. CDN получает response от origin через GLB
2. Для POST — не кэшируется (Cache-Control: no-store)
3. Добавляет CF-Ray header для трейсинга
4. Сжимает response (gzip/brotli) если не сжат

ПАТТЕРН: Edge optimization.
Compression на edge экономит bandwidth.`,
        duration: 50,
        realLatency: 3,
        payload: { cached: false, compressed: true, cfRay: '8a1b2c3d-FRA' },
      },
      {
        id: 'step-37',
        fromNode: 'cdn',
        toNode: 'client',
        type: 'response',
        title: 'CDN → Client (Final Response)',
        description: 'Клиент получает подтверждение заказа',
        detailedInfo: `ЗАЧЕМ: Завершить HTTP request/response cycle.

ЧТО ПРОИСХОДИТ:
1. CDN отправляет response клиенту
2. TLS encryption до клиента
3. HTTP/2 или HTTP/3 (QUIC) для скорости
4. Клиент получает JSON с orderId

РЕЗУЛЬТАТ: Полный цикл ~2-3 секунды.
Фоново продолжается: репликация, email, analytics.

ИТОГО ПАТТЕРНЫ В ЗАПРОСЕ:
• API Gateway • JWT Auth • Rate Limiting
• SAGA • Event Sourcing • Outbox Pattern
• Cache-Aside • Database per Service
• Service Mesh • Schema Registry
• Multi-DC Replication • Circuit Breaker`,
        duration: 100,
        realLatency: 10,
        payload: {
          orderId: 'order_789',
          status: 'CONFIRMED',
          total: 99.98,
          estimatedDelivery: '2024-01-18',
          message: 'Order placed successfully!'
        },
      },
    ],
  },
]
