/**
 * @file builder-agent-contracts-example.ts
 * @description Detailed contract examples showing the flow from Builder Agent
 * to specialized agents for building a "Healthcare Patient Management System"
 */

// ================================
// EXAMPLE: Build "Healthcare Patient Management System"
// ================================

// --- PHASE 1: Builder Agent Analysis ---
export const BUILDER_ANALYSIS_CONTRACT = {
  requirement: "Build a healthcare patient management system",
  analysis: {
    domain: "healthcare",
    complexity: "enterprise",
    capabilities: [
      "patient_records",
      "appointment_scheduling",
      "telemedicine_integration",
      "compliance_management",
      "analytics_dashboard",
      "multi_provider_support"
    ],
    challenges: [
      "HIPAA_compliance",
      "data_encryption",
      "audit_trails",
      "interoperability",
      "scalability"
    ],
    estimatedEffort: "3-6 months"
  }
};

// --- PHASE 2: Enhancement Areas Generated ---
export const ENHANCEMENT_AREAS_CONTRACTS = [
  {
    id: "auth-security",
    name: "Patient Authentication & Security",
    domain: "healthcare",
    priority: "critical",
    dependencies: [],
    estimatedComplexity: 8,
    objective: "Implement HIPAA-compliant authentication with multi-factor verification",
    keyRequirements: [
      "OAuth 2.0 + OpenID Connect",
      "Role-based access control (Patient, Provider, Admin)",
      "JWT tokens with encryption",
      "Session management with timeouts",
      "Audit logging for all access",
      "Password policies and complexity rules"
    ],
    implementation_plan: {
      modules: [
        "auth-service",
        "user-management",
        "session-handler",
        "audit-logger",
        "compliance-monitor"
      ],
      architecture: "Microservice with Redis for sessions, PostgreSQL for audit logs"
    },
    depends_on: [],
    sources: ["HIPAA Security Rule", "NIST Cybersecurity Framework"],
    governance: {
      security: "AES-256 encryption, TLS 1.3, regular security audits",
      compliance: "HIPAA, GDPR, SOC 2 compliance frameworks",
      ethics: "Patient privacy protection, data minimization principles"
    },
    validation_criteria: "100% test coverage, penetration testing passed, compliance audit"
  },

  {
    id: "patient-records",
    name: "Electronic Health Records (EHR)",
    domain: "healthcare",
    priority: "critical",
    dependencies: ["auth-security"],
    estimatedComplexity: 9,
    objective: "Build comprehensive patient record management with FHIR compliance",
    keyRequirements: [
      "Patient demographics and contact info",
      "Medical history and allergies",
      "Current medications and dosages",
      "Vital signs and measurements",
      "Lab results and imaging",
      "Clinical notes and progress notes",
      "Treatment plans and care coordination"
    ],
    implementation_plan: {
      modules: [
        "patient-demographics",
        "medical-history",
        "medication-tracker",
        "vital-signs-api",
        "lab-results-integration",
        "clinical-notes-editor",
        "care-plan-manager"
      ],
      architecture: "FHIR-based microservices with HL7 integration"
    },
    depends_on: ["auth-security"],
    sources: ["HL7 FHIR Specification", "HIPAA Privacy Rule", "EHR standards"],
    governance: {
      security: "End-to-end encryption, access controls, data backup",
      compliance: "HIPAA, Meaningful Use requirements, data retention policies",
      ethics: "Patient data ownership, consent management, transparency"
    },
    validation_criteria: "FHIR compliance validation, interoperability testing, data integrity checks"
  },

  {
    id: "appointment-system",
    name: "Appointment Scheduling & Management",
    domain: "healthcare",
    priority: "high",
    dependencies: ["auth-security", "patient-records"],
    estimatedComplexity: 7,
    objective: "Create intelligent appointment scheduling with provider availability",
    keyRequirements: [
      "Provider schedule management",
      "Patient appointment booking",
      "Automated reminders (SMS, email)",
      "Waitlist management",
      "Cancellation and rescheduling",
      "Telemedicine appointment support",
      "Calendar integration (Google, Outlook)"
    ],
    implementation_plan: {
      modules: [
        "schedule-manager",
        "booking-engine",
        "notification-service",
        "waitlist-handler",
        "calendar-integration",
        "availability-optimizer"
      ],
      architecture: "Event-sourced microservice with calendar API integrations"
    },
    depends_on: ["auth-security", "patient-records"],
    sources: ["Healthcare scheduling standards", "Patient access regulations"],
    governance: {
      security: "Secure API keys, encrypted communications",
      compliance: "Patient communication consent, data privacy",
      ethics: "Equal access principles, accommodation for disabilities"
    },
    validation_criteria: "Booking success rate >99%, notification delivery >98%"
  },

  {
    id: "telemedicine-platform",
    name: "Telemedicine Integration",
    domain: "healthcare",
    priority: "high",
    dependencies: ["auth-security", "appointment-system"],
    estimatedComplexity: 8,
    objective: "Integrate video conferencing and remote patient monitoring",
    keyRequirements: [
      "HD video calls with screen sharing",
      "Waiting room functionality",
      "Session recording for medical records",
      "Remote patient monitoring devices",
      "Integration with wearables (Fitbit, Apple Health)",
      "Prescription e-delivery",
      "Follow-up care coordination"
    ],
    implementation_plan: {
      modules: [
        "video-conference",
        "waiting-room",
        "session-recorder",
        "device-integration",
        "wearables-api",
        "e-prescription",
        "care-coordinator"
      ],
      architecture: "WebRTC-based platform with HL7 FHIR for device data"
    },
    depends_on: ["auth-security", "appointment-system"],
    sources: ["Telemedicine regulations", "Remote monitoring standards"],
    governance: {
      security: "End-to-end encrypted video, secure device data",
      compliance: "Telemedicine licensing, reimbursement regulations",
      ethics: "Digital health equity, informed consent for monitoring"
    },
    validation_criteria: "Video quality >1080p, <2 second latency, HIPAA compliance"
  },

  {
    id: "analytics-dashboard",
    name: "Healthcare Analytics Dashboard",
    domain: "healthcare",
    priority: "medium",
    dependencies: ["patient-records", "appointment-system"],
    estimatedComplexity: 6,
    objective: "Build comprehensive analytics for patient outcomes and operational efficiency",
    keyRequirements: [
      "Patient outcome metrics",
      "Provider performance analytics",
      "Appointment utilization rates",
      "Revenue cycle analytics",
      "Population health trends",
      "Quality measure reporting",
      "Custom dashboard builder"
    ],
    implementation_plan: {
      modules: [
        "metrics-collector",
        "analytics-engine",
        "dashboard-builder",
        "reporting-api",
        "alert-system",
        "data-visualization",
        "export-service"
      ],
      architecture: "Data warehouse with real-time dashboards and automated reporting"
    },
    depends_on: ["patient-records", "appointment-system"],
    sources: ["Healthcare quality measures", "Analytics best practices"],
    governance: {
      security: "Aggregated data only, no PHI in analytics",
      compliance: "De-identified data handling, audit trails",
      ethics: "Bias detection in algorithms, equitable outcome measurement"
    },
    validation_criteria: "Data accuracy >99.5%, dashboard load time <3 seconds"
  },

  {
    id: "api-gateway",
    name: "Healthcare API Gateway & Integration",
    domain: "healthcare",
    priority: "high",
    dependencies: ["auth-security"],
    estimatedComplexity: 7,
    objective: "Create secure API gateway for healthcare integrations",
    keyRequirements: [
      "OAuth 2.0 authorization server",
      "Rate limiting and throttling",
      "API versioning and documentation",
      "Third-party integrations (insurance, pharmacies)",
      "HL7 FHIR API endpoints",
      "Webhooks for real-time updates",
      "API analytics and monitoring"
    ],
    implementation_plan: {
      modules: [
        "oauth-server",
        "rate-limiter",
        "api-router",
        "fhir-endpoints",
        "webhook-manager",
        "integration-hub",
        "api-analytics"
      ],
      architecture: "Kong API Gateway with custom plugins for healthcare workflows"
    },
    depends_on: ["auth-security"],
    sources: ["HL7 FHIR API standards", "Healthcare interoperability frameworks"],
    governance: {
      security: "API key management, request signing, audit logs",
      compliance: "HITRUST, interoperability standards",
      ethics: "Data sharing consent, provider directory accuracy"
    },
    validation_criteria: "99.9% uptime, <500ms response time, full FHIR compliance"
  }
];

