import { UIPanel, UIRow, UIText, UINumber } from './libs/ui.js';
import { SetValueCommand } from './commands/SetValueCommand.js';

function SidebarXrPublisherSpawnPoint(editor) {
    const signals = editor.signals;
    const strings = editor.strings;

    const container = new UIPanel();
    container.setBorderTop('0');
    container.setPaddingTop('20px');
    container.setDisplay('none');

    // Position Settings
    const positionRow = new UIRow();
    const positionX = new UINumber().setPrecision(3).setWidth('50px').onChange(updatePosition);
    const positionY = new UINumber().setPrecision(3).setWidth('50px').onChange(updatePosition);
    const positionZ = new UINumber().setPrecision(3).setWidth('50px').onChange(updatePosition);

    positionRow.add(new UIText('Spawn Position').setClass('Label'));
    positionRow.add(positionX, positionY, positionZ);

    container.add(positionRow);

    // Rotation Settings
    const rotationRow = new UIRow();
    const rotationX = new UINumber().setStep(10).setNudge(0.1).setUnit('°').setWidth('50px').onChange(updateRotation);
    const rotationY = new UINumber().setStep(10).setNudge(0.1).setUnit('°').setWidth('50px').onChange(updateRotation);
    const rotationZ = new UINumber().setStep(10).setNudge(0.1).setUnit('°').setWidth('50px').onChange(updateRotation);

    rotationRow.add(new UIText('Spawn Rotation').setClass('Label'));
    rotationRow.add(rotationX, rotationY, rotationZ);

    container.add(rotationRow);

    function updatePosition() {
        const object = editor.selected;
        if (object === null || object.userData.type !== 'spawnpoint') return;

        const newPosition = {
            positionX: positionX.getValue(),
            positionY: positionY.getValue(),
            positionZ: positionZ.getValue()
        };

        editor.execute(new SetValueCommand(editor, object, 'userData.properties', {
            ...object.userData.properties,
            ...newPosition
        }));
    }

    function updateRotation() {
        const object = editor.selected;
        if (object === null || object.userData.type !== 'spawnpoint') return;

        const newRotation = {
            rotationX: rotationX.getValue(),
            rotationY: rotationY.getValue(),
            rotationZ: rotationZ.getValue()
        };

        editor.execute(new SetValueCommand(editor, object, 'userData.properties', {
            ...object.userData.properties,
            ...newRotation
        }));
    }

    function update(object) {
        if (object === null || object.userData.type !== 'spawnpoint') {
            container.setDisplay('none');
            return;
        }

        const properties = object.userData.properties;
        
        // Update position inputs
        positionX.setValue(properties.positionX || 0);
        positionY.setValue(properties.positionY || 0);
        positionZ.setValue(properties.positionZ || 0);
        
        // Update rotation inputs
        rotationX.setValue(properties.rotationX || 0);
        rotationY.setValue(properties.rotationY || 0);
        rotationZ.setValue(properties.rotationZ || 0);

        container.setDisplay('block');
    }

    // This allows the parent to trigger updates
    container.update = update;

    return container;
}

export { SidebarXrPublisherSpawnPoint };