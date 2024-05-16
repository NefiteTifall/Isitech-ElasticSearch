import { Client } from '@elastic/elasticsearch';

// We use login and password to connect to Elastic Cloud but we could also use an url and an API key
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