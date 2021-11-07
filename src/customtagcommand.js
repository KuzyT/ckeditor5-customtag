import Command from "@ckeditor/ckeditor5-core/src/command";

export default class CustomTagCommand extends Command {

    execute( props ) {
        const editor = this.editor;
        const model = editor.model;

        model.change( writer => {
            //Create a <placeholder> elment with the "name" attribute (and all the selection attributes)...
            const customTag = writer.createElement( this.customTagConfig.getFullName(), props);

            // ... and insert it into the document.
            model.insertContent( customTag );

            // Put the selection on the inserted element.
            writer.setSelection( customTag, 'on' );
        } );
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;

        this.isEnabled = model.schema.checkChild(selection.focus.parent, this.customTagConfig.getFullName());
    }

    /**
     * Constructor
     * @param editor
     * @param {CustomTagConfig} customTagConfig
     */
    constructor(editor, customTagConfig) {
        super(editor);
        this.customTagConfig = customTagConfig;
    }
}