// --- PHASE 3: Architecture Design Contract ---
export const ARCHITECTURE_CONTRACT = {
  pattern: "microservices",
  components: [
    {
      name: "auth-service",
      type: "authentication",
      technologies: ["Node.js", "JWT", "Redis", "PostgreSQL"],
      responsibilities: ["User authentication", "Session management", "Access control"]
    },
    {
      name: "patient-service",
      type: "data-management",
      technologies: ["Java", "Spring Boot", "MongoDB", "Elasticsearch"],
      responsibilities: ["Patient records", "Medical history", "Search functionality"]
    },
    {
      name: "appointment-service",
      type: "scheduling",
      technologies: ["Python", "FastAPI", "PostgreSQL", "Redis"],
      responsibilities: ["Scheduling", "Calendar management", "Notifications"]
    },
    {
      name: "telemedicine-service",
      type: "communication",
      technologies: ["Node.js", "WebRTC", "Socket.io", "AWS Chime"],
      responsibilities: ["Video calls", "Screen sharing", "Session management"]
    },
    {
      name: "analytics-service",
      type: "business-intelligence",
      technologies: ["Python", "Apache Spark", "PostgreSQL", "Tableau"],
      responsibilities: ["Data analysis", "Reporting", "Dashboards"]
    },
    {
      name: "api-gateway",
      type: "integration",
      technologies: ["Kong", "Lua", "Redis", "JWT"],
      responsibilities: ["API routing", "Authentication", "Rate limiting"]
    }
  ],
  dataFlow: [
    { from: "frontend", to: "api-gateway", protocol: "HTTPS/REST" },
    { from: "api-gateway", to: "auth-service", protocol: "gRPC" },
    { from: "auth-service", to: "patient-service", protocol: "message-queue" },
    { from: "patient-service", to: "analytics-service", protocol: "event-streaming" }
  ],
  integrations: [
    { service: "Epic EHR", purpose: "Patient data sync", provider: "Epic Systems" },
    { service: "Change Healthcare", purpose: "Claims processing", provider: "Change Healthcare" },
    { service: "Twilio", purpose: "SMS notifications", provider: "Twilio" },
    { service: "Stripe", purpose: "Payment processing", provider: "Stripe" }
  ]
};

