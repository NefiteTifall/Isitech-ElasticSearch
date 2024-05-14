import { ElasticClient } from '../../utils/elasticsearch';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const searchQuery = query.query || '';

    try {
        const result = await ElasticClient.search({
            index: 'tweets',
            body: {
                size: 0,
                query: {
                    bool: {
                        should: [
                            {
                                fuzzy: {
                                    label: {
                                        value: searchQuery,
                                        fuzziness: "AUTO"
                                    }
                                }
                            },
                            {
                                wildcard: {
                                    label: {
                                        value: `*${searchQuery}*`
                                    }
                                }
                            }
                        ]
                    }
                },
                aggs: {
                    tweets_per_candidate: {
                        terms: {
                            field: 'label',
                            size: 100
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
