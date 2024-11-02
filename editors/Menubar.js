import { UIPanel } from './libs/ui.js';

import { MenubarAdd } from './Menubar.Add.js';
import { MenubarEdit } from './Menubar.Edit.js';
import { MenubarFile } from './Menubar.File.js';
import { MenubarView } from './Menubar.View.js';
import { MenubarHelp } from './Menubar.Help.js';
import { MenubarStatus } from './Menubar.Status.js';

function Menubar( editor ) {

	const container = new UIPanel();
	container.setId( 'menubar' );

	const logo = document.createElement( 'img' );
	logo.src = 'editors/images/xrpublisher-logo-2048x475.png'; // Replace with the actual path to your logo
	logo.style.marginLeft = '5px';
	logo.style.maxHeight = '45px';
	logo.style.float = 'left';
	logo.style.marginTop = '13px';
	logo.style.marginLeft = '10px';
	logo.style.marginRight = '10px';
	container.dom.appendChild( logo );

	container.add( logo );
	container.add( new MenubarFile( editor ) );
	container.add( new MenubarEdit( editor ) );
	container.add( new MenubarAdd( editor ) );
	container.add( new MenubarView( editor ) );
	container.add( new MenubarHelp( editor ) );

	container.add( new MenubarStatus( editor ) );

	return container;

}

export { Menubar };
