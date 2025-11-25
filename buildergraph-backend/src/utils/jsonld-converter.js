/**
 * JSON-LD Converters for BuilderGraph
 * Converts form data to Schema.org JSON-LD format
 */

/**
 * Convert profile form data to JSON-LD (Schema.org Person)
 * @param {Object} profileData - Profile form data
 * @returns {Object} JSON-LD formatted profile
 */
export function profileToJSONLD(profileData) {
    const jsonld = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profileData.fullName,
        alternateName: profileData.username,
        email: profileData.email
    };

    // Add optional fields
    if (profileData.location) {
        jsonld.address = {
            '@type': 'PostalAddress',
            addressLocality: profileData.location
        };
    }

    if (profileData.bio) {
        jsonld.description = profileData.bio;
    }

    if (profileData.skills && Array.isArray(profileData.skills)) {
        jsonld.knowsAbout = profileData.skills;
    }

    if (profileData.githubUsername) {
        jsonld.sameAs = `https://github.com/${profileData.githubUsername}`;
    }

    // Add metadata
    jsonld.dateCreated = new Date().toISOString();
    jsonld.identifier = profileData.username;

    return jsonld;
}

/**
 * Convert project form data to JSON-LD (Schema.org SoftwareSourceCode)
 * @param {Object} projectData - Project form data
 * @param {string} userUal - User's UAL to link as creator
 * @returns {Object} JSON-LD formatted project
 */
export function projectToJSONLD(projectData, userUal) {
    const jsonld = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: projectData.name,
        description: projectData.description,
        codeRepository: projectData.repositoryUrl
    };

    // Add tech stack as programming languages
    if (projectData.techStack) {
        const techArray = Array.isArray(projectData.techStack)
            ? projectData.techStack
            : projectData.techStack.split(',').map(t => t.trim());
        jsonld.programmingLanguage = techArray;
    }

    // Add category
    if (projectData.category) {
        jsonld.applicationCategory = projectData.category;
    }

    // Add live URL
    if (projectData.liveUrl) {
        jsonld.url = projectData.liveUrl;
    }

    // Link to creator (user profile) via UAL
    if (userUal) {
        jsonld.creator = {
            '@id': userUal
        };
    }

    // Add metadata
    jsonld.dateCreated = new Date().toISOString();
    jsonld.datePublished = new Date().toISOString();

    return jsonld;
}

export default {
    profileToJSONLD,
    projectToJSONLD
};