// --- PHASE 4: Tech Stack Selection ---
export const TECH_STACK_CONTRACT = {
  frontend: ["React", "TypeScript", "Next.js", "Tailwind CSS", "React Query"],
  backend: ["Node.js", "Python", "Java", "FastAPI", "Spring Boot", "Express"],
  database: ["PostgreSQL", "MongoDB", "Redis", "Elasticsearch"],
  infrastructure: ["AWS ECS", "Kubernetes", "Docker", "Terraform", "CloudFormation"],
  monitoring: ["DataDog", "New Relic", "AWS CloudWatch", "ELK Stack"]
};

// --- PHASE 5: Code Generation Contracts ---
export const CODE_GENERATION_CONTRACTS = {
  auth_service: {
    language: "typescript",
    framework: "express",
    files: [
      "src/controllers/auth.controller.ts",
      "src/models/user.model.ts",
      "src/routes/auth.routes.ts",
      "src/middleware/auth.middleware.ts",
      "src/services/jwt.service.ts",
      "src/services/audit.service.ts",
      "tests/auth.controller.test.ts"
    ],
    dependencies: ["jsonwebtoken", "bcrypt", "redis", "pg"],
    api_endpoints: [
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "POST /api/auth/refresh",
      "GET /api/auth/me",
      "POST /api/auth/mfa/verify"
    ]
  },

  patient_service: {
    language: "java",
    framework: "spring-boot",
    files: [
      "src/main/java/com/healthcare/patient/PatientController.java",
      "src/main/java/com/healthcare/patient/PatientService.java",
      "src/main/java/com/healthcare/patient/PatientRepository.java",
      "src/main/java/com/healthcare/patient/PatientModel.java",
      "src/test/java/com/healthcare/patient/PatientControllerTest.java"
    ],
    dependencies: ["spring-boot-starter-web", "spring-boot-starter-data-jpa", "postgresql"],
    api_endpoints: [
      "GET /api/patients/{id}",
      "POST /api/patients",
      "PUT /api/patients/{id}",
      "DELETE /api/patients/{id}",
      "GET /api/patients/{id}/history"
    ]
  },

  appointment_service: {
    language: "python",
    framework: "fastapi",
    files: [
      "app/main.py",
      "app/models/appointment.py",
      "app/routes/appointments.py",
      "app/services/scheduler.py",
      "app/services/notifications.py",
      "tests/test_appointments.py"
    ],
    dependencies: ["fastapi", "sqlalchemy", "alembic", "celery", "twilio"],
    api_endpoints: [
      "GET /api/appointments",
      "POST /api/appointments",
      "PUT /api/appointments/{id}",
      "DELETE /api/appointments/{id}",
      "POST /api/appointments/{id}/remind"
    ]
  }
};

