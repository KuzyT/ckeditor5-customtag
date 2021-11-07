/**
 * Default icon is a code solid icon from FontAwesome 5 free
 * https://fontawesome.com/v5.15/icons/code?style=solid
 * https://fontawesome.com/license
 */
import codeSolidIcon from './../theme/img/code-solid.svg';
import CustomTagFieldConfig from "./customtagfieldconfig";

export default class CustomTagConfig {

    constructor( config ) {
        if (!config.name) {
            console.error('No name set for CustomTag in config');
            return;
        }

        this.name = config.name;
        this.placeholder = config.placeholder || config.name.charAt(0).toUpperCase() + config.name.slice(1);
        this.icon = config.icon || codeSolidIcon;
        /** @type {CustomTagFieldConfig[]} */
        this.fields = [];
        this.fallbackLanguage = config.fallbackLanguage || 'en';
        this.iconToTag = config.iconToTag !== undefined ? !!config.iconToTag : true;
        this.color = config.color || null;

        if (config.fields instanceof Array) {
            config.fields.forEach(configField => {
                if (!configField.name) {
                    console.error(`No name set for field in CustomTag ${config.name} in config`);
                    return;
                }
                this.fields.push(new CustomTagFieldConfig(configField, this.fallbackLanguage));
            });
        }
    }

    isCorrect() {
        return !!this.name;
    }

    getFullName() {
        return 'customtag-' + this.getTagName();
    }

    getTagName() {
        return this.name;
    }

    getIcon() {
        return this.icon;
    }

    getButtonLabel(language) {
        return trans(this.placeholder, language, this.fallbackLanguage);
    }

    getFieldNames() {
        return this.fields.map(customTagFieldConfig => customTagFieldConfig.getFieldName());
    }

    isIconToTag() {
        return this.iconToTag;
    }
}

/**
 * Translate value for language
 * @param value
 * @param language
 * @param fallbackLanguage
 * @returns {*|string}
 */
export function trans(value, language, fallbackLanguage = 'en') {
    if (language instanceof Object) {
        language = language.ui || language.content || null;
    }
    language = language || fallbackLanguage;

    if (value instanceof Object) {
        return value[language] !== undefined
            ? value[language]
            : (
                fallbackLanguage && Object.keys(value).indexOf(fallbackLanguage) !== -1
                    ? value[fallbackLanguage]
                    : (Object.keys(value) ? value[Object.keys(value)[0]] : '') // if no fallbackLanguage exists, use first one, of empty string
            );
    } else {
        return value;
    }
}

