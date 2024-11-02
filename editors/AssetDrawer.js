import { UITabbedPanel, UISpan, UIPanel, UIImage } from './libs/ui.js';

import { AssetDrawerToybox } from './AssetDrawer.Toybox.js';
import { AssetDrawerResizer } from './AssetDrawerResizer.js';


// mock a textures tab
// function AssetDrawerTextures(editor) {
// 	const container = new UIPanel();
// 	container.setHeight('200px');
// 	container.setOverflow('auto');
// 	container.setPadding('10px');

// 	const grid = document.createElement('div');
// 	grid.style.display = 'grid';
// 	grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr)';
// 	grid.style.gap = '10px';
// 	grid.style.padding = '10px';
// 	container.dom.appendChild(grid);

// 	function addTextureItem(texture) {
// 		const item = document.createElement('div');
// 		item.style.background = '#2c2c2c';
// 		item.style.padding = '10px';
// 		item.style.borderRadius = '4px';
// 		item.style.cursor = 'pointer';
// 		item.style.textAlign = 'center';

// 		const thumbnail = document.createElement('div');
// 		thumbnail.style.width = '100%';
// 		thumbnail.style.height = '100px';
// 		thumbnail.style.background = '#3c3c3c';
// 		thumbnail.style.marginBottom = '8px';
// 		item.appendChild(thumbnail);

// 		const name = document.createElement('div');
// 		name.textContent = texture.name;
// 		name.style.overflow = 'hidden';
// 		name.style.textOverflow = 'ellipsis';
// 		name.style.whiteSpace = 'nowrap';
// 		item.appendChild(name);

// 		item.addEventListener('click', () => {
// 			editor.loader.loadFile(texture.url);
// 		});

// 		item.addEventListener('dragstart', (event) => {
// 			event.dataTransfer.setData('asset/url', texture.url);
// 			event.dataTransfer.setData('asset/type', 'texture');
// 		});

// 		grid.appendChild(item);
// 	}

// 	const sampleTextures = [
// 		{ name: 'Wood', url: '/textures/wood.jpg' },
// 		{ name: 'Metal', url: '/textures/metal.jpg' },
// 		// Add more textures
// 	];

// 	sampleTextures.forEach(addTextureItem);

// 	return container;
// }

function AssetDrawer(editor) {
    const strings = editor.strings;
    const signals = editor.signals;
    
    const container = new UITabbedPanel();
    container.setId('assetDrawer');
    container.setPosition('absolute');
    container.setLeft('0px');
    container.setBottom('0px');
    container.setWidth('100%');
	// container.dom.style.minHeight = '200px';
	container.setHeight('450px');
    container.setDisplay('block');
    container.setBackground('#1b1b1b');
    container.setBorderTop('1px solid #333');

    // Create sections for different asset types
    const models = new UISpan().add(
        new AssetDrawerToybox(editor)
    );
    
    // const textures = new UISpan().add(
    //     new AssetDrawerTextures(editor)
    // );
    
    // const scenes = new UISpan().add(
    //     new AssetDrawerTextures(editor)
    // );

    // Add tabs
    container.addTab('models', strings.getKey('assetDrawer/models') || 'Models', models);
    // container.addTab('textures', strings.getKey('assetDrawer/textures') || 'Textures', textures);
    // container.addTab('scenes', strings.getKey('assetDrawer/scenes') || 'Scenes', scenes);
    container.select('models');

    // Add collapse/expand functionality
    const toggleButton = document.createElement('div');
    toggleButton.style.position = 'absolute';
    toggleButton.style.right = '10px';
    toggleButton.style.top = '-20px';
    toggleButton.style.background = '#1b1b1b';
    toggleButton.style.border = '1px solid #333';
    toggleButton.style.borderBottom = 'none';
    toggleButton.style.padding = '2px 8px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.textContent = '▼';
    container.dom.appendChild(toggleButton);


	// Add the resizer to the container
	const resizer = new AssetDrawerResizer(editor);
	container.dom.appendChild(resizer.dom);

    let isExpanded = true;
    toggleButton.addEventListener('click', () => {
        isExpanded = !isExpanded;
        container.setHeight(isExpanded ? '420px' : '0px');
        toggleButton.textContent = isExpanded ? '▼' : '▲';
        
        // When the asset drawer size changes, trigger a window resize
        // This ensures other components (like the viewport) adjust their size
        signals.windowResize.dispatch();
    });

    // Handle window resize
    function onWindowResize() {
        container.setWidth(window.innerWidth + 'px');
    }

    // Listen for window resize events
    signals.windowResize.add(onWindowResize);

    // Initial size setup
    onWindowResize();

    return container;
}

export { AssetDrawer };