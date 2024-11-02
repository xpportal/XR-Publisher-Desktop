import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { UIPanel, UIRow, UIText, UIInput, UINumber, UIColor, UICheckbox, UIButton } from './libs/ui.js';
import { Text } from 'troika-three-text';

import { AddObjectCommand } from './commands/AddObjectCommand.js';
import { AddXrPublisherCommand } from './commands/AddXrPublisherCommand.js';

function MenubarAddSpawnPoint(editor) {
    const option = new UIRow();
    option.setClass('option');
    option.setTextContent(editor.strings.getKey('menubar/add/spawnpoint') || 'Spawn Point');
    option.onClick(function() {
        const geometry = new THREE.CapsuleGeometry(0.5, 1.3);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff3399,
            side: THREE.DoubleSide
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'SpawnPoint';
        mesh.userData.type = 'spawnpoint';
        mesh.userData.properties = {
            positionX: 0,
            positionY: 0,
            positionZ: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0
        };

        editor.execute(new AddXrPublisherCommand(editor, mesh));
    });

    return option;
}

function MenubarAddText(editor) {
    const option = new UIRow();
    option.setClass('option');
    option.setTextContent(editor.strings.getKey('menubar/add/text') || 'Text');
    option.onClick(function() {
        const text = new Text();
        text.text = '';
        text.fontSize = 1;
        text.color = new THREE.Color(0xffffff);
        text.anchorX = 'center';
        text.anchorY = 'middle';
        text.sync();

        const textContainer = new THREE.Object3D();
        textContainer.add(text);
        textContainer.name = 'Text';
        
        // This is important - sets the geometry type for proper panel loading
        textContainer.geometry = {
            type: 'TroikaText',
            parameters: textContainer.userData.properties
        };
        
        textContainer.userData.type = 'troika-text';
        textContainer.userData.properties = {
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
            positionX: 0,
            positionY: 0,
            positionZ: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            threeObjectUrl: null,
            destinationUrl: null,
            textContent: '',
            textColor: '#ffffff',
            animations: '',
            collidable: false
        };

        editor.execute(new AddObjectCommand(editor, textContainer));
    });

    return option;
}

