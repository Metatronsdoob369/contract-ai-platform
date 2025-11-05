# Knowledge Layer Incident Response Runbook
# Last Updated: 2025-10-23
# Owner: Platform Engineering Team

## Incident: Elevated 5xx Error Rate

### Detection
- **Alert**: 5xx rate > 1% for 5 consecutive minutes
- **Monitoring**: CloudWatch metric filter on application logs
- **Dashboard**: `/ops/knowledge-layer-errors`

### Initial Assessment (5 minutes)
1. **Check health endpoint**: `curl http://knowledge-api.example.com/health`
2. **Review error logs**: Look for patterns in CloudWatch Logs Insights
   ```
   fields @timestamp, @message
   | filter @message like /5xx|Internal Server Error/
   | sort @timestamp desc
   | limit 20
   ```
3. **Identify failing tool**: Check metrics by endpoint
   - `metrics.get` - Most common, check SQL connection
   - `metrics.search` - Pinecone issues, check vector search
   - `rate_limits.list` - Usually cache/DB issues

### Escalation Matrix
- **T1 (SRE On-Call)**: Initial 5 minutes, basic checks
- **T2 (Platform Engineer)**: After 10 minutes, if SQL/Pinecone involved
- **T3 (Data Engineer)**: After 15 minutes, if data corruption suspected

### Response Actions

#### Circuit Breaker Activation (10 minutes)
If 5xx rate > 5%, activate circuit breaker:
```bash
# Flip feature flag to reduce traffic
curl -X PUT https://api.launchdarkly.com/api/v2/flags/knowledge_layer_v1 \
  -H "Authorization: $LD_API_KEY" \
  -d '{"environments":{"production":{"on":false,"rollout":0}}}'
```

#### Database Issues (SQL)
1. Check connection pool: `SELECT count(*) FROM pg_stat_activity WHERE state = 'active';`
2. Restart connection pool if needed
3. Check for long-running queries: `SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC;`

#### Pinecone Issues (Vector Search)
1. Check Pinecone health: SDK health check endpoint
2. Verify API key rotation hasn't broken auth
3. Check quota limits in Pinecone dashboard

#### Cache Issues (Redis)
1. Check Redis connectivity: `redis-cli ping`
2. Monitor memory usage: `redis-cli info memory`
3. Clear corrupted cache keys if identified

### Rollback Procedure (30 minutes)
If incident introduced in last deployment:

1. **Identify bad deployment**:
   ```bash
   kubectl rollout history deployment/knowledge-api
   ```

2. **Rollback**:
   ```bash
   kubectl rollout undo deployment/knowledge-api --to-revision=X
   ```

3. **Verify rollback**:
   ```bash
   kubectl get pods -l app=knowledge-api
   ```

### Communication
- **Internal**: Slack #platform-incidents
- **External**: Status page update if > 5 minute impact
- **Post-mortem**: Within 24 hours, create issue with root cause analysis

### Prevention
- Add chaos testing for database connection failures
- Implement gradual rollouts (5% → 25% → 100%)
- Add synthetic monitoring for all endpoints

---

## Incident: Data Drift Detected

### Detection
- **Alert**: PSI/KS test statistic > 0.1 (Population Stability Index)
- **Frequency**: Daily validation job
- **Impact**: Model performance degradation

### Response
1. **Quarantine affected data**:
   ```sql
   UPDATE metrics SET status = 'quarantined' WHERE drift_score > 0.1;
   ```

2. **Notify data team** for manual review

3. **Rollback to previous version** if widespread drift

---

## Incident: Licensing Violation

### Detection
- **Alert**: License validation job failure
- **Impact**: Legal compliance risk

### Response
1. **Immediate**: Block ingestion from violating source
2. **Review**: Audit all data from affected source
3. **Remove**: Delete non-compliant data with audit trail
