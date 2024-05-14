import { Client } from '@elastic/elasticsearch';

const ElasticClient = new Client({ 
    cloud: {
        id: process.env.ELASTIC_CLOUD_ID
    },
    auth: {
        username: process.env.ELASTIC_USER,
        password: process.env.ELASTIC_PASSWORD
    }
});

export { ElasticClient };