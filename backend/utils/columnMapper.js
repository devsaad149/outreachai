// Column mapping utilities for intelligent CSV import
const columnMappings = {
    business_name: [
        'business name', 'company', 'company name', 'business', 'organization',
        'org', 'organization name', 'firm', 'firm name', 'client', 'client name'
    ],
    decision_maker_name: [
        'decision maker name', 'decision maker', 'contact', 'contact name',
        'name', 'full name', 'person', 'lead name', 'owner', 'owner name',
        'first name', 'last name', 'contact person'
    ],
    email: [
        'email', 'email address', 'e-mail', 'mail', 'contact email',
        'email id', 'emailaddress'
    ],
    website: [
        'website', 'web', 'url', 'site', 'web site', 'homepage',
        'web address', 'domain', 'link'
    ],
    industry: [
        'industry', 'sector', 'vertical', 'category', 'business type',
        'type', 'field', 'niche'
    ]
};

/**
 * Normalize a column name for comparison
 */
function normalizeColumnName(name) {
    return name.toLowerCase().trim().replace(/[_-]/g, ' ');
}

/**
 * Calculate similarity score between two strings (simple approach)
 */
function similarity(str1, str2) {
    const s1 = normalizeColumnName(str1);
    const s2 = normalizeColumnName(str2);

    // Exact match
    if (s1 === s2) return 1.0;

    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Word overlap
    const words1 = s1.split(' ');
    const words2 = s2.split(' ');
    const commonWords = words1.filter(w => words2.includes(w));
    if (commonWords.length > 0) {
        return 0.6 * (commonWords.length / Math.max(words1.length, words2.length));
    }

    return 0;
}

/**
 * Detect the best mapping for a CSV column
 */
function detectColumnMapping(csvColumn) {
    let bestMatch = null;
    let bestScore = 0;
    let confidence = 'low';

    for (const [targetField, variations] of Object.entries(columnMappings)) {
        for (const variation of variations) {
            const score = similarity(csvColumn, variation);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = targetField;
            }
        }
    }

    // Determine confidence level
    if (bestScore >= 0.9) confidence = 'high';
    else if (bestScore >= 0.7) confidence = 'medium';
    else if (bestScore >= 0.5) confidence = 'low';
    else bestMatch = null; // No reasonable match

    return {
        targetField: bestMatch,
        confidence,
        score: bestScore
    };
}

/**
 * Analyze CSV headers and suggest mappings
 */
function analyzeCSVHeaders(headers) {
    const mappings = {};
    const unmapped = [];

    headers.forEach(header => {
        const detection = detectColumnMapping(header);
        if (detection.targetField) {
            mappings[header] = {
                maps_to: detection.targetField,
                confidence: detection.confidence,
                score: detection.score
            };
        } else {
            unmapped.push(header);
        }
    });

    return { mappings, unmapped };
}

/**
 * Apply mappings to a CSV row
 */
function applyMappings(row, columnMap) {
    const mapped = {
        status: 'Pending'
    };

    for (const [csvColumn, targetField] of Object.entries(columnMap)) {
        if (row[csvColumn]) {
            mapped[targetField] = row[csvColumn];
        }
    }

    return mapped;
}

module.exports = {
    analyzeCSVHeaders,
    applyMappings,
    detectColumnMapping
};
