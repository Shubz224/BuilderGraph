/**
 * JSON-LD Converters for BuilderGraph
 * Aligned with OriginTrail DKG best practices
 */

import { randomUUID } from 'crypto';

/**
 * Convert profile form data to JSON-LD (Schema.org Person)
 * @param {Object} profileData - Profile form data
 * @returns {Object} JSON-LD formatted profile with @graph structure
 */
export function profileToJSONLD(profileData) {
    const userId = `https://buildergraph.com/user/${profileData.username}`;

    const person = {
        '@type': ['schema:Person', 'foaf:Person', 'prov:Agent'],
        '@id': userId,
        'schema:name': profileData.fullName,
        'foaf:name': profileData.fullName,
        'schema:alternateName': profileData.username,
        'foaf:nick': profileData.username,
        'schema:email': profileData.email,
        'schema:identifier': [
            {
                '@type': 'schema:PropertyValue',
                'schema:propertyID': 'username',
                'schema:value': profileData.username
            },
            {
                '@type': 'schema:PropertyValue',
                'schema:propertyID': 'platform',
                'schema:value': 'buildergraph'
            }
        ],
        'schema:dateCreated': new Date().toISOString(),
        'prov:generatedAtTime': new Date().toISOString()
    };

    // Add optional address
    if (profileData.location) {
        person['schema:address'] = {
            '@type': 'schema:PostalAddress',
            'schema:addressLocality': profileData.location
        };
    }

    // Add bio/description
    if (profileData.bio) {
        person['schema:description'] = profileData.bio;
    }

    // Add skills as expertise
    if (profileData.skills && Array.isArray(profileData.skills)) {
        person['schema:knowsAbout'] = profileData.skills;
    }

    // Add experience
    if (profileData.experience) {
        person['schema:additionalProperty'] = {
            '@type': 'schema:PropertyValue',
            'schema:name': 'yearsExperience',
            'schema:value': profileData.experience
        };
    }

    // Add GitHub link
    if (profileData.githubUsername) {
        person['schema:sameAs'] = `https://github.com/${profileData.githubUsername}`;
        person['foaf:account'] = {
            '@type': 'foaf:OnlineAccount',
            'foaf:accountServiceHomepage': 'https://github.com',
            'foaf:accountName': profileData.githubUsername
        };
    }

    return {
        '@context': {
            'schema': 'https://schema.org/',
            'foaf': 'http://xmlns.com/foaf/0.1/',
            'prov': 'http://www.w3.org/ns/prov#'
        },
        '@graph': [person]
    };
}

/**
 * Convert project form data to JSON-LD (Schema.org SoftwareSourceCode)
 * @param {Object} projectData - Project form data
 * @param {string} userUal - User's UAL to link as creator
 * @returns {Object} JSON-LD formatted project with @graph structure
 */
export function projectToJSONLD(projectData, userUal) {
    const projectId = `https://buildergraph.com/project/${projectData.slug || Date.now()}`;

    const project = {
        '@type': ['schema:SoftwareSourceCode', 'schema:CreativeWork', 'prov:Entity'],
        '@id': projectId,
        'schema:name': projectData.name,
        'schema:description': projectData.description,
        'schema:codeRepository': projectData.repositoryUrl,
        'schema:dateCreated': new Date().toISOString(),
        'schema:datePublished': new Date().toISOString(),
        'prov:generatedAtTime': new Date().toISOString(),
        'schema:identifier': {
            '@type': 'schema:PropertyValue',
            'schema:propertyID': 'projectId',
            'schema:value': projectData.slug || projectId
        }
    };

    // Add tech stack as programming languages
    if (projectData.techStack) {
        const techArray = Array.isArray(projectData.techStack)
            ? projectData.techStack
            : projectData.techStack.split(',').map(t => t.trim());
        project['schema:programmingLanguage'] = techArray;
    }

    // Add category
    if (projectData.category) {
        project['schema:applicationCategory'] = projectData.category;
    }

    // Add live URL
    if (projectData.liveUrl) {
        project['schema:url'] = projectData.liveUrl;
    }

    // Link to creator (user profile) via UAL - bidirectional
    if (userUal) {
        project['schema:creator'] = {
            '@id': userUal
        };
        project['prov:wasAttributedTo'] = {
            '@id': userUal
        };
    }

    // Add license if provided
    if (projectData.license) {
        project['schema:license'] = projectData.license;
    }

    // Add star count or metrics if available
    if (projectData.stars !== undefined) {
        project['schema:interactionStatistic'] = {
            '@type': 'schema:InteractionCounter',
            'schema:interactionType': 'https://schema.org/LikeAction',
            'schema:userInteractionCount': projectData.stars
        };
    }

    return {
        '@context': {
            'schema': 'https://schema.org/',
            'prov': 'http://www.w3.org/ns/prov#'
        },
        '@graph': [project]
    };
}

