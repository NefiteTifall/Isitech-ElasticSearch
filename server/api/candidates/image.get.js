export default defineEventHandler(async (event) => {
    const data = getQuery(event);
    const { fullname } = data;

    try {
        // Fetch the Wikipedia page for the candidate
        const response = await fetch(`http://en.wikipedia.org/w/api.php?action=query&titles=${fullname}&prop=pageimages&format=json&pithumbsize=200`);
        const result = await response.json();

        // Get the URL of the candidate's image
        const page = Object.values(result.query.pages)[0];
        const url = page.thumbnail ? page.thumbnail.source : null;

        // Fetch the image
        const image = url ? await fetch(url) : null;

        // Return the image as a JPEG
        return sendStream(event, image.body, { type: 'image/jpeg' });
    } catch (error) {
        return { error: error.message };
    }
});
