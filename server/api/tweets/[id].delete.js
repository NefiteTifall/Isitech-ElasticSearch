import { ElasticClient } from '../../utils/elasticsearch';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    try {
        // Delete the tweet from the index
        await ElasticClient.delete({
            index: 'tweets',
            id: id
        });

        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});
