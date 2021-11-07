import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import CustomTagFormView from "./customtagformview";
import CustomTagConfig from "./customtagconfig";

export default class CustomTagUI extends Plugin {
    init() {
        const editor = this.editor;

        const customTags = this.editor.config.get( 'CustomTag.items' );

        customTags.forEach(config => {
            const customTagConfig = new CustomTagConfig(config);
            if (!customTagConfig) {
                return;
            }

            const command = editor.commands.get( customTagConfig.getFullName() );

            editor.ui.componentFactory.add( customTagConfig.getFullName(), locale => {
                const dropdown = createDropdown( locale );

                const customTagForm = new CustomTagFormView( getFormValidators(customTagConfig, editor.config.get( 'language' ) ), editor.locale, editor.config.get( 'language' ), customTagConfig );

                this._setUpDropdown( dropdown, customTagForm, command, locale, customTagConfig );
                this._setUpForm( dropdown, customTagForm, command, locale, customTagConfig );

                return dropdown;
            } )
        });
    }


    /**
     * @param dropdown
     * @param form
     * @param command
     * @param locale
     * @param {CustomTagConfig} customTagConfig
     * @private
     */
    _setUpDropdown( dropdown, form, command, locale, customTagConfig ) {
        const editor = this.editor;
        const button = dropdown.buttonView;

        dropdown.bind( 'isEnabled' ).to( command );
        dropdown.panelView.children.add( form );

        button.set( {
            label: customTagConfig.getButtonLabel(editor.config.get( 'language' )),
            icon: customTagConfig.getIcon(),
            tooltip: true
        } );

        // Note: Use the low priority to make sure the following listener starts working after the
        // default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
        // invisible form/input cannot be focused/selected.
        button.on( 'open', () => {
            form.disableCssTransitions();

            const selection = editor.model.document.selection;

            customTagConfig.fields.forEach(customTagFieldConfig => {
                let value = command.text || getSelectedCustomTagWidgetAttribute(selection, customTagFieldConfig.getFieldName(), customTagConfig) || '';
                if (value === '' && customTagFieldConfig.isDefaultSelected() && getSelectedText(selection)) {
                    value = getSelectedText(selection);
                }
                form.setField(customTagFieldConfig.getFieldName(), value);
            })

            if (form.arInputViews.length) {
                form.arInputViews[0].fieldView.select();
            }

            form.focus();
            form.enableCssTransitions();
        }, { priority: 'low' } );

        dropdown.on( 'submit', () => {
            if ( form.isValid() ) {
                let props = {};
                customTagConfig.fields.forEach(customTagFieldConfig => {
                    props[customTagFieldConfig.getFieldName()] = form.getField(customTagFieldConfig.getFieldName());
                });
                editor.execute( customTagConfig.getFullName(), props );
                closeUI();
            }
        } );

        dropdown.on( 'change:isOpen', () => form.resetFormStatus() );
        dropdown.on( 'cancel', () => closeUI() );

        function closeUI() {
            editor.editing.view.focus();
            dropdown.isOpen = false;
        }
    }

    /**
     * @param dropdown
     * @param form
     * @param command
     * @param {CustomTagConfig} customTagConfig
     * @private
     */
    _setUpForm( dropdown, form, command, customTagConfig ) {
        form.delegate( 'submit', 'cancel' ).to( dropdown );

        if (form.arInputViews.length) {
            form.arInputViews[0].bind( 'value' ).to( command, 'value' );

            // Form elements should be read-only when corresponding commands are disabled.
            form.arInputViews[0].bind( 'isReadOnly' ).to( command, 'isEnabled', value => !value );
        }
    }
}

/**
 * Make validators for form
 * @param {CustomTagConfig} customTagConfig
 * @param language
 * @returns {*[]}
 */
function getFormValidators(customTagConfig, language) {
    let validators = [];

    customTagConfig.fields.forEach(field => {
        if (field.isRequired()) {
            validators.push(form => {
                if ( !form.getField(field.getFieldName()).length ) {
                    return { field: field.getFieldName(), errorText: field.getRequiredMessage(language) };
                }
            });
        }
    });

    return validators;
}

/**
 * Get attribute from CustomTag widget element (for editing)
 * @param selection
 * @param attribute
 * @param {CustomTagConfig} customTagConfig
 * @returns {string|*}
 */
function getSelectedCustomTagWidgetAttribute( selection, attribute, customTagConfig ) {
    const selectedElement = selection.getSelectedElement();

    if ( selectedElement && selectedElement.is( 'element', customTagConfig.getFullName() ) ) {
        return selectedElement.getAttribute(attribute);
    }

    return null;
}

/**
 * Get selected text (for new one)
 * @param selection
 * @returns {string}
 */
function getSelectedText(selection) {
    let selectedText = '';

    for (const item of selection.getFirstRange().getItems()) {
        selectedText = item.data;
    }

    return selectedText;
}
