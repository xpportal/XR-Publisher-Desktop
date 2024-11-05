import { Command } from '../Command.js';

class AddModelCommand extends Command {
    constructor(editor, model) {
        super(editor);
        
        this.type = 'AddModelCommand';
        this.name = 'Add Model';
        
        this.model = model;
        this.parent = null;
        this.oldParent = null;
    }

    execute() {
        if (this.parent === null) {
            this.parent = this.editor.scene;
        }
        
        this.parent.add(this.model);
        this.model.dispatchEvent({ type: 'added' });
        this.editor.signals.objectAdded.dispatch(this.model);
        this.editor.signals.sceneGraphChanged.dispatch();
    }

    undo() {
        if (this.parent !== null) {
            this.parent.remove(this.model);
            this.model.dispatchEvent({ type: 'removed' });
            this.editor.signals.objectRemoved.dispatch(this.model);
            this.editor.signals.sceneGraphChanged.dispatch();
        }
    }

    toJSON() {
        const output = super.toJSON(this);
        output.modelUuid = this.model.uuid;
        output.parentUuid = this.parent.uuid;
        return output;
    }

    fromJSON(json) {
        super.fromJSON(json);
        this.model = this.editor.objectByUuid(json.modelUuid);
        this.parent = this.editor.objectByUuid(json.parentUuid);
    }
}

export { AddModelCommand };
