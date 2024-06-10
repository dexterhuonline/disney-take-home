/**
 * Class responsible for handling retrieval of JSON data representing content tiles.
 */
export class ContentTileDataRetriever {

    CONTENT_TILE_ENDPOINT = 'https://cd-static.bamgrid.com/dp-117731241344/home.json';
    REF_ID_DETAILS_ENDPOINT = 'https://cd-static.bamgrid.com/dp-117731241344/sets/';

    /**
     * Retrieves JSON data representing content tiles.
     * @returns A Promise resolving to JSON data representing content tiles, or null in case of error.
     */
    getData() {
        return fetch(this.CONTENT_TILE_ENDPOINT)
            .then(data => data.json())
            .then(json => json)
            .catch(e => {
                console.error('Error retrieving content tile data:', e);
                return null;
            });
    }

    /**
     * Retrieves JSON data for a refId.
     * @param refId The refId to get details on.
     * @returns A Promise resolving to details for a refId, or null in case of error.
     */
    getDetailsByRefId(refId) {
        return fetch(this.getRefIdEndpoint(refId))
            .then(data => data.json())
            .then(json => json)
            .catch(e => {
                console.error('Error retrieving refId details:', e);
                return null;
            });
    }

    /**
     * Helper function to create and return the endpoint to get details for a refId.
     * @param refId The refId to get details on.
     * @returns Endpoint to get details for a refId.
     */
    getRefIdEndpoint(refId) {
        return `${this.REF_ID_DETAILS_ENDPOINT}${refId}.json`;
    }
}