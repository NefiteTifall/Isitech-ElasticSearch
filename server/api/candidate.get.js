// http://en.wikipedia.org/w/api.php?action=query&titles=Marine Le Pen&prop=pageimages&format=json&pithumbsize=200

export default defineEventHandler(async (event) => {
    const data = getQuery(event);
    const { fullname } = data;

    try {
        const response = await fetch(`http://en.wikipedia.org/w/api.php?action=query&titles=${fullname}&prop=pageimages&format=json&pithumbsize=200`);
        const result = await response.json();
        const page = Object.values(result.query.pages)[0];

        return page.thumbnail.source;
    } catch (error) {
        return { error: error.message };
    }
});
