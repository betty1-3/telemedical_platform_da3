package com.hospital.dashboard.config;

import com.hospital.dashboard.exception.GraphSyncException;
import com.hospital.dashboard.service.OracleGraphSyncService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/** Refreshes Neo4j after successful REST mutations handled by Oracle controllers. */
@Aspect
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class OracleMutationGraphSyncAspect {
    private final OracleGraphSyncService graphSync;
    private final boolean enabled;

    public OracleMutationGraphSyncAspect(OracleGraphSyncService graphSync,
                                        @Value("${app.neo4j.enabled:false}") boolean enabled) {
        this.graphSync = graphSync;
        this.enabled = enabled;
    }

    @Around("execution(* com.hospital.dashboard.controller..*(..)) && " +
            "(@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.PatchMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.DeleteMapping)) && " +
            "!@annotation(com.hospital.dashboard.config.SkipGraphRefresh)")
    public Object refreshAfterSuccessfulMutation(ProceedingJoinPoint call) throws Throwable {
        Object response = call.proceed();
        if (enabled) {
            try {
                graphSync.refresh();
            } catch (RuntimeException ex) {
                throw new GraphSyncException("Oracle accepted the change, but Neo4j could not be refreshed. Retry POST /api/graph/sync.", ex);
            }
        }
        return response;
    }
}
