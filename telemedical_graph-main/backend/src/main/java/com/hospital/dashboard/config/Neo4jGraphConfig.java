package com.hospital.dashboard.config;

import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Creates a separate Bolt driver only when graph features are enabled. Oracle
 * remains the application's primary relational datasource; no transaction is
 * shared between the two databases.
 */
@Configuration
public class Neo4jGraphConfig {

    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(name = "app.neo4j.enabled", havingValue = "true")
    public Driver neo4jDriver(
            @Value("${app.neo4j.uri}") String uri,
            @Value("${app.neo4j.username}") String username,
            @Value("${app.neo4j.password}") String password) {
        return GraphDatabase.driver(uri, AuthTokens.basic(username, password));
    }
}
