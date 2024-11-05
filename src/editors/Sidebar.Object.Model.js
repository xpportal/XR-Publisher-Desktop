import { UINumber, UIRow, UIText, UIInput, UICheckbox } from './libs/ui.js';
import { ModelObject } from './ModelObject.js';

function SidebarObjectModel(editor) {
    const signals = editor.signals;
    const strings = editor.strings;

    const container = new UIDiv();
    container.setDisplay('none');

    // Model URL
    const urlRow = new UIRow();
    urlRow.add(new UIText('URL'));
    const urlInput = new UIInput('').setWidth('150px');
    urlRow.add(urlInput);
    container.add(urlRow);

    // Transform controls (similar to spawn point)
    // Position
    const positionRow = new UIRow();
    positionRow.add(new UIText('Position'));
    const positionX = new UINumber().setWidth('50px');
    const positionY = new UINumber().setWidth('50px');
    const positionZ = new UINumber().setWidth('50px');
    positionRow.add(new UIText('X')).add(positionX)
               .add(new UIText('Y')).add(positionY)
               .add(new UIText('Z')).add(positionZ);
    container.add(positionRow);

    // Rotation
    const rotationRow = new UIRow();
    rotationRow.add(new UIText('Rotation'));
    const rotationX = new UINumber().setWidth('50px');
    const rotationY = new UINumber().setWidth('50px');
    const rotationZ = new UINumber().setWidth('50px');
    rotationRow.add(new UIText('X')).add(rotationX)
               .add(new UIText('Y')).add(rotationY)
               .add(new UIText('Z')).add(rotationZ);
    container.add(rotationRow);

    // Scale
    const scaleRow = new UIRow();
    scaleRow.add(new UIText('Scale'));
    const scaleX = new UINumber(1).setWidth('50px');
    const scaleY = new UINumber(1).setWidth('50px');
    const scaleZ = new UINumber(1).setWidth('50px');
    scaleRow.add(new UIText('X')).add(scaleX)
            .add(new UIText('Y')).add(scaleY)
            .add(new UIText('Z')).add(scaleZ);
    container.add(scaleRow);

    // Collidable checkbox
    const collidableRow = new UIRow();
    const collidableCheckbox = new UICheckbox(false);
    collidableRow.add(new UIText('Collidable'));
    collidableRow.add(collidableCheckbox);
    container.add(collidableRow);

    // Alt text
    const altRow = new UIRow();
    const altInput = new UIInput('').setWidth('150px');
    altRow.add(new UIText('Alt Text'));
    altRow.add(altInput);
    container.add(altRow);

    function updateUI(object) {
        if (!object || object.userData.type !== 'model') return;

        const properties = object.userData.properties;
        
        urlInput.setValue(properties.url || '');
        
        positionX.setValue(object.position.x);
        positionY.setValue(object.position.y);
        positionZ.setValue(object.position.z);
        
        rotationX.setValue(object.rotation.x * THREE.MathUtils.RAD2DEG);
        rotationY.setValue(object.rotation.y * THREE.MathUtils.RAD2DEG);
        rotationZ.setValue(object.rotation.z * THREE.MathUtils.RAD2DEG);
        
        scaleX.setValue(object.scale.x);
        scaleY.setValue(object.scale.y);
        scaleZ.setValue(object.scale.z);
        
        collidableCheckbox.setValue(properties.collidable);
        altInput.setValue(properties.alt || '');
    }

    function setupEventListeners(object) {
        const updateTransform = () => {
            const properties = {
                positionX: positionX.getValue(),
                positionY: positionY.getValue(),
                positionZ: positionZ.getValue(),
                rotationX: rotationX.getValue(),
                rotationY: rotationY.getValue(),
                rotationZ: rotationZ.getValue(),
                scaleX: scaleX.getValue(),
                scaleY: scaleY.getValue(),
                scaleZ: scaleZ.getValue(),
                collidable: collidableCheckbox.getValue(),
                alt: altInput.getValue()
            };
            
            object.updateProperties(properties);
        };

        [positionX, positionY, positionZ,
         rotationX, rotationY, rotationZ,
         scaleX, scaleY, scaleZ,
         collidableCheckbox, altInput].forEach(control => {
            control.onChange(updateTransform);
        });

        urlInput.onChange(() => {
            const url = urlInput.getValue();
            if (url) {
                object.loadModel(url);
            }
        });
    }

	signals.objectSelected.add(function(object) {
		console.log("objectSelected", object);
        if (object && object.userData.type === 'model') {
            container.setDisplay('');
            updateUI(object);
            setupEventListeners(object);
        } else {
            container.setDisplay('none');
        }
    });

    return container;
}

export { AddModelCommand, ModelObject, SidebarObjectModel };
