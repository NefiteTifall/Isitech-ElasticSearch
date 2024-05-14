// http://en.wikipedia.org/w/api.php?action=query&titles=Marine Le Pen&prop=pageimages&format=json&pithumbsize=200

export default defineEventHandler(async (event) => {
    const data = getQuery(event);
    const { fullname } = data;

    try {
        const response = await fetch(`http://en.wikipedia.org/w/api.php?action=query&titles=${fullname}&prop=pageimages&format=json&pithumbsize=200`);
        const result = await response.json();
        const page = Object.values(result.query.pages)[0];

        const url = page.thumbnail ? page.thumbnail.source : null;
        // Get image
        console.log(url)
        const image = url ? await fetch(url) : null;

        return sendStream(event, image.body, { type: 'image/jpeg' });

    } catch (error) {
        return { error: error.message };
    }
});
