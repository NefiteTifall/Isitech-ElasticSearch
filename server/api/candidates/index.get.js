import { ElasticClient } from '../../utils/elasticsearch';

export default defineEventHandler(async (event) => {
    try {
        const result = await ElasticClient.search({
            index: 'tweets',
            body: {
                size: 0,
                aggs: {
                    tweets_per_candidate: {
                        terms: {
                            field: 'label',
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
