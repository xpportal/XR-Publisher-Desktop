import { UIPanel, UIRow, UIText } from './libs/ui.js';
import { SidebarXrPublisherSpawnPoint } from './Sidebar.XrPublisher.SpawnPoint.js';

function SidebarXrPublisher(editor) {
    const strings = editor.strings;
    const signals = editor.signals;

    let currentObject = null;

    const container = new UIPanel();
    container.setBorderTop('0');
    container.setPaddingTop('20px');
    container.setDisplay('none');

    // Title
    const title = new UIRow();
    title.add(new UIText('Spawn Point').setTextTransform('uppercase'));
    container.add(title);

    // Create containers for different XR publisher panels
    const spawnPointContainer = new SidebarXrPublisherSpawnPoint(editor);
    container.add(spawnPointContainer);

    function update(object) {
        if (object === null) {
            container.setDisplay('none');
            return;
        }

        const type = object?.userData?.type;
        const hasXRProperties = ['spawnpoint'].includes(type);

        if (hasXRProperties) {
            currentObject = object;
            container.setDisplay('block');

            // Show appropriate panel based on type
            if (type === 'spawnpoint') {
                spawnPointContainer.setDisplay('block');
                spawnPointContainer.update(object); // Make sure child panels update too
            } else {
                spawnPointContainer.setDisplay('none');
            }
        } else {
            currentObject = null;
            container.setDisplay('none');
            spawnPointContainer.setDisplay('none');
        }
    }

    // Show/hide panels based on selected object type
    signals.objectSelected.add(update);

    // Update when object properties change
    signals.objectChanged.add(function(object) {
        if (currentObject === object) {
            update(object);
        }
    });

    return container;
}

export { SidebarXrPublisher };