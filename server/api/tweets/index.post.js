import { ElasticClient } from '../../utils/elasticsearch';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { candidat, message } = body;

    try {
        const tweet = {
            candidat: candidat,
            message: message,
            createdAt: new Date()
        };

        await ElasticClient.index({
            index: 'tweets',
            body: tweet,
            pipeline: "tweet_data_pipeline"
        });

        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});