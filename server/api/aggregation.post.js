import { ElasticClient } from '../utils/elasticsearch';

export default defineEventHandler(async (event) => {
    try {
        const result = await ElasticClient.search({
            index: 'tweets',
            body: {
                track_total_hits: true,
                aggs: {
                    tweets_per_candidate: {
                        terms: {
                            field: 'label',
                            size: 100
                        }
                    }
                },
                size: 0
            }
        });
        return result;
    } catch (error) {
        return { error: error.message };
    }
});
