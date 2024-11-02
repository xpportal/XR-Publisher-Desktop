import { UIPanel, UIRow, UIText, UIInput, UIButton, UISpan } from './libs/ui.js';

function AssetDrawerToybox(editor) {
	let selectedCategories = []; // Track selected categories state

    const container = new UIPanel();
	// container.dom.style.minHeight = '350px';
    container.setOverflow('auto');
    // container.setPadding('10px');
	// padding top and bottom 5 pixels and left and right 10 pixels
	container.dom.style.padding = '0px 10px';

    // API Key Section
    const apiKeyRow = new UIRow();
    apiKeyRow.setMarginBottom('10px');
	// set the row to flex and align items horizontally and fit the space
	apiKeyRow.dom.style.cssText = `
		display: flex;
		align-items: center;
		justify-content: space-between;
	`;
	// Left side - API Key Input
	const apiKeySection = new UIPanel();
	apiKeySection.dom.className = 'flex items-center gap-2';

    
    const apiKeyLabel = new UIText('Toybox API Key:');
    apiKeyLabel.setWidth('80px');
	
    
	const apiKeyInput = new UIInput('');
	apiKeyInput.setWidth('200px');
	apiKeyInput.dom.type = 'password';
	apiKeyInput.dom.className = 'px-2 py-1 rounded-full text-xs flex-1 shadow-inner-xl focus:outline-none text-left bg-[#202020] text-white';
	
		
    // Set initial value from localStorage
    const savedKey = localStorage.getItem('toybox_api_key');
    if (savedKey) {
        apiKeyInput.setValue(savedKey);
    }

	const statusSpan = new UISpan();
	statusSpan.dom.className = savedKey ? 'text-slime-500' : 'text-red-500';
	statusSpan.setMarginLeft('10px');
	statusSpan.setTextContent(savedKey ? '● Connected' : '○ Not Connected');
	
	const saveButton = new UIButton('Save Key');
	saveButton.setMarginLeft('4px');
	saveButton.dom.className = 'button bg-violet-500 text-white px-2 py-0 rounded-full text-sm lowercase';
	saveButton.onClick(async () => {
		const value = apiKeyInput.getValue();
		if (value) {
			// Test connection before saving
			const params = new URLSearchParams({
				search: '',
				categories: '',
				limit: '1',
				offset: '0'
			});
			const url = `https://cfdb.sxpdigital.workers.dev/assets-by-key?${params.toString()}`;
			console.log('Fetching URL:', url);
	
			const response = await fetch(url, {
				method: 'GET',
				headers: { 
					'Authorization': `Bearer ${value}`,
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				mode: 'cors', // Add CORS mode explicitly
				credentials: 'omit' // Don't send credentials
			});
			
			const isValid = response.ok;
			if (isValid) {
				localStorage.setItem('toybox_api_key', value);
				statusSpan.dom.className = 'text-slime-500';
				statusSpan.setTextContent('● Connected');
				editor.signals.toyboxApiKeyChanged.dispatch(value);
				fetchAssets();
			} else {
				statusSpan.dom.className = 'text-red-500';
				statusSpan.setTextContent('✕ Invalid Token');
			}
		}
	});
	
	const clearButton = new UIButton('Clear');
	clearButton.setMarginLeft('4px');
	clearButton.dom.className = 'button bg-red-500 text-white px-2 py-0 rounded-full text-sm lowercase';
	clearButton.onClick(() => {
        localStorage.removeItem('toybox_api_key');
        apiKeyInput.setValue('');
        statusSpan.dom.className = 'text-red-500';
        statusSpan.setTextContent('○ Not Connected');
        editor.signals.toyboxApiKeyChanged.dispatch(null);
        clearAssets(); // Clear the grid when key is removed
    });

	const categoriesSection = new UIPanel();
	categoriesSection.dom.className = 'flex items-center gap-2 ml-4';
	categoriesSection.dom.style.cssText = `
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-left: 0rem;
		overflow-x: auto;
		padding: 0.0rem;
	`;
	
	// Create categories bar
	function updateCategoriesBar(categories = [], selectedCategories = []) {
		while (categoriesSection.dom.firstChild) {
			categoriesSection.dom.removeChild(categoriesSection.dom.firstChild);
		}
	
		categories.forEach(category => {
			const button = new UIButton(category.category);
			button.dom.className = `px-2 py-1 mx-0 mb-1 rounded-full shadow-lg lowercase ${
				selectedCategories.includes(category.category) 
					? 'bg-violet-700 hover:bg-violet-700 text-white' 
					: 'bg-black hover:bg-violet-600 text-violet-700 hover:text-white'
			}`;
	
			if (selectedCategories.includes(category.category)) {
				const iconSpan = document.createElement('span');
				iconSpan.innerHTML = `
					<svg class="h-3 w-3 p-0 text-white mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				`;
				button.dom.insertBefore(iconSpan, button.dom.firstChild);
			}
	
			button.onClick(() => {
				handleCategorySelect(category.category, categories);
			});
			categoriesSection.add(button);
		});
	}
	
    // Add elements to API Key Row
    // apiKeyRow.add(apiKeyLabel);
	apiKeySection.add(apiKeyInput);
	apiKeySection.add(statusSpan);
	apiKeySection.add(saveButton);
	apiKeySection.add(clearButton);
	
	apiKeyRow.add(apiKeySection);
	apiKeyRow.add(categoriesSection);

	function handleCategorySelect(category, categories) {
		if (selectedCategories.length !== 0) {
			if (selectedCategories.includes(category)) {
				selectedCategories = selectedCategories.filter(c => c !== category);
			} else {
				selectedCategories = [...selectedCategories, category];
			}
		} else {
			selectedCategories = [category];
		}
	
		// Update categories and refetch assets
		updateCategoriesBar(categories, selectedCategories);
		// Trigger asset refresh with new categories
		fetchAssets(selectedCategories);
	}	
	
	// Initial categories fetch and update
	// This would be called after fetching categories from your API
	async function fetchAndUpdateCategories() {
		try {
			const token = localStorage.getItem('toybox_api_key');
			const response = await fetch('https://cfdb.sxpdigital.workers.dev/categories-by-key', {
				headers: { 
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json'
				}
			});
			if (response.ok) {
				const categoriesData = await response.json();
				const categoriesArray = categoriesData.map(category => ({
					id: category.id,
					category: category.category
				}));
				updateCategoriesBar(categoriesArray, []); // Pass empty array for selected categories initially
			}
		} catch (error) {
			console.error('Error fetching categories:', error);
		}
	}
	
	// Call initial fetch when the key is verified
	if (savedKey) {
		fetchAndUpdateCategories();
	}
	
	
    // Add API Key Row to container
    container.add(apiKeyRow);

    // Add separator
    const separator = new UIRow();
    separator.dom.style.borderBottom = '1px solid #444';
    separator.setMarginTop('3px');
    separator.setMarginBottom('3px');
    container.add(separator);

    // Assets Grid Section
    let currentPage = 1;
    const limit = 10;
    let assets = [];

	const gridContainer = new UIPanel();
	gridContainer.dom.style.cssText = `
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.5rem;
		padding: 1rem;
		width: 100%;
		height: auto;
		overflow-y: auto;
	`;
	container.add(gridContainer);

	function returnRandomGradient() {
		// make an array of good gradients and return a random pair
		const gradients = [
			['#2aff00', '#00ffb3'],
			['#621396', '#f70000'],
			['#00ffdd', '#aa00ff'],
			['#9900ff', '#00ffd5'],
			['#9fff38', '#42cbd7'],
			['#daff00', '#d30000'],
			['#9900ff', '#7e1c62'],
		];
		return gradients[Math.floor(Math.random() * gradients.length)];
	}
	

	async function fetchAssets(updatedCategories = selectedCategories) { // Use the tracked state as default
		const token = localStorage.getItem('toybox_api_key');
		if (!token) return;
	
		try {
			console.log('Fetching with token:', token);
			
			// Use URLSearchParams to properly format query parameters
			const params = new URLSearchParams({
				search: '',
				categories: '', // Changed from category to categories
				limit: limit.toString(),
				offset: ((currentPage - 1) * limit).toString()
			});
	
			// if updatedCategories is not empty, comma delimit the array 
			if (updatedCategories?.length > 0) {
				params.set('categories', updatedCategories.join(',')); // Always use join, no need for single case
				console.log('Categories param:', params.get('categories'));
			}
	
			const url = `https://cfdb.sxpdigital.workers.dev/assets-by-key?${params.toString()}`;
			console.log('Fetching URL:', url);
	
			// if updatedCategories is not empty, comma delimit the array and add to the `category` param
			if (updatedCategories.length > 0) {
				if (updatedCategories.length === 1) {
					console.log('Single category:', updatedCategories[0]);
					params.set('category', updatedCategories[0]);
				} else {
					console.log('Multiple categories:', updatedCategories);
					params.set('category', updatedCategories.join(','));
				}
			}

			// Update the URL with the new params
			const updatedUrl = `https://cfdb.sxpdigital.workers.dev/assets-by-key?${params.toString()}`;
			console.log('Updated URL:', updatedUrl);

			const response = await fetch(updatedUrl, {
				method: 'GET',
				headers: { 
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				mode: 'cors', // Add CORS mode explicitly
				credentials: 'omit' // Don't send credentials
			});
			const responseText = await response.text();
			console.log('Raw response:', responseText);
			console.log('clean json response:', JSON.parse(responseText));
	
			try {
				const data = JSON.parse(responseText);
				console.log('Parsed data:', data);
	
				if (data.assets) {
					assets = currentPage === 1 ? data.assets : [...assets, ...data.assets];
					updateAssetsGrid();
				} else {
					console.error('No assets found in response');
				}
			} catch (parseError) {
				console.error('Error parsing JSON:', parseError);
				throw new Error('Invalid JSON response');
			}
	
		} catch (error) {
			console.error('Error fetching assets:', error);
			
			// If it's an authentication error, clear the token
			if (error.message.includes('401')) {
				localStorage.removeItem('toybox_api_key');
				statusSpan.dom.className = 'text-red-500';
				statusSpan.setTextContent('○ Not Connected');
			}
		}
	}
	

    function clearAssets() {
        assets = [];
        while (gridContainer.dom.firstChild) {
            gridContainer.dom.removeChild(gridContainer.dom.firstChild);
        }
    }

	function updateAssetsGrid() {
		// Clear existing content
		while (gridContainer.dom.firstChild) {
			gridContainer.dom.removeChild(gridContainer.dom.firstChild);
		}
	
		console.log('Updating grid with assets:', assets);  // Debug log
	
		assets.forEach(asset => {
			console.log("asset", asset);
			const item = new UIPanel();
			item.dom.className = 'asset-card-container mb-8';
		
			// Set background gradient
			let backgroundStyle;
			if (asset.background && 
				JSON.parse(asset.background).backgroundColor && 
				JSON.parse(asset.background).backgroundColor2) {
				const bg = JSON.parse(asset.background);
				backgroundStyle = `
					background-color: ${bg.backgroundColor};
					box-shadow: 0 0 10px 2px ${bg.backgroundColor}1a;
					background-image: linear-gradient(45deg, ${bg.backgroundColor} 0%, ${bg.backgroundColor2} 100%);
				`;
			} else {
				const [color1, color2] = returnRandomGradient();
				backgroundStyle = `
					background-image: linear-gradient(45deg, ${color1} 0%, ${color2} 100%);
				`;
			}
		
			item.dom.style.cssText = `
				${backgroundStyle}
				padding: 1rem;
				border-radius: 1.5rem;
				cursor: pointer;
				text-align: center;
				position: relative;
				max-width: 200px;
				margin: 0 auto 2rem auto;
				transition: transform 0.2s ease-in-out;
			`;
		
			item.dom.addEventListener('mouseenter', () => {
				item.dom.style.transform = 'translateY(-2px)';
			});
		
			item.dom.addEventListener('mouseleave', () => {
				item.dom.style.transform = 'translateY(0)';
			});
		
	
			// Header
			const header = new UIPanel();
			header.dom.className = 'bg-[#222222] rounded-t-lg h-7 w-11/12 pb-2 pt-0 pl-3 text-sm font-bold mb-0 mx-auto text-white text-left';
			const nameWithoutExt = asset.filename.split('.').slice(0, -1).join('.');
			const extension = asset.filename.split('.').pop();
			header.dom.innerHTML = `
				<span class="block truncate">${nameWithoutExt}<span class="text-xs text-slime-400 ml-0">.${extension}</span></span>
			`;
			
			// Thumbnail container
			const thumbnailContainer = new UIPanel();
			const bgStyle = asset.background ? 
				JSON.parse(asset.background) : 
				{backgroundColor: '#ffffff', backgroundColor2: '#000000', gradientCenter: 0.5};
			
			thumbnailContainer.dom.style.cssText = `
				width: 170px;
				height: 170px;
				background-color: ${bgStyle.backgroundColor};
				background-image: url('${asset.thumburl}?thumb=${Date.now()}'), linear-gradient(45deg, ${bgStyle.backgroundColor} 0%, ${bgStyle.backgroundColor2} 100%);
				background-size: contain;
				background-position: center;
				background-repeat: no-repeat;
				border-radius: 8px;
				margin: 0px 0;
				position: relative;
			`;
	
			// Stats bar
			const statsBar = new UIPanel();
			statsBar.dom.className = 'absolute bottom-0 left-0 right-0 flex justify-center gap-4 items-center bg-[#0000004a] rounded-b-lg py-2';
			statsBar.dom.innerHTML = `
				<p class="text-xs text-white">Size: ${(asset.filesize / 1000000).toFixed(3)} MB</p>
				<p class="text-xs text-white">Polys: ${asset.polycount ? asset.polycount.toFixed(0) : '0'}</p>
			`;
			thumbnailContainer.add(statsBar);
	
			// URL and actions bar
			const actionsBar = new UIPanel();
			actionsBar.dom.className = 'flex items-center rounded-full bg-[#1919195a] w-full px-2 py-2 mt-3';
			
			const urlInput = new UIInput(asset.fileurl);
			urlInput.dom.className = 'px-2 py-1 rounded-full w-full text-xs flex-1 shadow-inner-xl focus:outline-none text-left bg-[#00000040] text-white';
			urlInput.dom.disabled = true;
	
			const copyButton = new UIButton('Copy');
			copyButton.dom.className = 'ml-2 text-xs text-black px-1 py-1 rounded-full font-semibold uppercase tracking-wider bg-neonorange-500 hover:bg-neonorange-400';
			copyButton.onClick(() => {
				navigator.clipboard.writeText(asset.fileurl);
				copyButton.dom.textContent = 'Copied!';
				setTimeout(() => copyButton.dom.textContent = 'Copy', 1000);
			});
	
			// const downloadButton = new UIButton('↓');
			// downloadButton.dom.className = 'ml-2 text-sm text-black px-3 py-1 rounded-full font-semibold uppercase tracking-wider bg-neonpink-500';
			// downloadButton.onClick(() => {
			// 	window.open(asset.fileurl, '_blank');
			// });
	
			actionsBar.add(urlInput);
			actionsBar.add(copyButton);
			// actionsBar.add(downloadButton);
	
			// Add all elements to the item
			item.add(header);
			item.add(thumbnailContainer);
			item.add(actionsBar);
	
			// Make draggable
			item.dom.draggable = true;
			item.dom.addEventListener('dragstart', (event) => {
				event.dataTransfer.setData('asset/url', asset.fileurl);
				event.dataTransfer.setData('asset/type', 'model');
			});
	
			gridContainer.add(item);
		});
	}	

    // Load More Button
    const loadMoreButton = new UIButton('Load More');
    loadMoreButton.dom.className = 'button bg-violet-500 text-white px-4 py-2 rounded-full text-sm mt-4';
    loadMoreButton.onClick(() => {
        currentPage++;
        fetchAssets();
    });
    container.add(loadMoreButton);

    // Initial fetch if we have a key
    if (savedKey) {
        fetchAssets();
    }

    return container;
}

export { AssetDrawerToybox };