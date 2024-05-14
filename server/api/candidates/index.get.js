import { ElasticClient } from '../../utils/elasticsearch';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const searchQuery = query.query || '';

    try {
        // Search for tweets with labels similar to the search query
        const result = await ElasticClient.search({
            index: 'tweets',
            body: {
                size: 0, // Set the size to 0 to only retrieve aggregations
                query: {
                    bool: {
                        should: [
                            {
                                // Use fuzzy matching to find similar labels
                                fuzzy: {
                                    label: {
                                        value: searchQuery, // The search query
                                        fuzziness: "AUTO" // Set the fuzziness level to "AUTO"
                                    }
                                }
                            },
                            {
                                // Use wildcard matching to find labels containing the search query
                                wildcard: {
                                    label: {
                                        value: `*${searchQuery}*` // The search query with wildcards
                                    }
                                }
                            }
                        ]
                    }
                },
                aggs: {
                    // Perform aggregation on the 'label' field
                    tweets_per_candidate: {
                        terms: {
                            field: 'label', // The field to aggregate on
                            size: 100 // Set the maximum number of buckets to 100
                        },
                    }
                }
            }
        });

        return result.aggregations.tweets_per_candidate.buckets;
    } catch (error) {
        return { error: error.message };
    }
});
