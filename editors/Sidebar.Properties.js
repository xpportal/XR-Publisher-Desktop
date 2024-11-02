import { UITabbedPanel } from './libs/ui.js';

import { SidebarObject } from './Sidebar.Object.js';
import { SidebarGeometry } from './Sidebar.Geometry.js';
import { SidebarMaterial } from './Sidebar.Material.js';
import { SidebarScript } from './Sidebar.Script.js';
import { SidebarXrPublisher } from './Sidebar.XrPublisher.js';

function SidebarProperties( editor ) {

	const strings = editor.strings;

	const container = new UITabbedPanel();
	container.setId( 'properties' );
	container.addTab( 'xrPublisherTab', strings.getKey( 'sidebar/properties/xrPublisher' ), new SidebarXrPublisher( editor ) );
	container.addTab( 'objectTab', strings.getKey( 'sidebar/properties/object' ), new SidebarObject( editor ) );
	container.addTab( 'geometryTab', strings.getKey( 'sidebar/properties/geometry' ), new SidebarGeometry( editor ) );
	container.addTab( 'materialTab', strings.getKey( 'sidebar/properties/material' ), new SidebarMaterial( editor ) );
	container.addTab( 'scriptTab', strings.getKey( 'sidebar/properties/script' ), new SidebarScript( editor ) );

	container.select( 'objectTab' );

	function getTabByTabId( tabs, tabId ) {

		return tabs.find( function ( tab ) {

			return tab.dom.id === tabId;

		} );

	}

	const geometryTab = getTabByTabId( container.tabs, 'geometryTab' );
	const materialTab = getTabByTabId( container.tabs, 'materialTab' );
	const scriptTab = getTabByTabId( container.tabs, 'scriptTab' );
	const xrPublisherTab = getTabByTabId( container.tabs, 'xrPublisherTab' );

	function toggleTabs( object ) {

		const xrPublisherComponents = [
			'spawnpoint'
		];
		// set a status based on if the current object.userData.type is in the xrPublisherComponents array
		const xrPublisherStatus = object && object.userData && object.userData.type && xrPublisherComponents.includes( object.userData.type );
		container.setHidden( object === null );

		if ( object === null ) return;
		console.log("the object is: ", object.userData.type);

		console.log(object);

		xrPublisherTab.setHidden( ! object.userData.type );

		geometryTab.setHidden( ! object.geometry || xrPublisherStatus );

		materialTab.setHidden( ! object.material || xrPublisherStatus );

		scriptTab.setHidden( object === editor.camera || xrPublisherStatus );

		// set active tab

		if ( container.selected === 'geometryTab' ) {

			container.select( geometryTab.isHidden() ? 'objectTab' : 'geometryTab' );

		} else if ( container.selected === 'materialTab' && ! xrPublisherStatus ) {

			container.select( materialTab.isHidden() ? 'objectTab' : 'materialTab' );

		} else if ( container.selected === 'scriptTab' ) {

			container.select( scriptTab.isHidden() ? 'objectTab' : 'scriptTab' );

		} else if ( container.selected === 'xrPublisherTab' ) {
			
			container.select( xrPublisherTab.isHidden() ? 'objectTab' : 'xrPublisherTab' );

		}

	}

	editor.signals.objectSelected.add( toggleTabs );

	toggleTabs( editor.selected );

	return container;

}

export { SidebarProperties };
