import { UIPanel, UIRow, UIInput, UIButton, UIColor, UICheckbox, UIInteger, UITextArea, UIText, UINumber } from './libs/ui.js';
import { TextGeometry, FontLoader } from './libs/three.module.js';

function SidebarObjectText(editor) {
    const signals = editor.signals;
    const strings = editor.strings;

    const container = new UIPanel();
    container.setDisplay('none');

    const headerRow = new UIRow();
    headerRow.add(new UIText('TEXT').setTextTransform('uppercase'));
    container.add(headerRow);

    // Text Content
    const textRow = new UIRow();
    const textInput = new UIInput().setWidth('150px');
    textRow.add(new UIText('Text'));
    textRow.add(textInput);
    container.add(textRow);

    // Text Color
    const colorRow = new UIRow();
    const colorInput = new UIColor().setValue('#ffffff');
    colorRow.add(new UIText('Color'));
    colorRow.add(colorInput);
    container.add(colorRow);

    // Font Size
    const fontSizeRow = new UIRow();
    const fontSize = new UINumber(1).setWidth('50px').setRange(0.1, 10);
    fontSizeRow.add(new UIText('Size'));
    fontSizeRow.add(fontSize);
    container.add(fontSizeRow);

    // Position Controls
    const positionRow = new UIRow();
    const positionX = new UINumber().setWidth('50px');
    const positionY = new UINumber().setWidth('50px');
    const positionZ = new UINumber().setWidth('50px');

    positionRow.add(new UIText('Position'));
    positionRow.add(positionX).add(positionY).add(positionZ);
    container.add(positionRow);

    // Rotation Controls
    const rotationRow = new UIRow();
    const rotationX = new UINumber().setWidth('50px').setStep(10);
    const rotationY = new UINumber().setWidth('50px').setStep(10);
    const rotationZ = new UINumber().setWidth('50px').setStep(10);

    rotationRow.add(new UIText('Rotation'));
    rotationRow.add(rotationX).add(rotationY).add(rotationZ);
    container.add(rotationRow);

    // Scale Controls
    const scaleRow = new UIRow();
    const scaleX = new UINumber(1).setWidth('50px').setRange(0.1, 10);
    const scaleY = new UINumber(1).setWidth('50px').setRange(0.1, 10);
    const scaleZ = new UINumber(1).setWidth('50px').setRange(0.1, 10);

    scaleRow.add(new UIText('Scale'));
    scaleRow.add(scaleX).add(scaleY).add(scaleZ);
    container.add(scaleRow);

    function updateUI(object) {
        const properties = object.userData.properties;
        
        textInput.setValue(properties.text || 'Text');
        colorInput.setValue(properties.color || '#ffffff');
        fontSize.setValue(properties.fontSize || 1);
        
        positionX.setValue(object.position.x);
        positionY.setValue(object.position.y);
        positionZ.setValue(object.position.z);
        
        rotationX.setValue(object.rotation.x * THREE.MathUtils.RAD2DEG);
        rotationY.setValue(object.rotation.y * THREE.MathUtils.RAD2DEG);
        rotationZ.setValue(object.rotation.z * THREE.MathUtils.RAD2DEG);
        
        scaleX.setValue(object.scale.x);
        scaleY.setValue(object.scale.y);
        scaleZ.setValue(object.scale.z);
    }

    function updateText(object) {
        const fontLoader = new FontLoader();
        fontLoader.load('fonts/helvetiker_regular.typeface.json', function(font) {
            const textGeometry = new TextGeometry(textInput.getValue(), {
                font: font,
                size: fontSize.getValue(),
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: false
            });

            object.geometry.dispose();
            object.geometry = textGeometry;
            
            object.material.color.setStyle(colorInput.getValue());
            
            object.userData.properties.text = textInput.getValue();
            object.userData.properties.color = colorInput.getValue();
            object.userData.properties.fontSize = fontSize.getValue();
            
            signals.objectChanged.dispatch(object);
        });
    }

    function setupEventListeners(object) {
        textInput.onChange(() => updateText(object));
        colorInput.onChange(() => {
            object.material.color.setStyle(colorInput.getValue());
            object.userData.properties.color = colorInput.getValue();
            signals.objectChanged.dispatch(object);
        });
        fontSize.onChange(() => updateText(object));

        const updateTransform = () => {
            object.position.set(
                positionX.getValue(),
                positionY.getValue(),
                positionZ.getValue()
            );
            object.rotation.set(
                rotationX.getValue() * THREE.MathUtils.DEG2RAD,
                rotationY.getValue() * THREE.MathUtils.DEG2RAD,
                rotationZ.getValue() * THREE.MathUtils.DEG2RAD
            );
            object.scale.set(
                scaleX.getValue(),
                scaleY.getValue(),
                scaleZ.getValue()
            );

            object.userData.properties.positionX = positionX.getValue();
            object.userData.properties.positionY = positionY.getValue();
            object.userData.properties.positionZ = positionZ.getValue();
            object.userData.properties.rotationX = rotationX.getValue();
            object.userData.properties.rotationY = rotationY.getValue();
            object.userData.properties.rotationZ = rotationZ.getValue();
            object.userData.properties.scaleX = scaleX.getValue();
            object.userData.properties.scaleY = scaleY.getValue();
            object.userData.properties.scaleZ = scaleZ.getValue();

            signals.objectChanged.dispatch(object);
        };

        positionX.onChange(updateTransform);
        positionY.onChange(updateTransform);
        positionZ.onChange(updateTransform);
        rotationX.onChange(updateTransform);
        rotationY.onChange(updateTransform);
        rotationZ.onChange(updateTransform);
        scaleX.onChange(updateTransform);
        scaleY.onChange(updateTransform);
        scaleZ.onChange(updateTransform);
    }

    signals.objectSelected.add(function(object) {
        if (object && object.userData.type === 'text') {
            container.setDisplay('');
            updateUI(object);
            setupEventListeners(object);
        } else {
            container.setDisplay('none');
        }
    });

    return container;
}

export { SidebarObjectText };