// --- PHASE 6: Infrastructure Contracts ---
export const INFRASTRUCTURE_CONTRACT = {
  platform: "aws",
  networking: {
    vpc: {
      cidr: "10.0.0.0/16",
      subnets: {
        public: ["10.0.1.0/24", "10.0.2.0/24"],
        private: ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
      }
    },
    security_groups: [
      {
        name: "api-gateway-sg",
        rules: [
          { type: "ingress", protocol: "tcp", port: 80, source: "0.0.0.0/0" },
          { type: "ingress", protocol: "tcp", port: 443, source: "0.0.0.0/0" }
        ]
      }
    ]
  },
  compute: {
    ecs_cluster: {
      name: "healthcare-cluster",
      services: [
        {
          name: "auth-service",
          cpu: "512",
          memory: "1024",
          desired_count: 3,
          auto_scaling: { min: 2, max: 10, target_cpu: 70 }
        },
        {
          name: "patient-service",
          cpu: "1024",
          memory: "2048",
          desired_count: 5,
          auto_scaling: { min: 3, max: 15, target_cpu: 75 }
        }
      ]
    }
  },
  database: {
    rds: {
      engine: "postgres",
      version: "15.4",
      instance_class: "db.r6g.large",
      multi_az: true,
      backup_retention: 30,
      encryption: true
    },
    elasticache: {
      engine: "redis",
      node_type: "cache.t3.medium",
      num_cache_clusters: 2
    },
    opensearch: {
      version: "2.7",
      instance_type: "t3.medium.search",
      instance_count: 3,
      ebs_enabled: true,
      volume_size: 20
    }
  },
  storage: {
    s3_buckets: [
      {
        name: "healthcare-patient-docs",
        versioning: true,
        encryption: "AES256",
        lifecycle_rules: [
          { prefix: "temp/", expiration_days: 7 },
          { prefix: "archive/", transition_to_glacier_days: 90 }
        ]
      }
    ]
  },
  cdn: {
    cloudfront: {
      origins: ["api-gateway", "frontend-app"],
      behaviors: [
        { path_pattern: "/api/*", origin: "api-gateway", cache_policy: "api-cache" },
        { path_pattern: "/*", origin: "frontend-app", cache_policy: "frontend-cache" }
      ]
    }
  }
};

// --- PHASE 7: Deployment Contracts ---
export const DEPLOYMENT_CONTRACT = {
  pipeline: [
    "checkout-code",
    "security-scan",
    "build-containers",
    "run-tests",
    "deploy-staging",
    "integration-tests",
    "deploy-production",
    "health-checks",
    "notify-stakeholders"
  ],
  environments: {
    staging: {
      region: "us-east-1",
      domain: "staging.healthcare-platform.com",
      database: "staging-db",
      monitoring: "staging-datadog"
    },
    production: {
      region: "us-east-1",
      domain: "app.healthcare-platform.com",
      database: "prod-db",
      monitoring: "prod-datadog",
      backup_regions: ["us-west-2", "eu-west-1"]
    }
  },
  monitoring: {
    alerts: [
      { metric: "api_latency", threshold: 500, severity: "warning" },
      { metric: "error_rate", threshold: 0.01, severity: "critical" },
      { metric: "database_connections", threshold: 80, severity: "warning" }
    ],
    dashboards: [
      "system-overview",
      "api-performance",
      "database-metrics",
      "user-activity",
      "security-events"
    ]
  },
  scaling: {
    strategy: "horizontal-pod-autoscaling",
    metrics: ["cpu_utilization", "memory_utilization", "request_rate"],
    policies: [
      {
        name: "scale-up",
        conditions: [{ metric: "cpu_utilization", operator: ">", value: 70 }],
        action: { type: "scale", direction: "up", amount: 2 }
      },
      {
        name: "scale-down",
        conditions: [{ metric: "cpu_utilization", operator: "<", value: 30 }],
        action: { type: "scale", direction: "down", amount: 1 }
      }
    ]
  }
};

/*
This shows the COMPLETE contract flow:

1. Natural Language Input
   ↓
2. Builder Agent Analysis (domain, complexity, capabilities)
   ↓
3. Enhancement Areas (6 detailed contracts with dependencies)
   ↓
4. Architecture Design (microservices pattern, components, data flow)
   ↓
5. Tech Stack Selection (React, Node.js, PostgreSQL, AWS, etc.)
   ↓
6. Code Generation (actual file structures, API endpoints, dependencies)
   ↓
7. Infrastructure Setup (VPC, ECS, RDS, CloudFront, security groups)
   ↓
8. Deployment Pipeline (CI/CD, environments, monitoring, scaling)

Each contract is machine-readable, validated by Zod schemas, and
contains all the implementation details needed to build production systems.
*/
