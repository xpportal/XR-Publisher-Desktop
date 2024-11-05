import { UIPanel, UIRow } from './libs/ui.js';

function getEnvironmentBlockMarkup(environment) {
	let markup = `<three-environment-block class="wp-block-xr-publisher-environment alignfull" `;
	markup += `devicetarget="${environment.deviceTarget}" `;
	markup += `threeobjecturl="${environment.threeObjectUrl}" `;
	markup += `scale="${environment.scale}" `;
	markup += `positiony="${environment.positionY}" `;
	markup += `rotationy="${environment.rotationY}" `;
	markup += `animations="${environment.animations}" `;
	markup += `camcollisions="${environment.camCollisions}">\n`;
	return markup;
  }
  
  function getSpawnPointMarkup(spawnPoint) {
	let markup = `<!-- wp:xr-publisher/spawn-point-block ${JSON.stringify(spawnPoint)} -->\n`;
	markup += `<three-spawn-point-block class="wp-block-xr-publisher-spawn-point-block" `;
	markup += `positionx="${spawnPoint.positionX}" `;
	markup += `positiony="${spawnPoint.positionY}" `;
	markup += `positionz="${spawnPoint.positionZ}" `;
	markup += `rotationx="${spawnPoint.rotationX}" `;
	markup += `rotationy="${spawnPoint.rotationY}" `;
	markup += `rotationz="${spawnPoint.rotationZ}"></three-spawn-point-block>\n`;
	markup += `<!-- /wp:xr-publisher/spawn-point-block -->\n\n`;
	return markup;
  }
  
  function getModelBlockMarkup(object) {
	const model = {
	  threeObjectUrl: object.userData.threeObjectUrl || null,
	  scaleX: object.scale.x,
	  scaleY: object.scale.y,
	  scaleZ: object.scale.z,
	  positionX: object.position.x,
	  positionY: object.position.y,
	  positionZ: object.position.z,
	  rotationX: object.rotation.x,
	  rotationY: object.rotation.y,
	  rotationZ: object.rotation.z,
	  animations: object.userData.animations || '',
	  collidable: object.userData.collidable || false,
	  alt: object.userData.alt || ''
	};
  
	let markup = `<!-- wp:xr-publisher/model-block ${JSON.stringify(model)} -->\n`;
	markup += `<three-model-block class="wp-block-xr-publisher-model-block" `;
	markup += `threeobjecturl="${model.threeObjectUrl}" `;
	markup += `scalex="${model.scaleX}" `;
	markup += `scaley="${model.scaleY}" `;
	markup += `scalez="${model.scaleZ}" `;
	markup += `positionx="${model.positionX}" `;
	markup += `positiony="${model.positionY}" `;
	markup += `positionz="${model.positionZ}" `;
	markup += `rotationx="${model.rotationX}" `;
	markup += `rotationy="${model.rotationY}" `;
	markup += `rotationz="${model.rotationZ}" `;
	markup += `animations="${model.animations}" `;
	markup += `collidable="${model.collidable ? 1 : 0}" `;
	markup += `alt="${model.alt}"></three-model-block>\n`;
	markup += `<!-- /wp:xr-publisher/model-block -->\n\n`;
	return markup;
  }