/**
 * Create a static+temporal split for a project
 * (Following DKG guide pattern for separating unchanging vs time-series data)
 */
export function projectWithTemporalData(projectData, userUal, metricsData) {
    const staticData = projectToJSONLD(projectData, userUal);

    const temporalData = {
        '@context': {
            'schema': 'https://schema.org/',
            'prov': 'http://www.w3.org/ns/prov#'
        },
        '@graph': [
            {
                '@type': ['prov:Entity', 'schema:Observation'],
                '@id': `urn:uuid:${randomUUID()}`,
                'prov:generatedAtTime': new Date().toISOString(),
                'schema:observationDate': new Date().toISOString(),
                'schema:about': {
                    '@id': staticData['@graph'][0]['@id']
                },
                'prov:specializationOf': {
                    '@id': staticData['@graph'][0]['@id']
                },
                'schema:interactionStatistic': [
                    {
                        '@type': 'schema:InteractionCounter',
                        'schema:interactionType': 'https://schema.org/LikeAction',
                        'schema:userInteractionCount': metricsData.stars || 0
                    },
                    {
                        '@type': 'schema:InteractionCounter',
                        'schema:interactionType': 'https://schema.org/WatchAction',
                        'schema:userInteractionCount': metricsData.watchers || 0
                    }
                ],
                'schema:variableMeasured': [
                    {
                        '@type': 'schema:PropertyValue',
                        'schema:name': 'forks',
                        'schema:value': metricsData.forks || 0
                    },
                    {
                        '@type': 'schema:PropertyValue',
                        'schema:name': 'issues',
                        'schema:value': metricsData.openIssues || 0
                    },
                    {
                        '@type': 'schema:PropertyValue',
                        'schema:name': 'commits',
                        'schema:value': metricsData.commits || 0
                    }
                ]
            }
        ]
    };

    return { staticData, temporalData };
}

/**
 * Convert endorsement to JSON-LD (Schema.org Review/Endorsement)
 * @param {Object} endorsementData - Endorsement data
 * @returns {Object} JSON-LD formatted endorsement
 */
export function endorsementToJSONLD(endorsementData) {
    const endorsementId = `https://buildergraph.com/endorsement/${endorsementData.id || Date.now()}`;

    const endorsement = {
        '@type': ['schema:Review', 'schema:Endorsement', 'prov:Entity'],
        '@id': endorsementId,
        'schema:author': {
            '@id': endorsementData.endorserUAL,
            'schema:name': endorsementData.endorserName,
            'schema:identifier': endorsementData.endorserUsername
        },
        'schema:itemReviewed': {
            '@id': endorsementData.targetId,
            'schema:name': endorsementData.targetName || endorsementData.targetUsername
        },
        'schema:reviewRating': {
            '@type': 'schema:Rating',
            'schema:ratingValue': endorsementData.rating,
            'schema:bestRating': 5,
            'schema:worstRating': 1
        },
        'schema:reviewBody': endorsementData.message,
        'schema:dateCreated': new Date().toISOString(),
        'prov:generatedAtTime': new Date().toISOString()
    };

    // Add the specific skill or project being endorsed
    if (endorsementData.targetType === 'skill') {
        endorsement['schema:about'] = {
            '@type': 'schema:Thing',
            'schema:name': endorsementData.skillName
        };
    } else if (endorsementData.targetType === 'project') {
        endorsement['schema:about'] = {
            '@type': 'schema:SoftwareSourceCode',
            '@id': endorsementData.targetId
        };
    }

    // Add TRAC stake and metadata
    endorsement['schema:additionalProperty'] = [
        {
            '@type': 'schema:PropertyValue',
            'schema:propertyID': 'endorsementType',
            'schema:value': endorsementData.targetType
        },
        {
            '@type': 'schema:PropertyValue',
            'schema:propertyID': 'tracStaked',
            'schema:value': endorsementData.tracStaked
        },
        {
            '@type': 'schema:PropertyValue',
            'schema:propertyID': 'status',
            'schema:value': endorsementData.withdrawn ? 'withdrawn' : 'active'
        }
    ];

    return {
        '@context': {
            'schema': 'https://schema.org/',
            'prov': 'http://www.w3.org/ns/prov#'
        },
        '@graph': [endorsement]
    };
}

export default {
    profileToJSONLD,
    projectToJSONLD,
    projectWithTemporalData,
    endorsementToJSONLD
};
