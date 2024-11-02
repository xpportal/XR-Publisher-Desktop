import { UINumber, UIRow, UIText } from './libs/ui.js';

function SidebarObjectSpawnPoint(editor) {
    const signals = editor.signals;
    const strings = editor.strings;

    const container = new UIDiv();
    container.setDisplay('none');

    const headerRow = new UIRow();
    headerRow.add(new UIText('SPAWN POINT').setTextTransform('uppercase'));
    container.add(headerRow);

    // Position Controls
    const positionRow = new UIRow();
    positionRow.add(new UIText('Position'));
    container.add(positionRow);

    const positionX = new UINumber().setWidth('50px');
    const positionY = new UINumber().setWidth('50px');
    const positionZ = new UINumber().setWidth('50px');

    const positionControls = new UIRow()
        .add(new UIText('X').setWidth('20px'))
        .add(positionX)
        .add(new UIText('Y').setWidth('20px'))
        .add(positionY)
        .add(new UIText('Z').setWidth('20px'))
        .add(positionZ);

    container.add(positionControls);

    // Rotation Controls
    const rotationRow = new UIRow();
    rotationRow.add(new UIText('Rotation'));
    container.add(rotationRow);

    const rotationX = new UINumber().setWidth('50px').setStep(10);
    const rotationY = new UINumber().setWidth('50px').setStep(10);
    const rotationZ = new UINumber().setWidth('50px').setStep(10);

    const rotationControls = new UIRow()
        .add(new UIText('X').setWidth('20px'))
        .add(rotationX)
        .add(new UIText('Y').setWidth('20px'))
        .add(rotationY)
        .add(new UIText('Z').setWidth('20px'))
        .add(rotationZ);

    container.add(rotationControls);

    function updateSpawnPoint(object) {
        positionX.setValue(object.position.x);
        positionY.setValue(object.position.y);
        positionZ.setValue(object.position.z);

        rotationX.setValue(object.rotation.x * THREE.MathUtils.RAD2DEG);
        rotationY.setValue(object.rotation.y * THREE.MathUtils.RAD2DEG);
        rotationZ.setValue(object.rotation.z * THREE.MathUtils.RAD2DEG);
    }

    function setupEventListeners(object) {
        const updatePosition = () => {
            object.position.set(
                positionX.getValue(),
                positionY.getValue(),
                positionZ.getValue()
            );
            object.userData.properties.positionX = positionX.getValue();
            object.userData.properties.positionY = positionY.getValue();
            object.userData.properties.positionZ = positionZ.getValue();
            signals.objectChanged.dispatch(object);
            signals.xrPublisherChanged.dispatch(object);
        };

        const updateRotation = () => {
            object.rotation.set(
                rotationX.getValue() * THREE.MathUtils.DEG2RAD,
                rotationY.getValue() * THREE.MathUtils.DEG2RAD,
                rotationZ.getValue() * THREE.MathUtils.DEG2RAD
            );
            object.userData.properties.rotationX = rotationX.getValue();
            object.userData.properties.rotationY = rotationY.getValue();
            object.userData.properties.rotationZ = rotationZ.getValue();
            signals.objectChanged.dispatch(object);
			signals.xrPublisherChanged.dispatch(object);
        };

        positionX.onChange(updatePosition);
        positionY.onChange(updatePosition);
        positionZ.onChange(updatePosition);
        rotationX.onChange(updateRotation);
        rotationY.onChange(updateRotation);
        rotationZ.onChange(updateRotation);
    }

    signals.objectSelected.add(function(object) {
        if (object && object.userData.type === 'spawnpoint') {
            container.setDisplay('');
            updateSpawnPoint(object);
            setupEventListeners(object);
        } else {
            container.setDisplay('none');
        }
    });

    return container;
}

export { MenubarAddSpawnPoint, SidebarObjectSpawnPoint };
