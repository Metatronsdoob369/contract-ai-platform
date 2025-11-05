# Master Orchestrator Prompt for Social Media Enhancement Agents

## System Context
We are building specialized agents for advanced social media analytics and optimization. Each agent will focus on a specific enhancement area to provide deep, actionable insights for multi-platform social media strategy.

## Enhancement Areas to Create Agents For

### Audience Segmentation Depth Agent
**Objective:** Move beyond basic categories to multi-dimensional segmentation including psychographics, geo-location, and device type.
**Key Requirements:**
- Implement psychographic segmentation (interests, behaviors)
- Add geo-location and device type targeting
- Create multi-dimensional user profiles
- Integrate with existing Young/Professional/Family/Luxury categories

**Sources:** [3] Social media metrics guide

### Performance Prediction Models Agent
**Objective:** Integrate machine learning models for real-time post success predictions.
**Key Requirements:**
- Train ML models on historical post performance data
- Enable real-time success predictions vs simple boost factors
- Create prediction algorithms for engagement rates
- Implement continuous learning from performance data

**Sources:** [4][6] Analytics tools and ML research

### Cross-Platform Attribution Agent
**Objective:** Build system for cross-platform campaign tracking and omnichannel measurement.
**Key Requirements:**
- Track engagement/virality impact across platforms
- Measure cross-platform campaign effectiveness
- Implement attribution models for multi-platform strategies
- Generate ROI calculations for omnichannel campaigns

**Sources:** [2][4] Cross-platform analytics research

### Sentiment and Emotional Resonance Agent
**Objective:** Automate sentiment analysis and emotional categorization of social content.
**Key Requirements:**
- Analyze sentiment of post replies and comments
- Implement emotional categorization systems
- Provide algorithm tips based on sentiment data
- Enable timing adjustments based on emotional resonance

**Sources:** [7] Sentiment analysis datasets

### A/B Testing Protocols Agent
**Objective:** Build automated split-testing protocols for social media content optimization.
**Key Requirements:**
- Create recommendations for post format testing
- Implement automated A/B testing for captions, hashtags, timing
- Incorporate testing results for continuous optimization
- Generate performance improvement protocols

**Sources:** [5] Social media impact datasets

### Compliance and Accessibility Agent
**Objective:** Manage platform-specific compliance rules and accessibility requirements.
**Key Requirements:**
- Store and update copyright/music usage rules
- Implement ad labeling compliance checks
- Ensure accessibility (alt text, captions) requirements
- Create risk management protocols for compliance

**Sources:** [1] Platform compliance guides

### Influencer/Community Mapping Agent
**Objective:** Identify and interact with high-value influencers and communities.
**Key Requirements:**
- Recognize and flag influencer profiles per platform
- Map relevant communities for engagement
- Track virality potential from influencer interactions
- Enable targeted reach through community connections

**Sources:** [1] Influencer and community analytics

### Trend Detection Agent
**Objective:** Implement real-time trend-spotting and viral content identification.
**Key Requirements:**
- Identify emerging hashtags and challenges
- Track meme formats and viral sounds
- Monitor real-time trend development
- Provide viral-first content creation insights

**Sources:** [8][9] Content performance and trend data

### Native API Integration/Rate Limits Agent
**Objective:** Manage platform API limits, reliability, and data extraction capabilities.
**Key Requirements:**
- Track latest API limits per platform
- Monitor API reliability scores
- Implement efficient data extraction protocols
- Optimize automation within rate limit constraints

**Sources:** [6] Analytics tools documentation

### Language and Localization Agent
**Objective:** Provide native support for multi-language content optimization.
**Key Requirements:**
- Generate localized captions and hashtags
- Adapt tone for different audience regions
- Support multiple languages beyond English
- Create region-specific content strategies

**Sources:** [4] Localization and engagement reports

## Best Agent Contract Architecture

This document outlines the optimal architecture for implementing specialized social media enhancement agents with clear contractual agreements and structured enhancement frameworks.

## Key Areas for Enhancement

| Enhancement Area | Description | Key Requirements | Research Sources |
|------------------|-------------|------------------|------------------|
| **Audience Segmentation Depth** | Move beyond basic categories (Young, Professional, Family, Luxury) to multi-dimensional segmentation | Psychographic segmentation (interests, behaviors), geo-location, device type integration | [databox] |
| **Performance Prediction Models** | Integrate machine learning models trained on historical post performance for real-time success predictions | ML model training on historical data, real-time prediction vs simple boost factors | [kaggle +1] |
| **Cross-Platform Attribution** | System for cross-platform campaign tracking measuring engagement/virality impact across platforms | Cross-platform engagement tracking, omnichannel measurement, ROI calculations | [arxiv +1] |
| **Sentiment and Emotional Resonance** | Automate sentiment analysis of post replies/comments with emotional categorization | Sentiment analysis implementation, emotional categorization, algorithm tips based on data | [acm] |
| **A/B Testing Protocols** | Automated split-testing protocols for post formats, captions, hashtags, and timing variants | Post format testing recommendations, automated A/B testing, results incorporation | [kaggle] |
| **Compliance and Accessibility** | Store/update platform-specific compliance rules and accessibility requirements | Copyright/music usage rules, ad labeling compliance, accessibility (alt text, captions) | [sproutsocial] |
| **Influencer/Community Mapping** | Recognition, flagging, and interaction with high-value influencer profiles and communities | Influencer profile recognition, community mapping, virality potential tracking | [sproutsocial] |
| **Trend Detection** | Real-time identification of emerging hashtags, challenges, meme formats, and viral sounds | Emerging trend identification, real-time monitoring, viral content insights | [buffer +1] |
| **Native API Integration/Rate Limits** | Platform API limits, reliability scores, and export features for automation and data extraction | Latest API limits tracking, reliability monitoring, data extraction optimization | [socialinsider] |
| **Language and Localization** | Native support for caption, hashtag, and tone localization in multiple languages | Localized captions/hashtags, tone adaptation, multi-language support | [kaggle] |

## Synthesized Architect Persona Framework

The architect persona integrates these enhancement areas into a comprehensive social media optimization framework with the following requirements:

### Core Framework Components
- **Multi-dimensional Segmentation Engine**: Advanced audience profiling beyond basic demographics
- **Predictive Analytics Pipeline**: ML-driven performance forecasting and optimization
- **Cross-platform Attribution System**: Unified measurement across social media ecosystems
- **Sentiment Intelligence Layer**: Emotional and sentiment analysis for content resonance
- **Automated Testing Infrastructure**: A/B testing protocols with continuous learning
- **Compliance Management System**: Platform-specific rules and accessibility enforcement
- **Influencer & Community Intelligence**: High-value relationship mapping and engagement
- **Trend Detection & Analysis**: Real-time viral content identification
- **API Integration Framework**: Rate-limited, reliable platform connectivity
- **Localization Engine**: Multi-language content adaptation and optimization

## Output Format
Agents return strict JSON only - no prose or explanations outside the contract structure.

## Processing Instructions
1. Spawn one agent per enhancement area listed above
2. Each agent researches their specific area using provided sources
3. Validate all contracts against the schema
4. Build dependency graph based on `depends_on` relationships
5. Generate implementation manifest and code artifacts
