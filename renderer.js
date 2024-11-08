import * as THREE from 'three';
import { Editor } from './editors/Editor.js';
import { Viewport } from './editors/Viewport.js';
import { Toolbar } from './editors/Toolbar.js';
import { Script } from './editors/Script.js';
import { Player } from './editors/Player.js';
import { Sidebar } from './editors/Sidebar.js';
import { AssetDrawer } from './editors/AssetDrawer.js';
import { Menubar } from './editors/Menubar.js';
import { Resizer } from './editors/Resizer.js';
import signals from 'signals';
import './editors/libs/ui.js';
import './editors/libs/ui.three.js';
import './editors/libs/codemirror/codemirror.css'
import './editors/libs/codemirror/theme/monokai.css'
import './editors/libs/codemirror/addon/dialog.css'
import './editors/libs/codemirror/addon/show-hint.css'
import './editors/libs/codemirror/addon/tern.css'
import './styles/main.css'

// Make them globally available
window.signals = signals;
window.URL = window.URL || window.webkitURL;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

const editor = new Editor();
window.editor = editor;
window.THREE = THREE;

const viewport = new Viewport(editor);
document.body.appendChild(viewport.dom);

const toolbar = new Toolbar(editor);
document.body.appendChild(toolbar.dom);

const script = new Script(editor);
document.body.appendChild(script.dom);

const player = new Player(editor);
document.body.appendChild(player.dom);

const sidebar = new Sidebar(editor);
document.body.appendChild(sidebar.dom);

const menubar = new Menubar(editor);
document.body.appendChild(menubar.dom);

const resizer = new Resizer(editor);
document.body.appendChild(resizer.dom);

const assetDrawer = new AssetDrawer(editor);
document.body.appendChild(assetDrawer.dom);

const resizerAssets = new Resizer(editor);
document.body.appendChild(resizerAssets.dom);


// Initialize editor storage and state
editor.storage.init(() => {
	editor.storage.get(async state => {
		if (isLoadingFromHash) return;

		if (state !== undefined) {
			await editor.fromJSON(state);
		}

		const selected = editor.config.getKey('selected');
		if (selected !== undefined) {
			editor.selectByUuid(selected);
		}
	});

	setupAutoSave();
});

function setupAutoSave() {
	let timeout;

	const saveState = () => {
		if (editor.config.getKey('autosave') === false) return;

		clearTimeout(timeout);
		timeout = setTimeout(() => {
			editor.signals.savingStarted.dispatch();
			timeout = setTimeout(() => {
				editor.storage.set(editor.toJSON());
				editor.signals.savingFinished.dispatch();
			}, 100);
		}, 1000);
	};

	// Bind all signals that should trigger a save
	const signals = editor.signals;
	const saveEvents = [
		'geometryChanged', 'objectAdded', 'xrPublisherAdded', 'objectChanged',
		'objectRemoved', 'materialChanged', 'sceneBackgroundChanged',
		'sceneEnvironmentChanged', 'sceneFogChanged', 'sceneGraphChanged',
		'scriptChanged', 'historyChanged'
	];

	saveEvents.forEach(event => signals[event].add(saveState));
}

// Setup drag and drop
document.addEventListener('dragover', event => {
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy';
});

document.addEventListener('drop', event => {
	event.preventDefault();
	console.log(event.dataTransfer.types);
	if (event.dataTransfer.types.includes('asset/url')) {
		const url = event.dataTransfer.getData('asset/url');
		const assetType = event.dataTransfer.getData('asset/type');
		editor.loader.loadFromUrl(url, assetType);
	} else if (event.dataTransfer.types.includes('text/uri-list')) {
		const url = event.dataTransfer.getData('text/uri-list');
		editor.loader.loadFromUrl(url);
	} else if (event.dataTransfer.items) {
		editor.loader.loadItemList(event.dataTransfer.items);
	} else {
		editor.loader.loadFiles(event.dataTransfer.files);
	}
});

// Handle window resize
function onWindowResize() {
	editor.signals.windowResize.dispatch();
}

window.addEventListener('resize', onWindowResize);
onWindowResize();

// Handle file loading from URL hash
let isLoadingFromHash = false;
const hash = window.location.hash;

if (hash.slice(1, 6) === 'file=') {
	const file = hash.slice(6);
	if (confirm(editor.strings.getKey('prompt/file/open'))) {
		const loader = new THREE.FileLoader();
		loader.crossOrigin = '';
		loader.load(file, text => {
			editor.clear();
			editor.fromJSON(JSON.parse(text));
		});
		isLoadingFromHash = true;
	}
}