function MenubarAdd( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/add' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Spawn Point
	options.add(MenubarAddSpawnPoint(editor));

	// Text
	options.add(MenubarAddText(editor));

	// Group

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/group' ) );
	option.onClick( function () {

		const mesh = new THREE.Group();
		mesh.name = 'Group';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	options.add( option );

	// Mesh

	const meshSubmenuTitle = new UIRow().setTextContent( strings.getKey( 'menubar/add/mesh' ) ).addClass( 'option' ).addClass( 'submenu-title' );
	meshSubmenuTitle.onMouseOver( function () {

		const { top, right } = meshSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle( this.dom );
		meshSubmenu.setLeft( right + 'px' );
		meshSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
		meshSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
		meshSubmenu.setDisplay( 'block' );

	} );
	meshSubmenuTitle.onMouseOut( function () {

		meshSubmenu.setDisplay( 'none' );

	} );
	options.add( meshSubmenuTitle );

	const meshSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
	meshSubmenuTitle.add( meshSubmenu );

	// Mesh / Box

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/box' ) );
	option.onClick( function () {

		const geometry = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Box';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Capsule

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/capsule' ) );
	option.onClick( function () {

		const geometry = new THREE.CapsuleGeometry( 1, 1, 4, 8 );
		const material = new THREE.MeshStandardMaterial();
		const mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Capsule';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Circle

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/circle' ) );
	option.onClick( function () {

		const geometry = new THREE.CircleGeometry( 1, 32, 0, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Circle';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Cylinder

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/cylinder' ) );
	option.onClick( function () {

		const geometry = new THREE.CylinderGeometry( 1, 1, 1, 32, 1, false, 0, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Cylinder';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Dodecahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/dodecahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.DodecahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Dodecahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Icosahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/icosahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.IcosahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Icosahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Lathe

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/lathe' ) );
	option.onClick( function () {

		const geometry = new THREE.LatheGeometry();
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { side: THREE.DoubleSide } ) );
		mesh.name = 'Lathe';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Octahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/octahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.OctahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Octahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Plane

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/plane' ) );
	option.onClick( function () {

		const geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
		const material = new THREE.MeshStandardMaterial();
		const mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Plane';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Ring

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/ring' ) );
	option.onClick( function () {

		const geometry = new THREE.RingGeometry( 0.5, 1, 32, 1, 0, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Ring';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Sphere

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/sphere' ) );
	option.onClick( function () {

		const geometry = new THREE.SphereGeometry( 1, 32, 16, 0, Math.PI * 2, 0, Math.PI );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Sphere';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Sprite

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/sprite' ) );
	option.onClick( function () {

		const sprite = new THREE.Sprite( new THREE.SpriteMaterial() );
		sprite.name = 'Sprite';

		editor.execute( new AddObjectCommand( editor, sprite ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Tetrahedron

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/tetrahedron' ) );
	option.onClick( function () {

		const geometry = new THREE.TetrahedronGeometry( 1, 0 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Tetrahedron';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Torus

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/torus' ) );
	option.onClick( function () {

		const geometry = new THREE.TorusGeometry( 1, 0.4, 12, 48, Math.PI * 2 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Torus';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / TorusKnot

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/torusknot' ) );
	option.onClick( function () {

		const geometry = new THREE.TorusKnotGeometry( 1, 0.4, 64, 8, 2, 3 );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'TorusKnot';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Mesh / Tube

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/mesh/tube' ) );
	option.onClick( function () {

		const path = new THREE.CatmullRomCurve3( [
			new THREE.Vector3( 2, 2, - 2 ),
			new THREE.Vector3( 2, - 2, - 0.6666666666666667 ),
			new THREE.Vector3( - 2, - 2, 0.6666666666666667 ),
			new THREE.Vector3( - 2, 2, 2 )
		] );

		const geometry = new THREE.TubeGeometry( path, 64, 1, 8, false );
		const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
		mesh.name = 'Tube';

		editor.execute( new AddObjectCommand( editor, mesh ) );

	} );
	meshSubmenu.add( option );

	// Light

	const lightSubmenuTitle = new UIRow().setTextContent( strings.getKey( 'menubar/add/light' ) ).addClass( 'option' ).addClass( 'submenu-title' );
	lightSubmenuTitle.onMouseOver( function () {

		const { top, right } = lightSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle( this.dom );

		lightSubmenu.setLeft( right + 'px' );
		lightSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
		lightSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
		lightSubmenu.setDisplay( 'block' );

	} );
	lightSubmenuTitle.onMouseOut( function () {

		lightSubmenu.setDisplay( 'none' );

	} );
	options.add( lightSubmenuTitle );

	const lightSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
	lightSubmenuTitle.add( lightSubmenu );

	// Light / Ambient

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/light/ambient' ) );
	option.onClick( function () {

		const color = 0x222222;

		const light = new THREE.AmbientLight( color );
		light.name = 'AmbientLight';

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	lightSubmenu.add( option );

	// Light / Directional

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/light/directional' ) );
	option.onClick( function () {

		const color = 0xffffff;
		const intensity = 1;

		const light = new THREE.DirectionalLight( color, intensity );
		light.name = 'DirectionalLight';
		light.target.name = 'DirectionalLight Target';

		light.position.set( 5, 10, 7.5 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	lightSubmenu.add( option );

	// Light / Hemisphere

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/light/hemisphere' ) );
	option.onClick( function () {

		const skyColor = 0x00aaff;
		const groundColor = 0xffaa00;
		const intensity = 1;

		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		light.name = 'HemisphereLight';

		light.position.set( 0, 10, 0 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	lightSubmenu.add( option );

	// Light / Point

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/light/point' ) );
	option.onClick( function () {

		const color = 0xffffff;
		const intensity = 1;
		const distance = 0;

		const light = new THREE.PointLight( color, intensity, distance );
		light.name = 'PointLight';

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	lightSubmenu.add( option );

	// Light / Spot

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/light/spot' ) );
	option.onClick( function () {

		const color = 0xffffff;
		const intensity = 1;
		const distance = 0;
		const angle = Math.PI * 0.1;
		const penumbra = 0;

		const light = new THREE.SpotLight( color, intensity, distance, angle, penumbra );
		light.name = 'SpotLight';
		light.target.name = 'SpotLight Target';

		light.position.set( 5, 10, 7.5 );

		editor.execute( new AddObjectCommand( editor, light ) );

	} );
	lightSubmenu.add( option );

	// Camera

	const cameraSubmenuTitle = new UIRow().setTextContent( strings.getKey( 'menubar/add/camera' ) ).addClass( 'option' ).addClass( 'submenu-title' );
	cameraSubmenuTitle.onMouseOver( function () {

		const { top, right } = cameraSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle( this.dom );

		cameraSubmenu.setLeft( right + 'px' );
		cameraSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
		cameraSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
		cameraSubmenu.setDisplay( 'block' );

	} );
	cameraSubmenuTitle.onMouseOut( function () {

		cameraSubmenu.setDisplay( 'none' );

	} );
	options.add( cameraSubmenuTitle );

	const cameraSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
	cameraSubmenuTitle.add( cameraSubmenu );

	// Camera / Orthographic

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/camera/orthographic' ) );
	option.onClick( function () {

		const aspect = editor.camera.aspect;
		const camera = new THREE.OrthographicCamera( - aspect, aspect );
		camera.name = 'OrthographicCamera';

		editor.execute( new AddObjectCommand( editor, camera ) );

	} );
	cameraSubmenu.add( option );

	// Camera / Perspective

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/camera/perspective' ) );
	option.onClick( function () {

		const camera = new THREE.PerspectiveCamera();
		camera.name = 'PerspectiveCamera';

		editor.execute( new AddObjectCommand( editor, camera ) );

	} );
	cameraSubmenu.add( option );

	return container;

}

export { MenubarAdd };
