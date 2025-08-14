export const SYSTEM_EXAMPLES = {
  microservices: {
    title: "E-commerce Platform",
    description: "Microservices architecture",
    prompt: "Microservices e-commerce platform with API gateway, user service, product service, order service, payment gateway, Redis cache, PostgreSQL databases, and load balancer. Include authentication service, notification service, and monitoring system."
  },
  chat: {
    title: "Real-time Chat",
    description: "WebSocket messaging system",
    prompt: "Real-time chat application with WebSocket connections, message queues (Redis), user authentication service, message persistence (MongoDB), presence tracking, push notifications, and CDN for file sharing. Include rate limiting and message encryption."
  },
  pipeline: {
    title: "Data Pipeline",
    description: "ETL processing system",
    prompt: "Data pipeline system with data ingestion layer (Kafka), stream processing workers (Apache Spark), data lake (S3), analytics engine, ETL processes, data warehouse, real-time dashboard, and monitoring alerts."
  },
  cicd: {
    title: "CI/CD Pipeline",
    description: "Deployment automation",
    prompt: "CI/CD pipeline with Git repository, webhook triggers, build servers (Jenkins), automated testing environments, code quality gates, artifact repository, staging environment, production deployment, and rollback mechanisms."
  }
}

export type ExampleKey = keyof typeof SYSTEM_EXAMPLES