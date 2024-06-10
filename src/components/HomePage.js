import { ContentTileDataRetriever } from '../retriever/ContentTileDataRetriever.js';
import {
    buildContentRow,
    buildContentRowContainer,
    buildContentTile,
    buildContentTitle,
    buildDetailModal,
    getMappedTiles
} from '../util/HomePageUtil.js';
import { isElementCompletelyInView, isElementInView } from '../util/Util.js';

/**
 * This class represents the home page.
 */
export class HomePage {

    constructor() {
        this.contentTileDataRetriever = new ContentTileDataRetriever();
        this.content = [];
        this.selectedTileX = 0;
        this.selectedTileY = 0;
        this.lastTileX = 0;
        this.lastTileY = 0;
    }

    /**
     * Performs on-initialization operations.
     */
    init() {
        this.contentTileDataRetriever.getData()
            .then(data => this.buildHomePage(data));
    }

    /**
     * Builds the home page by creating rows of categorized content tiles.
     * @param contentTileData Content tile data retrieved from content endpoint, or null in case of error.
     */
    buildHomePage(contentTileData) {
        const containers = contentTileData?.data?.StandardCollection?.containers || [];
        
        if (containers.length) {
            const fragment = document.createDocumentFragment();

            // Create a content row for each container (contains a title and a row of tiles)
            for (let i = 0; i < containers.length; i++) {
                const tiles = containers[i].set?.items || [];
                const contentRowContainer = buildContentRowContainer();
                contentRowContainer.appendChild(buildContentTitle(containers[i]));
                const contentRow = buildContentRow();
                contentRowContainer.appendChild(contentRow);

                // Fill the row with content tiles
                for (let j = 0; j < tiles.length; j++) {
                    contentRow.appendChild(buildContentTile(tiles[j]));
                }

                fragment.appendChild(contentRowContainer);
                this.content.push({
                    refId: containers[i].set?.refId || '', // Keep the refId if there was one
                    rowRef: contentRow, // Element ref for adding tiles (refId rows) and VFX
                    tiles: getMappedTiles(tiles) // Data for detail modal usage
                });
            }

            // Add completed document fragment to the DOM
            document.body.appendChild(fragment);
            
            this.addScrollEventListener();
            this.addKeyPressListener();

            // Cosmetic: Apply VFX for the initial tile as the initial fly-in animation finishes
            // (the user does not need to wait for this by any means)
            setTimeout(() => {
                this.highlightTile();
            }, 1000);
        }
    }

    /**
     * Event listener to dynamically populate details for refId rows when they come into view.
     */
    addScrollEventListener() {
        const rows = document.getElementsByClassName('content-row');
        let scrollListener;
        document.addEventListener('scroll', scrollListener = () => {
            let refIdCount = 0; // Count the number of rows still needing to be populated
            for (let i = 0; i < this.content.length; i++) {
                if (this.content[i].refId) {
                    refIdCount++;
                    if (rows[i] && isElementInView(rows[i])) {
                        this.contentTileDataRetriever.getDetailsByRefId(this.content[i].refId)
                            .then(details => {
                                const setLocation = details?.data || {};
                                const key = Object.keys(setLocation)[0]; // E.g. 'TrendingSet', 'CuratedSet'
                                const tiles = setLocation[key]?.items || [];
                                const fragment = document.createDocumentFragment();
                                for (let j = 0; j < tiles.length; j++) {
                                    fragment.appendChild(buildContentTile(tiles[j]));
                                }
                                rows[i].appendChild(fragment);
                                this.content[i].tiles = getMappedTiles(tiles);
                            });
    
                        // Remove the refId so it can't be called again
                        this.content[i].refId = '';
                    }
                }
            }

            // All refId rows are now populated, can remove this scroll listener
            if (!refIdCount) {
                document.removeEventListener('scroll', scrollListener);
            }
        });
    }

    /**
     * Adds key press listeners to mimic a remote control to select tiles.
     * Valid key presses are: any arrow keys, enter, and backspace.
     */
    addKeyPressListener() {
        document.onkeydown = e => {
            switch (e.code) {
                case 'ArrowLeft':
                    // Move one tile to the left
                    e.preventDefault();
                    if (this.selectedTileX > 0) {
                        this.selectedTileX--;
                    }
                    this.highlightTile();
                    break;
                case 'ArrowRight':
                    // Move one tile to the right
                    e.preventDefault();
                    if (this.selectedTileX < this.content[this.selectedTileY].tiles.length - 1) {
                        this.selectedTileX++;
                    }
                    this.highlightTile();
                    break;
                case 'ArrowUp':
                    // Move one row up
                    e.preventDefault();
                    if (this.selectedTileY > 0) {
                        this.selectedTileY--;
                        this.selectedTileX = 0;
                    }
                    this.highlightTile();
                    this.handleVerticalScrolling();
                    break;
                case 'ArrowDown':
                    // Move one row down
                    e.preventDefault();
                    if (this.selectedTileY < this.content.length - 1) {
                        this.selectedTileY++;
                        this.selectedTileX = 0;
                    }
                    this.highlightTile();
                    this.handleVerticalScrolling();
                    break;
                case 'Enter':
                    // Open the detail modal for the currently selected tile
                    e.preventDefault();
                    const tile = this.content[this.selectedTileY].tiles[this.selectedTileX];
                    if (tile) {
                        const modal = document.getElementById('detail-modal');
                        if (modal) {
                            modal.replaceWith(buildDetailModal(tile));
                        }
                    }
                    break;
                case 'Backspace':
                    // Hides the modal
                    e.preventDefault();
                    const emptyModal = document.createElement('div');
                    emptyModal.id = 'detail-modal';
                    const modal = document.getElementById('detail-modal');
                    if (modal) {
                        modal.replaceWith(emptyModal);
                    }
                    break;
                default:
                    break;
            }
        };
    }

    /**
     * Handles vertical scrolling of window when using up and down arrow keys.
     * Scrolls when the selected row is not in screen.
     */
    handleVerticalScrolling() {
        if (this.content[this.selectedTileY].rowRef &&
            !isElementCompletelyInView(this.content[this.selectedTileY].rowRef)) {

            // Scroll to the element, leaving a little room to see the row afterwards
            window.scrollTo({
                top: this.content[this.selectedTileY].rowRef.offsetTop - (window.innerHeight / 2) + 100,
                left: 0,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Highlights the currently selected tile and scrolls to it, if it's out of view.
     */
    highlightTile() {
        const lastTile = this.content[this.lastTileY].rowRef?.children?.[this.lastTileX];
        if (lastTile) {
            lastTile.classList.remove('highlight-tile');
        }
        const currentTile = this.content[this.selectedTileY].rowRef?.children?.[this.selectedTileX];
        if (currentTile) {
            // Scrolls the tile into view, one screen-width at a time
            const tileWidth = 194; // Width of tile (178px) + margin-right (16px)
            const tileX = this.selectedTileX * tileWidth;
            const scrollX = Math.floor(tileX / (window.outerWidth - tileWidth)) *
                (window.outerWidth - tileWidth);
            
            this.content[this.selectedTileY].rowRef.scrollTo({
                left: scrollX,
                top: 0,
                behavior: 'smooth'
            });

            currentTile.classList.add('highlight-tile');
            this.lastTileX = this.selectedTileX;
            this.lastTileY = this.selectedTileY;
        }
    }
}