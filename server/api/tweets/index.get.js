import { ElasticClient } from '../../utils/elasticsearch';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const page = parseInt(query.page || '1', 10);
    const pageSize = parseInt(query.pageSize || '10', 10);
    const from = (page - 1) * pageSize;
    const candidates = query.candidates ? query.candidates.split(',') : [];
    const searchQuery = query.query || '';

    let esQuery;

    // If no candidates are provided, return an empty result
    if (candidates.length === 0) {
        return {
            tweets: [],
            total: 0,
            page,
            pageSize
        };
    }

    // If a search query is provided, use a boolean query
    if (searchQuery) {
        // Search for tweets that contain the search query and are from the specified candidates
        esQuery = {
            bool: {
                must: [
                    {
                        terms: { 'label': candidates }
                    },
                    {
                        match: { 'text': searchQuery }
                    }
                ]
            }
        };
    } else {
        // Search for tweets that are from the specified candidates
        esQuery = {
            terms: { 'label': candidates }
        };
    }

    try {
        // Search for tweets with the specified query and pagination, sorted by created_at
        const result = await ElasticClient.search({
            index: 'tweets',
            body: {
                size: pageSize,
                from: from,
                query: esQuery,
                sort: [
                    { created_at: { order: 'desc' } }
                ]
            }
        });

        return {
            tweets: result.hits.hits,
            total: result.hits.total.value,
            page,
            pageSize
        };
    } catch (error) {
        return { error: error.message };
    }
});
