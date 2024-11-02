import { UIDiv, UIRow, UIText, UIInteger, UIInput, UIColor, UICheckbox } from './libs/ui.js';
import { SetGeometryValueCommand } from './commands/SetGeometryValueCommand.js';
import { SetGeometryCommand } from './commands/SetGeometryCommand.js';

class GeometryParametersPanel extends UIDiv {

    constructor(editor, object) {
        super();

        const signals = editor.signals;
        const strings = editor.strings;

        // TextGeometry parameters are stored in object.userData.properties
        const parameters = object.userData.properties || {};

        // Text Content
        const textContentRow = new UIRow();
        const textContent = new UIInput(parameters.textContent || '').setWidth('150px').onChange(update);
        textContentRow.add(new UIText('Text Content').setWidth('90px'));
        textContentRow.add(textContent);
        this.add(textContentRow);

        // Text Color
        const textColorRow = new UIRow();
        const textColor = new UIColor().setValue(parameters.textColor || '#ffffff').onChange(update);
        textColorRow.add(new UIText('Text Color').setWidth('90px'));
        textColorRow.add(textColor);
        this.add(textColorRow);

        // Destination URL
        const destinationUrlRow = new UIRow();
        const destinationUrl = new UIInput(parameters.destinationUrl || '').setWidth('150px').onChange(update);
        destinationUrlRow.add(new UIText('Destination URL').setWidth('90px'));
        destinationUrlRow.add(destinationUrl);
        this.add(destinationUrlRow);

        // Collidable
        const collidableRow = new UIRow();
        const collidable = new UICheckbox(parameters.collidable || false).onChange(update);
        collidableRow.add(new UIText('Collidable').setWidth('90px'));
        collidableRow.add(collidable);
        this.add(collidableRow);

        function update() {
            const newParameters = {
                ...object.userData.properties,
                textContent: textContent.getValue(),
                textColor: textColor.getValue(),
                destinationUrl: destinationUrl.getValue(),
                collidable: collidable.getValue()
            };

            // Update the text object (first child)
            if (object.children[0]) {
                object.children[0].text = newParameters.textContent;
                object.children[0].color = newParameters.textColor;
                object.children[0].sync();
            }

            // Update userData
            object.userData.properties = newParameters;

            signals.geometryChanged.dispatch(object);
        }
    }
}

export { GeometryParametersPanel };