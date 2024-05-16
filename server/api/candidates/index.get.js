import { ElasticClient } from '../../utils/elasticsearch';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const searchQuery = query.query || '';

    try {
        const result = await ElasticClient.search({
            index: 'tweets',
            size: 0,
            body: {
                query: {
                    bool: {
                        should: [
                            {
                                wildcard: {
                                    label: {
                                        value: `*${searchQuery}*`,
                                        boost: 1.0
                                    }
                                },
                            },
                            {
                                match: {
                                    label: {
                                        query: searchQuery,
                                        fuzziness: 'AUTO'
                                    }
                                }
                            }
                        ],
                        minimum_should_match: 1
                    }
                },
                aggs: {
                    tweets_per_candidate: {
                        terms: {
                            field: 'label.keyword',
                            size: 100
                        }
                    }
                }
            }
        });

        return result.aggregations.tweets_per_candidate.buckets;
    } catch (error) {
        return { error: error.message };
    }
});
