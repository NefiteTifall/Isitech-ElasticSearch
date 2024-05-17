# TweetoPolitico

## Description

TweetoPilico est une application se basant sur un jeu de donnée regroupant des tweets ou des articles de presse relatif
aux présidentielles de 2022.
L'objectif est simplement l'utilisation d'Elasticsearch pour indexer et rechercher des données.

## 📍 Description

TweetoPilico est une application se basant sur un jeu de donnée regroupant des tweets ou des articles de presse relatif
aux présidentielles de 2022.
L'objectif est simplement l'utilisation d'Elasticsearch pour indexer et rechercher des données.

---

## 📂 Repository Structure

```sh
└── Isitech-ElasticSearch/
    ├── README.md
    ├── app.vue
    ├── layouts
    │   └── default.vue
    ├── nuxt.config.ts
    ├── package.json
    ├── pages
    │   └── index.vue
    ├── pnpm-lock.yaml
    ├── public
    │   └── favicon.ico
    ├── server
    │   ├── api
    │   │   ├── candidates
    │   │   │   ├── image.get.js
    │   │   │   └── index.get.js
    │   │   └── tweets
    │   │       ├── [id].delete.js
    │   │       └── index.get.js
    │   ├── tsconfig.json
    │   └── utils
    │       └── elasticsearch.js
    └── tsconfig.json
```

---

## 🚀 Débuter avec Isitech-ElasticSearch

### ⚙️ Installation

1. Cloner le projet:

```sh
git clone https://github.com/NefiteTifall/Isitech-ElasticSearch && cd Isitech-ElasticSearch
```

2. Installer les dépendances:

```sh
pnpm install
```

### 🤖 Exécution

Pour lancer le serveur, exécutez:

```bash
pnpm dev
```

---

## 📚 Utilisations d'Elasticsearch

### Indexation

Nous avons créé un index `tweets` pour indexer les tweets importés via Kibana dans Elasticsearch. Cet index est utilisé pour stocker et récupérer les tweets en fonction des critères de recherche spécifiés par l'utilisateur.

### Search API & Keyword Search

Dans ce projet, nous utilisons l'API de recherche d'Elasticsearch pour effectuer des recherches par mot-clé sur les tweets. La recherche par mot-clé est réalisée en utilisant une requête booléenne, qui est construite en fonction des paramètres fournis dans la requête HTTP, tels que la page, la taille de la page, les candidats et la requête de recherche.

Voici un extrait de code du fichier `server/api/tweets/index.get.js` qui montre comment cela est fait :

```javascript
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
```

### 🚀 Fuzzy Matching

Elasticsearch offre une fonctionnalité appelée "Fuzzy Matching" qui permet de rechercher des termes qui sont similaires à un terme donné, mais pas exactement identiques. Cela peut être utile pour gérer les erreurs de frappe ou les variations orthographiques.

Dans ce projet, nous utilisons le fuzzy matching pour améliorer la recherche de candidats. Lorsqu'un utilisateur saisit un terme de recherche, nous utilisons une requête fuzzy pour rechercher des candidats qui correspondent à ce terme.

Voici un exemple de la façon dont cela est mis en œuvre dans le fichier `server/api/candidates/index.get.js` :

```javascript
query: {
     bool: {
         should: [
             {
                 wildcard: {
                     label: {
                         value: `*${searchQuery}*`,
                         boost: 1.0
                     }
                 },
             },
             {
                 match: {
                     label: {
                         query: searchQuery,
                         fuzziness: 'AUTO'
                     }
                 }
             }
         ],
         minimum_should_match: 1
     }
 }
```

Cette exemple montre également comment nous avons utilisé l'aggretation pour regrouper les tweets par candidat.

### 📄 Scroll API 

Nous utilisons l'API de défilement d'Elasticsearch pour récupérer les résultats de recherche paginés. Lorsqu'un utilisateur effectue une recherche, nous utilisons l'API de défilement pour récupérer les résultats de recherche par lots de 20 tweets à la fois.

### ❌ Delete API 
> Non disponible en front-end

Nous avons également implémenté une API de suppression pour supprimer un tweet spécifique de l'index.

---

## Dashboard Kibana X Logstash
Voici des exemple de dashboard que nous avons créé sur Kibana pour visualiser les données importées via Logstash.
![Dashboard](https://i.imgur.com/2VEkxTA.png)

---

## ➕ Ajout de jeux de données

Pour ajouter des jeux de données supplémentaires, il est possible d'utiliser l'API :  
* `/api/tweets` pour crer un tweet
* `/api/tweets/import` pour importer un fichier json de tweets (voir `tweets-data.json` pour un exemple de structure de données)

Pipleline Logstash pour importer les tweets :
```sh
PUT /_ingest/pipeline/tweet_data_pipeline
{
  "description": "Pipeline pour renommer des champs et formater la date",
  "processors": [
    {
      "rename": {
        "field": "message",
        "target_field": "text"
      }
    },
    {
      "rename": {
        "field": "candidat",
        "target_field": "label"
      }
    },
    {
      "rename": {
        "field": "createdAt",
        "target_field": "created_at"
      }
    },
    {
      "date": {
        "field": "created_at",
        "formats": ["yyyy-MM-dd'T'HH:mm:ss.SSSX"],
        "target_field": "created_at",
        "timezone": "UTC"
      }
    },
    {
      "script": {
        "lang": "painless",
        "source": """
          SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX");
          inputFormat.setTimeZone(TimeZone.getTimeZone('UTC'));
          Date parsedDate = inputFormat.parse(ctx.created_at);
          
          SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ssXXX");
          outputFormat.setTimeZone(TimeZone.getTimeZone('UTC'));
          ctx.created_at = outputFormat.format(parsedDate);
          
          long epochSeconds = parsedDate.getTime() / 1000;
          ctx.id = epochSeconds
        """
      }
    }
  ]
}
