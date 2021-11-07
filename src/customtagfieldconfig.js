import {trans} from "./customtagconfig";

export default class CustomTagFieldConfig {

    constructor( configField, fallbackLanguage ) {
        this.name= configField.name;
        this.type= ['content', 'attribute'].indexOf(configField.type) !== -1 ? configField.type : 'attribute';
        this.label= configField.label || configField.name.charAt(0).toUpperCase() + configField.name.slice(1);
        this.placeholder= configField.placeholder || configField.label || configField.name.charAt(0).toUpperCase() + configField.name.slice(1);
        this.infoText= configField.infoText || '';
        this.required= !!configField.required;
        this.requiredMessage= configField.requiredMessage || configField.name.charAt(0).toUpperCase() + configField.name.slice(1) + ' must not be empty.';
        this.defaultSelected = !!configField.defaultSelected;
        // Global
        this.fallbackLanguage = fallbackLanguage;
    }

    getLabel(language) {
        return trans(this.label, language, this.fallbackLanguage);
    }

    getPlaceholder(language) {
        return trans(this.placeholder, language, this.fallbackLanguage);
    }

    getInfoText(language) {
        return trans(this.infoText, language, this.fallbackLanguage);
    }

    getFieldName() {
        return this.name;
    }

    isRequired() {
        return this.required;
    }

    isDefaultSelected() {
        return this.defaultSelected;
    }

    isAttribute() {
        return this.type === 'attribute'
    }

    isContent() {
        return this.type === 'content'
    }

    getRequiredMessage(language) {
        return trans(this.requiredMessage, language, this.fallbackLanguage);
    }

}

