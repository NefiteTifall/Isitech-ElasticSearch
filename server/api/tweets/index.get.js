import { ElasticClient } from '../../utils/elasticsearch';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const pageSize = parseInt(query.pageSize || '10', 10);
    const candidates = query.candidates ? query.candidates.split(',') : [];
    const searchQuery = query.query || '';
    const scrollId = query.scrollId;

    let esQuery;

    // If no candidates are provided, return an empty result
    if (candidates.length === 0) {
        return {
            tweets: [],
            total: 0,
            scrollId: null
        };
    }

    // If a search query is provided, use a boolean query
    if (searchQuery) {
        esQuery = {
            bool: {
                must: [
                    { terms: { 'label.keyword': candidates } },
                    { match: { 'text': searchQuery } }
                ]
            }
        };
    } else {
        esQuery = {
            terms: { 'label.keyword': candidates }
        };
    }

    try {
        let result;

        // Continue scrolling if the scrollId is provided
        if (scrollId) {
            result = await ElasticClient.scroll({
                scroll_id: scrollId,
                scroll: '1m'
            });
        } else {
            // Initial scroll search request
            result = await ElasticClient.search({
                index: 'tweets',
                body: {
                    size: pageSize,
                    query: esQuery,
                    sort: [{ created_at: { order: 'desc' } }]
                },
                scroll: '30m' // Keep the search context alive for 30 minutes
            });
        }

        return {
            scrollId: result._scroll_id,
            tweets: result.hits.hits,
            total: result.hits.total.value,
            took: result.took
        };
    } catch (error) {
        return { error: error.message };
    }
});