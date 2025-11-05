n the Apache Kafka world, it is not always easy to unify all the bits and bolts of message compatibility across multiple microservices. Proper API versioning and ensuring compatibility between different versions helps, but the full picture needs to incorporate the application life cycle from development to production.

This article introduces an API-driven, contract-first approach to managing the application life cycle. We'll use Red Hat's supported version of Apicurio Service Registry as a centralized registry, which we'll integrate with version-controlled API schema definitions for Apache Kafka consumers and producers in a multi-staging environment.

Prerequisites
The example setup for this demonstration requires the following Red Hat components:

Red Hat AMQ Streams 1.7 to deploy Apache Kafka as a streaming platform.
Red Hat Integration Service Registry 2.0, based on Apicurio, to store and maintain API schema definitions.
Red Hat OpenShift 4.7, based on Kubernetes, as the platform to run these components.
I used Spring Boot to develop the Java client applications for this demonstration. Find the example code in my GitHub repository.

API versioning and the importance of compatibility
The majority of API versioning and implementation concepts are based on synchronous APIs, which provide an immediate response indicating success or failure. Apache Kafka is different, mainly for two reasons: First, Kafka producers and consumers communicate asynchronously. Therefore, the producer does not know if its message was received and understood by a consumer. Second, Kafka is not aware of any data structure or API schema definition.

Red Hat Integration Service Registry (Apicurio) helps us overcome these challenges and adds capabilities to support a contract-first workflow. (See Event-driven APIs and schema governance for Apache Kafka: Get ready for Kafka Summit Europe 2021 for more about contract-first workflows.)

Using versioned API schema definitions alongside a contract-first approach is the first step to implement a resilient architecture for your microservices and ensure scalability across multiple development teams. Service Registry adds common validity and compatibility rules for API schema definition governance, which help to ensure compatibility between producers and consumers in your deployment. The Service Registry dialog in Figure 1 shows these features.

Service Registry features to govern validity and compatibility rules.
Figure 1: Service Registry features for governing validity and compatibility rules.
Using Service Registry's compatibility checks supports developers in evolving and adapting API implementation at the fast pace businesses require. In the next section, we'll look at one scenario for managing the life cycle of versioned APIs across multiple environments.

Using a centralized service registry
A centralized service registry, illustrated in Figure 2, has the advantage of acting as a single source of truth. All connected clients share the same knowledge about how to communicate with each other, and we can leverage this truth to use it not only in an isolated environment but within a staging process from development to production.

Architecture of a centralized Service Registry.
Figure 2: The architecture of a centralized Service Registry.
 
Figure 2 depicts a centralized Service Registry instance that serves three different environments, each with a Kafka instance and its associated producers and consumers. The staging in this simplified example is implemented in the following order: DEV (development) —> UAT (user acceptance test) —> PROD (production).

