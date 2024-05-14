import { ElasticClient } from '../../utils/elasticsearch';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const page = parseInt(query.page || '1', 10);
    const pageSize = parseInt(query.pageSize || '10', 10);
    const from = (page - 1) * pageSize;
    const candidates = query.candidates ? query.candidates.split(',') : [];
    const searchQuery = query.query || '';

    let esQuery;

    if (candidates.length === 0) {
        return {
            tweets: [],
            total: 0,
            page,
            pageSize
        };
    }

    if (searchQuery) {
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
        esQuery = {
            terms: { 'label': candidates }
        };
    }

    try {
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
