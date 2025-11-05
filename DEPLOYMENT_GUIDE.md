# 🚀 OpenAI Agents - Production Deployment Guide

This guide provides comprehensive instructions for deploying the Contract-Driven Multi-Agent Orchestrator in production environments.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Strategies](#deployment-strategies)
- [Monitoring & Observability](#monitoring--observability)
- [Runbooks](#runbooks)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Performance Tuning](#performance-tuning)

## Architecture Overview

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Orchestrator  │────│  Performance     │────│  Monitoring     │
│   Pipeline      │    │  Optimizer       │    │  Dashboard      │
│                 │    │                  │    │                 │
│ • Contract Gen  │    │ • Batch Embed    │    │ • Metrics       │
│ • Agent Spawn   │    │ • Parallel LLM   │    │ • Alerts        │
│ • Validation    │    │ • Caching        │    │ • Health Checks │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────────────┐
                    │  External Services │
                    │                    │
                    │ • OpenAI API       │
                    │ • Pinecone DB      │
                    │ • MCP Servers      │
                    │ • Notification     │
                    │   Services         │
                    └────────────────────┘
```

### Data Flow

1. **Prompt Processing** → YAML master prompt loaded
2. **Contract Generation** → Parallel LLM calls generate agent contracts
3. **Validation** → Schema validation and dependency checking
4. **Storage** → Contracts stored in Pinecone with embeddings
5. **Execution** → Orchestrator runs with performance optimizations
6. **Monitoring** → Real-time metrics and alerting

## Prerequisites

### System Requirements

- **Node.js**: 22.x or later
- **Memory**: Minimum 2GB RAM, recommended 4GB+
- **Storage**: 500MB for application, plus vector database
- **Network**: Stable internet connection for API calls

### External Services

- **OpenAI API**: GPT-4 access with sufficient rate limits
- **Pinecone**: Vector database for knowledge storage
- **Optional**: Slack/Discord webhooks for notifications

### Infrastructure

- **Docker**: For containerized deployment
- **Kubernetes**: For orchestrated deployments (optional)
- **Monitoring**: Prometheus/Grafana stack (recommended)

## Environment Setup

### 1. API Keys Configuration

```bash
# Create production .env file
cp .env.example .env

# Edit with production keys
OPENAI_API_KEY=sk-prod-...
PINECONE_API_KEY=prod-pinecone-key
NODE_ENV=production
```

### 2. Pinecone Setup

```bash
# Create Pinecone index
pinecone create-index \
  --name agent-enhancements \
  --dimension 1536 \
  --metric cosine \
  --pods 1 \
  --replicas 1 \
  --pod-type p1.x1
```

### 3. Environment Validation

```bash
# Test all connections
npm run test:env

# Expected output:
# ✅ OpenAI API key is valid and connection successful
# ✅ Pinecone API key is valid and connection successful
# ✅ Environment is properly configured for OpenAI Agents SDK
```

## Deployment Strategies

### Docker Deployment

#### Single Container

```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY master-orchestrator-prompt.yaml ./

EXPOSE 3000 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "run", "orchestrate"]
```

#### Docker Compose (Full Stack)

```yaml
version: '3.8'
services:
  orchestrator:
    build: .
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - NODE_ENV=production
    ports:
      - "3000:3000"  # Orchestrator API
      - "3001:3001"  # Monitoring dashboard
    volumes:
      - ./logs:/app/logs
      - ./manifests:/app/manifests
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

### Kubernetes Deployment

#### orchestrator-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orchestrator
spec:
  replicas: 2
  selector:
    matchLabels:
      app: orchestrator
  template:
    metadata:
      labels:
        app: orchestrator
    spec:
      containers:
      - name: orchestrator
        image: your-registry/openai-agents:latest
        ports:
        - containerPort: 3000
          name: api
        - containerPort: 3001
          name: monitoring
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: openai-secrets
              key: api-key
        - name: PINECONE_API_KEY
          valueFrom:
            secretKeyRef:
              name: pinecone-secrets
              key: api-key
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service Configuration

```yaml
apiVersion: v1
kind: Service
metadata:
  name: orchestrator-service
spec:
  selector:
    app: orchestrator
  ports:
  - name: api
    port: 3000
    targetPort: 3000
  - name: monitoring
    port: 3001
    targetPort: 3001
  type: LoadBalancer
```

## Monitoring & Observability

### Health Checks

```bash
# Application health
curl http://localhost:3001/health

# Metrics endpoint
curl http://localhost:3001/metrics

# Orchestrator status
curl http://localhost:3000/status
```

### Key Metrics to Monitor

- **Orchestrator Performance**
  - Contract generation time
  - Success/failure rates
  - Queue depths

- **API Usage**
  - OpenAI tokens consumed
  - Pinecone queries/second
  - Rate limit hits

- **System Resources**
  - Memory usage
  - CPU utilization
  - Network I/O

### Alert Configuration

```javascript
// Example alerting rules
const alertRules = [
  {
    name: 'High Error Rate',
    condition: (metrics) => metrics.errors.totalErrors > 50,
    action: () => notifySlack('🚨 High error rate detected')
  },
  {
    name: 'Pinecone Down',
    condition: (metrics) => metrics.pinecone.connectionStatus === 'down',
    action: () => pageOnCall('🔥 Pinecone database unreachable')
  },
  {
    name: 'Low Cache Hit Rate',
    condition: (metrics) => metrics.pinecone.cacheHitRate < 0.7,
    action: () => logWarning('Low cache efficiency detected')
  }
];
```

## Runbooks

### Routine Operations

#### Daily Health Check

```bash
#!/bin/bash
# daily-health-check.sh

echo "=== Daily Health Check ==="

# Check service status
if curl -f http://localhost:3001/health > /dev/null; then
    echo "✅ Services healthy"
else
    echo "❌ Services unhealthy"
    exit 1
fi

# Check error rates
ERRORS=$(curl -s http://localhost:3001/metrics | jq '.errors.totalErrors')
if [ "$ERRORS" -gt 10 ]; then
    echo "⚠️ High error count: $ERRORS"
fi

# Check performance
AVG_TIME=$(curl -s http://localhost:3001/metrics | jq '.orchestrator.averageExecutionTime')
if (( $(echo "$AVG_TIME > 30000" | bc -l) )); then
    echo "⚠️ Slow performance: ${AVG_TIME}ms average"
fi

echo "Health check complete"
```

#### Log Rotation

```bash
#!/bin/bash
# log-rotation.sh

LOG_DIR="/var/log/orchestrator"
MAX_SIZE="100M"

# Rotate application logs
logrotate -f /etc/logrotate.d/orchestrator

# Compress old logs
find $LOG_DIR -name "*.log.1" -exec gzip {} \;

# Clean old compressed logs (keep 30 days)
find $LOG_DIR -name "*.gz" -mtime +30 -delete

echo "Log rotation complete"
```

### Incident Response

#### High Error Rate Incident

**Detection**: Monitoring alert triggers when error rate > 10%

**Response Steps**:
1. Check application logs: `journalctl -u orchestrator -n 100`
2. Verify API connectivity: `npm run test:env`
3. Check resource usage: `docker stats orchestrator`
4. Restart if necessary: `docker restart orchestrator`
5. Escalate if errors persist

#### Pinecone Outage

**Detection**: Health check fails for Pinecone connection

**Response Steps**:
1. Verify Pinecone service status
2. Check API key validity
3. Switch to fallback mode (no vector storage)
4. Monitor for service restoration
5. Rebuild vector index if corrupted

#### Performance Degradation

**Detection**: Average execution time > 30 seconds

**Response Steps**:
1. Check system resources: `top`, `free -h`
2. Review recent deployments
3. Clear performance caches
4. Scale resources if needed
5. Profile with performance benchmarks

## Troubleshooting

### Common Issues

#### "OpenAI API rate limit exceeded"

**Symptoms**: 429 errors in logs, slow response times

**Solutions**:
```bash
# Check current usage
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/usage

# Implement backoff
export LLM_RETRY_DELAY=5000
export LLM_MAX_RETRIES=5

# Restart service
docker restart orchestrator
```

#### "Pinecone index not found"

**Symptoms**: Vector storage failures

**Solutions**:
```bash
# Verify index exists
pinecone describe-index --name agent-enhancements

# Recreate if missing
pinecone create-index \
  --name agent-enhancements \
  --dimension 1536 \
  --metric cosine

# Rebuild embeddings
npm run orchestrate
```

#### Memory leaks

**Symptoms**: Increasing memory usage over time

**Solutions**:
```bash
# Check memory usage
docker stats orchestrator

# Force garbage collection (if available)
node --expose-gc -e "gc()"

# Restart service
docker restart orchestrator
```

### Debug Commands

```bash
# Full system diagnostics
curl http://localhost:3001/metrics | jq .

# Recent errors
curl http://localhost:3001/alerts | jq '.active[-5:]'

# Performance profiling
npm run test:integration -- --reporter=verbose

# Log analysis
journalctl -u orchestrator --since "1 hour ago" | grep ERROR
```

## Security Considerations

### API Key Management

- Store keys in secure vaults (AWS Secrets Manager, HashiCorp Vault)
- Rotate keys quarterly
- Use different keys for different environments
- Monitor key usage patterns

### Network Security

- Run behind reverse proxy (nginx, traefik)
- Enable TLS/SSL
- Implement rate limiting
- Use VPC/security groups

### Data Protection

- Encrypt data at rest and in transit
- Implement data retention policies
- Regular security audits
- Compliance with data protection regulations

## Performance Tuning

### Optimization Settings

```javascript
// performance-config.js
export const performanceConfig = {
  // LLM optimization
  maxConcurrentLLMCalls: 3,        // Reduce for rate limits
  llmRetryDelay: 2000,             // Increase for stability
  llmMaxRetries: 5,

  // Embedding optimization
  embeddingBatchSize: 5,           // Smaller batches for memory
  embeddingCacheTTL: 3600000,      // 1 hour cache

  // General optimization
  enableCompression: true,
  enableConnectionPooling: true,
  memoryLimit: '2GB'
};
```

### Scaling Guidelines

- **1-10 agents**: Single instance sufficient
- **10-50 agents**: Horizontal scaling recommended
- **50+ agents**: Distributed architecture needed

### Resource Allocation

```yaml
# Production resource limits
resources:
  requests:
    memory: "2Gi"
    cpu: "1000m"
  limits:
    memory: "4Gi"
    cpu: "2000m"
```

## Backup & Recovery

### Data Backup

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/opt/orchestrator/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup manifests
cp enhancements_manifest.json $BACKUP_DIR/manifest_$TIMESTAMP.json

# Backup Pinecone data (if API allows)
# Note: Pinecone doesn't provide direct backup APIs

# Backup configuration
cp .env $BACKUP_DIR/env_$TIMESTAMP.backup

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "*.json" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete
```

### Recovery Procedures

1. **Service Restart**: `docker restart orchestrator`
2. **Full Recovery**: Restore from backup and rebuild indices
3. **Disaster Recovery**: Spin up new environment from infrastructure as code

## Maintenance Windows

### Weekly Maintenance
- Dependency updates
- Log rotation
- Performance optimization review

### Monthly Maintenance
- Security patches
- Configuration audits
- Performance benchmarking

### Quarterly Maintenance
- Major version upgrades
- Architecture reviews
- Disaster recovery testing

---

## Quick Reference

### Start Services
```bash
# Docker
docker-compose up -d

# Kubernetes
kubectl apply -f k8s/

# Manual
npm run build && npm start
```

### Monitor Health
```bash
# Dashboard
open http://localhost:3001

# CLI
curl http://localhost:3001/health
curl http://localhost:3001/metrics | jq .
```

### Emergency Stop
```bash
# Docker
docker-compose down

# Kubernetes
kubectl delete deployment orchestrator

# Manual
pkill -f "node dist"
```

This deployment guide ensures reliable, scalable, and maintainable operation of your contract-driven multi-agent orchestrator in production environments.