From a developer perspective, DEV always uses the most recent version of an API schema definition (called an artifact in Service Registry) and PROD always uses a stable, well-tested definition. In other words, each client is bound (or pinned) to an artifact version per environment. Because of this, producers and consumers typically need to use the same version or a compatible one. (Some exceptions apply when using a SerDes function, like Avro, but I won't discuss that scenario here.)

To complete the centralized service registry use case, an artifact maps to a specific topic in Kafka, using a resolver strategy, where the implementation is done in the clients. Note that the example in the DEV environment uses version 4 (v4) on the producer side while the consumer is already using version 5 (v5). This is not a mistake, as I will explain in more detail in the next section.

API schema management in the software development life cycle
The architectural example illustrated in Figure 2 takes a consumer-driven contract approach to ensuring compatibility between producers and consumers. In Service Registry, this compatibility setting is called "backward” and is used by default when you activate Service Registry's compatibility rules. The Backward setting, shown in Figure 1, means that the consumer expresses its expectations towards the producer and leads the used artifact versions (v5 in our example).

Regarding the development life cycle, this would mean that the API schema definition is maintained and updated in Service Registry by the consumer, ideally in an automated fashion with a continuous deployment (CI/CD) pipeline.

Figure 3 shows a practical example of the process for both the consumer and producer.

A CI/CD workflow illustrated.
Figure 3: An illustration of the CI/CD workflow.
Next, we will look at the details of how to implement this architecture.

Note: See Getting started with Red Hat Integration Service Registry for an introduction to setting up Kafka clients using Service Registry. See Integrating Spring Boot with Red Hat Integration Service Registry for setting up Spring Boot.

Integrating Service Registry in the development workflow
Using Maven plugins makes it easy to generate POJO (plain old Java object) classes and manage the uploads and downloads to Service Registry.

For POJO generation, the avro-maven-plugin will do the job. You can add the plugin to your pom.xml as a profile:

  <profiles>
    <profile>
      <id>avro</id>
      <build>
        <plugins>
          <plugin>
            <groupId>org.apache.avro</groupId>
            <artifactId>avro-maven-plugin</artifactId>
            <version>2.0.0.Final</version>
            <executions>
              <execution>
                <phase>generate-sources</phase>
                <goals>
                  <goal>schema</goal>
                </goals>
                <configuration>
                  <sourceDirectory>${project.basedir}/../schema/</sourceDirectory>
                  <outputDirectory>${project.basedir}/src/main/java/</outputDirectory>
                </configuration>
              </execution>
            </executions>
          </plugin>
        </plugins>
      </build>
    </profile>
Copy snippet
In the same way, we can use the apicurio-registry-maven-plugin to upload and download registry artifacts:

  <profile>
      <id>upload</id>
      <build>
        <plugins>
          <plugin>
            <groupId>io.apicurio</groupId>
            <artifactId>apicurio-registry-maven-plugin</artifactId>
            <version>2.0.0.Final</version>
            <executions>
              <execution>
                <phase>generate-sources</phase>
                <goals>
                  <goal>register</goal>
                </goals>
                <configuration>
                  <registryUrl>${apicurio.registry.url}</registryUrl>
                  <artifactType>AVRO</artifactType>
                  <artifacts>
                    <artifact>
                      <groupId>com.redhat.apicuriokafkademo.schema.avro</groupId>
                      <artifactId>Event</artifactId>
                      <file>${project.basedir}/../schema/event.avsc</file>
                    </artifact>
                  </artifacts>
                </configuration>
              </execution>
            </executions>
          </plugin>
        </plugins>
      </build>
    </profile>
Copy snippet
During the registration process, Service Registry checks the uploaded artifact against the configured validity and compatibility rules automatically. A new version will be created only if no violation is detected.

Managing API schema versions
Service Registry gives us the tools to manage the API schemas, so it is time to look at the API schema versions. Service Registry 2.0 introduces a feature that lets us configure a version for the artifact used. As shown below, we can do this simply by setting kafka.producer.properties.apicurio.registry.artifact.version to the desired version together with the previously mentioned resolver strategy. Of course, this will only work if Service Registry has the artifact in the selected version stored as a reference.

spring:
  kafka:
    producer:
      bootstrap-servers: localhost:9092
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: io.apicurio.registry.serde.avro.AvroKafkaSerializer
      properties:
        apicurio:
          registry:
            url: http://localhost:8181/apis/registry/v2
            artifact-resolver-strategy: io.apicurio.registry.serde.avro.strategy.RecordIdStrategy
            artifact:
              version: "1"
Copy snippet
Note: The complete sample application source code for this article includes a Spring Boot consumer/producer client application based on the centralized registry scenario. For an all-in-one Quarkus and Spring Boot demonstration, see Fabian Martinez's example Git project, which was presented at Kafka Summit Europe 2021.

When a change breaks compatibility
As we learned, managing compatibility between API versions is great to ensure consistency and stable communication between clients in a Kafka environment. But the reality is not always that easy. Sooner or later, someone will need to introduce changes in the API schema definition, breaking the compatibility rules enforced by Service Registry. This is usually the case when a message body introduces significant changes.

In such a situation, we should not simply switch off the Service Registry compatibility check to update the existing definition. To maintain the existing compatibility and avoid a breaking change, we can simply introduce a new artifact alongside a new Kafka topic. The new and the old messages will live in parallel in different Kafka topics and the clients can selectively choose which data to process. If all clients (producer and consumers) eventually migrate to only use the latest message format, the old topic will be retired.

Figure 4 illustrates a scenario where we introduce a breaking change in the Kafka environment.

A breaking change is introduced to the Apicurio workflow.
Figure 4: Introducing a breaking change.
In this example, the artifact event_1 was updated in the past and therefore v4 is used. The artifact event_2 would introduce a change, which would break Service Registry's compatibility rules. Therefore, a new artifact is created, starting with a new version, v1.

Using suffixes or prefixes is a common approach. On top of this, Service Registry allows you to use group IDs, which makes it easy to identify schema relations.

In a cloud-native environment, such as Red Hat OpenShift, it is also best practice to keep the application code footprint small and maintainable. A good approach is to create a new version of the clients (producer and consumer), which will implement the use of the new artifact and Kafka topic exclusively. This approach is preferable to having a single client use both artifacts and connect to both Kafka topics.

Tools for contract-first API development
Contract-first API development in an event-driven architecture is not a new concept, but as more enterprises adopt cloud-native platforms like OpenShift, this architecture is gaining the attention of a broader audience. Existing data silos (known as data warehouse) are transitioning into event-driven architectures. Very often, clearly defined APIs, which did not exist in the past, must now be designed and developed to support the migration.

To ease the pain of this transition, mocking APIs allows a very rapid evaluation of the designed architecture. Tools like Microcks can help to speed up the development process, especially within an AsyncAPI environment.

Note: See How Microcks Can Speed-Up Your AsyncAPI Adoption and Simulating CloudEvents with AsyncAPI and Microcks for more about using Microcks and AsyncAPI.

Integrating automated tests into your CI/CD pipeline is also key to managing the API life cycle. Pact is an open source tool that applies a contract-based testing approach that is useful for managing the API life cycle.

Summary
In this article, we've looked at a practical approach to managing API schema definitions using a centralized Service Registry instance in a multi-staging environment. We used the versioning feature introduced in Service Registry 2.0 to pin a schema to a specific version, and also briefly discussed the concept of consumer-driven contracts, supported by Service Registry's compatibility rules. Finally, we looked at a way to handle changes that break the compatibility rules.