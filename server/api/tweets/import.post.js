import { ElasticClient } from '../../utils/elasticsearch';

export default defineEventHandler(async (event) => {
    const files = await readMultipartFormData(event)
    const file = files[0];

    if (file.type !== 'application/json') {
        return { error: 'Invalid file type' };
    }

    const data = JSON.parse(file.data.toString());

    try {
        for (let tweet of data) {
            await ElasticClient.index({
                index: 'tweets',
                body: tweet,
                pipeline: "tweet_data_pipeline"
            });
        }

        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});