function MenubarPublish(editor) {
	const container = new UIPanel();
	container.setClass('menu');
  
	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent('Publish');
	container.add(title);
  
	const options = new UIPanel();
	options.setClass('options');
	container.add(options);
  
	// Generate preview image from viewport
	async function generatePreview() {
		// Get the viewport's renderer
		const container = document.getElementById('viewport');
		if (!container) return null;
	
		// Find the THREE.js canvas
		const canvas = container.querySelector('canvas');
		if (!canvas) return null;
		
		// Force a render to ensure we capture the current state
		const renderer = editor.scene.userData.renderer;
		if (renderer) {
		renderer.render(editor.scene, editor.camera);
		}
	
		// Get the image data
		return canvas.toDataURL('image/jpeg', 0.8);
	}

	async function publishWorld() {
		const apiKey = localStorage.getItem('xr_publisher_api_key');
		
		if (!apiKey) {
		  editor.signals.xrPublisherApiKeyNeeded.dispatch();
		  return;
		}
	  
		const [username] = apiKey.split('.');
		const scene = editor.scene;
		
		// Generate preview image
		const previewImage = await generatePreview();
	  
		// Generate HTML content
		const markup = generateWorldMarkup(scene);
	  
		// Create metadata
		const metadata = {
		  name: scene.name || 'Untitled World',
		  slug: scene.name?.toLowerCase().replace(/\s+/g, '-') || 'untitled-world',
		  version: '1.0.0',
		  short_description: scene.userData.description || '',
		  visibility: 'public',
		  entry_point: '0,0,0',
		  capacity: 100,
		  content_rating: 'everyone',
		  tags: scene.userData.tags || []
		};

		const CORS_HEADERS = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': '86400',
		  };
		  
	  
		  const fetchOptions = {
			method: 'POST',
			headers: {
			  'Authorization': `Bearer ${apiKey}`,
			  'Accept': 'application/json',
			  'Content-Type': 'application/json'
			},
			mode: 'cors',
			credentials: 'omit'
		  };
						  
		try {
		  // Upload world HTML
		  const htmlResponse = await fetch('https://xr-publisher.sxpdigital.workers.dev/upload-world', {
			...fetchOptions,
			body: JSON.stringify({
			  userId: username,
			  worldName: metadata.name,
			  htmlData: markup,
			  preview: previewImage
			})
		  });
	  
		  if (!htmlResponse.ok) throw new Error('Failed to upload world HTML');
	  
		  // Upload metadata
		  const metadataResponse = await fetch('https://xr-publisher.sxpdigital.workers.dev/world-metadata', {
			...fetchOptions,
			body: JSON.stringify({
			  userId: username,
			  worldName: metadata.name,
			  metadata
			})
		  });
	  
		  if (!metadataResponse.ok) throw new Error('Failed to upload world metadata');
	  
		  alert('World published successfully!');
		} catch (error) {
		  if (error.message.includes('401')) {
			localStorage.removeItem('xr_publisher_api_key');
			editor.signals.xrPublisherApiKeyNeeded.dispatch();
		  } else {
			console.error('Publishing error:', error);
			alert('Failed to publish world: ' + error.message);
		  }
		}
	  }
  
	// Add publish option
	const publishOption = new UIRow();
	publishOption.setClass('option');
	publishOption.setTextContent('Publish to XR Publisher');
	publishOption.onClick(publishWorld);
	options.add(publishOption);
  
	return container;
  }
  
  function generateWorldMarkup(scene) {
	let markup = '';
	
	// Environment block
	const environment = {
	  threeObjectUrl: scene.userData.threeObjectUrl || null,
	  scale: scene.scale.x || 1,
	  positionY: scene.position.y || 0,
	  rotationY: scene.rotation.y || 0,
	  deviceTarget: 'vr',
	  animations: '',
	  camCollisions: 1
	};
  
	markup += `<!-- wp:xr-publisher/environment ${JSON.stringify(environment)} -->\n`;
	markup += getEnvironmentBlockMarkup(environment);
	
	// Spawn point
	const spawnPoint = {
	  positionX: 0,
	  positionY: 1.3,
	  positionZ: -5,
	  rotationX: 0,
	  rotationY: 0,
	  rotationZ: 0
	};
	
	markup += getSpawnPointMarkup(spawnPoint);
	
	// Add models
	scene.traverse((object) => {
	  if (object.isObject3D && object !== scene && !object.isCamera && !object.isLight) {
		markup += getModelBlockMarkup(object);
	  }
	});
	
	// Close environment block
	markup += `</three-environment-block>\n`;
	markup += `<!-- /wp:xr-publisher/environment -->`;
	
	return markup;
  }
	

export { MenubarPublish };