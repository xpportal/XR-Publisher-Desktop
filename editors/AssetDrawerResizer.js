import { UIElement } from './libs/ui.js';

function AssetDrawerResizer(editor) {
    const signals = editor.signals;

    const dom = document.createElement('div');
    dom.id = 'assetDrawerResizer';
    dom.style.position = 'absolute';
    dom.style.left = '0';
    dom.style.right = '0';
    dom.style.height = '4px';
    dom.style.top = '-2px';
    dom.style.cursor = 'ns-resize';

    let startY = 0;
    let startHeight = 0;
    let isResizing = false;

    function onPointerDown(event) {
        if (event.isPrimary === false) return;

        isResizing = true;
        startY = event.clientY;
        
        // Get the current height of the asset drawer
        const assetDrawer = document.getElementById('assetDrawer');
        startHeight = parseInt(getComputedStyle(assetDrawer).height);

        dom.ownerDocument.addEventListener('pointermove', onPointerMove);
        dom.ownerDocument.addEventListener('pointerup', onPointerUp);

        // Add a class to disable text selection while resizing
        document.body.classList.add('resize-active');
    }

    function onPointerUp(event) {
        if (event.isPrimary === false) return;

        isResizing = false;
        dom.ownerDocument.removeEventListener('pointermove', onPointerMove);
        dom.ownerDocument.removeEventListener('pointerup', onPointerUp);

        // Remove the class that disables text selection
        document.body.classList.remove('resize-active');

        // Dispatch window resize event after resizing is complete
        signals.windowResize.dispatch();
    }

    function onPointerMove(event) {
        if (!isResizing || event.isPrimary === false) return;

        const deltaY = startY - event.clientY;
        const newHeight = Math.min(
            Math.max(startHeight + deltaY, 100), // Minimum height of 100px
            window.innerHeight - 100 // Maximum height (window height minus 100px)
        );

        const assetDrawer = document.getElementById('assetDrawer');
        assetDrawer.style.height = `${newHeight}px`;

        // Update other elements that need to be adjusted
        const sidebar = document.getElementById('sidebar');
        if (assetDrawer) {
            const assetDrawerHeight = parseInt(getComputedStyle(sidebar).width);
			sidebar.style.width = `${assetDrawerHeight}px`;
			document.getElementById('assetDrawer').style.height = `${newHeight}px`;
            // document.getElementById('viewport').style.bottom = `${newHeight}px`;
            // document.getElementById('viewport').style.bottom = `${newHeight}px`;
            // document.getElementById('player').style.bottom = `${newHeight}px`;
            // document.getElementById('script').style.bottom = `${newHeight}px`;
        }

        // Dispatch resize event while resizing
        signals.windowResize.dispatch();
    }

    dom.addEventListener('pointerdown', onPointerDown);

    return new UIElement(dom);
}

export { AssetDrawerResizer };