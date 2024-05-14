import { ElasticClient } from "../utils/elasticsearch";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { query, from = 0, size = 10 } = body;

    try {
        const result = await ElasticClient.search({
            index: 'tweets',
            body: {
                query: {
                    match: {
                        text: query
                    }
                },
                from,
                size
            }
        });
        return result.hits.hits;
    } catch (error) {
        return { error: error.message };
    }
});
