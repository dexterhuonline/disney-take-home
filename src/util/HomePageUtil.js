import {
    DETAIL_MODAL_BODY_PLACEHOLDER_TEXT,
    DETAIL_MODAL_FOOTER_TEXT,
    IMAGE_TILE_FORMAT,
    NO_IMAGE_PATH
} from "../const/Constants.js";

/**
 * Helper function to create a content row container, which will contain a title and a row.
 * @returns A content row container.
 */
export function buildContentRowContainer() {
    const contentRowContainer = document.createElement('div');
    contentRowContainer.className = 'content-row-container';
    return contentRowContainer;
}

/**
 * Helper function to create a content title for a row.
 * If the name is not present, uses a default title instead.
 * @returns A content title for a row.
 */
export function buildContentTitle(container) {
    const contentTitle = document.createElement('div');
    contentTitle.textContent = container.set?.text?.title?.full?.set?.default?.content || DEFAULT_CONTENT_ROW_TEXT;
    contentTitle.className = 'content-title';
    return contentTitle;
}

/**
 * Helper function to create an empty content row.
 * @returns An empty content row.
 */
export function buildContentRow() {
    const contentRow = document.createElement('div');
    contentRow.className = 'content-row';
    return contentRow;
}

/**
 * Helper function to create a content tile.
 * @returns An content tile.
 */
export function buildContentTile(tile) {
    // Create a container div which the image will 'fill' and center itself within
    const contentTile = document.createElement('div');
    const contentTileImg = document.createElement('img');
    contentTile.className = 'content-tile';
    contentTileImg.src = getImageUrlFromTile(tile);
    contentTileImg.onerror = () => {
        contentTileImg.src = NO_IMAGE_PATH;
    };

    contentTile.appendChild(contentTileImg);
    return contentTile;
}

/**
 * Helper function to create a detail modal.
 * @returns An detail modal.
 */
export function buildDetailModal(tile) {
    // Create a detail modal
    const modal = document.createElement('div');
    modal.id = 'detail-modal';
    modal.className = 'detail-modal-open';

    // Append a video, or image fallback
    if (tile.videoSrc) {
        const video = document.createElement('video');
        video.src = tile.videoSrc;
        video.setAttribute('autoplay', 'autoplay');
        video.setAttribute('muted', 'muted');
        video.setAttribute('loop', 'loop');
        modal.appendChild(video);
    } else {
        const image = document.createElement('img')
        image.src = tile.imgSrc || NO_IMAGE_PATH;
        modal.appendChild(image);
    }

    // Append a title
    const title = document.createElement('div');
    title.className = 'modal-title';
    title.textContent = tile.title;
    modal.appendChild(title);

    // Append a body (contains a description and a footer)
    const body = document.createElement('div');
    body.className = 'modal-body';
    const description = document.createElement('div');
    description.textContent = DETAIL_MODAL_BODY_PLACEHOLDER_TEXT;
    description.className = 'modal-description';
    const footer = document.createElement('div');
    footer.textContent = DETAIL_MODAL_FOOTER_TEXT;
    footer.className = 'modal-footer';

    body.appendChild(description);
    body.appendChild(footer);
    modal.appendChild(body);

    return modal;
}

/**
 * Helper method to extract useful modal details from tiles
 * In the future, a description could be added here to replace the placeholder one.
 * 
 * videoSrc - The video src for the modal
 * imgSrc - The img fallback for the modal (in case video missing)
 * title - The title for the modal
 * 
 * @param tiles The tile data for an entire row of tiles.
 * @returns Only necessary tile data for modal.
 */
export function getMappedTiles(tiles) {
    return tiles.map(tile => ({
        videoSrc: getVideoUrlFromTile(tile),
        imgSrc: getImageUrlFromTile(tile),
        title: getTitleFromTile(tile),
    }));
}

/**
 * Helper method to get the image url from a tile.
 * @param tile The tile to check.
 * @returns The url for the image, or empty string if missing.
 */
export function getImageUrlFromTile(tile) {
    const imageLocation = tile.image?.tile?.[IMAGE_TILE_FORMAT] || {};
    const imageKey = Object.keys(imageLocation)[0]; // E.g. 'program', 'series', 'default'
    return imageLocation[imageKey]?.default?.url || '';
}

/**
 * Helper method to get the video url from a tile.
 * @param tile The tile to check.
 * @returns The url for the video, or empty string if missing.
 */
export function getVideoUrlFromTile(tile) {
    return tile.videoArt?.[0]?.mediaMetadata?.urls?.[0]?.url || '';
}

/**
 * Helper method to get the title from a tile.
 * @param tile The tile to check.
 * @returns The url for the title, or empty string if missing.
 */
export function getTitleFromTile(tile) {
    const titleLocation = tile.text?.title?.full || {};
    const titleKey = Object.keys(titleLocation)[0];
    return titleLocation[titleKey]?.default?.content || '';
}
