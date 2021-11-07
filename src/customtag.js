import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CustomTagEditing from "./customtagediting";
import CustomTagUI from "./customtagui";

export default class CustomTag extends Plugin {
    static get requires() {
        return [ CustomTagEditing, CustomTagUI ];
    }
}

