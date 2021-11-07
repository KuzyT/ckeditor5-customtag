import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import CustomTagCommand from "./customtagcommand";
import './../theme/customtag.css';
import CustomTagConfig from "./customtagconfig";

export default class CustomTagEditing extends Plugin {
    static get requires() {
        return [ Widget ];
    }

    init() {
        const customTags = this.editor.config.get( 'CustomTag.items' );

        customTags.forEach(config => {
            const customTagConfig = new CustomTagConfig(config);
            if (!customTagConfig) {
                return;
            }

            this._defineSchema( customTagConfig );
            this._defineConverters( customTagConfig );

            this.editor.commands.add( customTagConfig.getFullName(), new CustomTagCommand( this.editor, customTagConfig ) );

            this.editor.editing.mapper.on(
                'viewToModelPosition',
                viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.name === customTagConfig.getTagName() )
            );
        });

    }

    /**
     * Define Schema
     * @param {CustomTagConfig} customTagConfig
     * @private
     */
    _defineSchema(customTagConfig) {
        const schema = this.editor.model.schema;

        schema.register( customTagConfig.getFullName(), {
            // Allow wherever text is allowed:
            allowWhere: '$text',

            // The customTag will act as an inline node:
            isInline: true,

            // The inline widget can have the same attributes as text (for example customtagHref, bold).
            allowAttributesOf: '$text',

            // The customTag can have many types, like date, name, surname, etc:
            allowAttributes: customTagConfig.getFieldNames()
        } );
    }

    /**
     * Define Converters
     * @param {CustomTagConfig} customTagConfig
     * @private
     */
    _defineConverters(customTagConfig) {
        const conversion = this.editor.conversion;

        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: customTagConfig.getTagName(),
            },
            model: ( viewElement, { writer: modelWriter } ) => {
                let modelAttributes = {};

                customTagConfig.fields.forEach(customTagFieldConfig => {
                    modelAttributes[customTagFieldConfig.getFieldName()] = customTagFieldConfig.isAttribute()
                        ? viewElement.getAttribute( customTagFieldConfig.getFieldName() )
                        : (viewElement && viewElement.getChild(0) ? viewElement.getChild(0).data : '');
                });

                return modelWriter.createElement( customTagConfig.getFullName(), modelAttributes);
            }
        } );

        conversion.for( 'editingDowncast' ).elementToElement( {
            model: customTagConfig.getFullName(),
            view: ( modelItem, { writer: viewWriter } ) => {
                const widgetElement = createCustomTagView( modelItem, viewWriter, customTagConfig, true);

                // Enable widget handling on a customTag element inside the editing view.
                return toWidget( widgetElement, viewWriter );
            }
        } );

        conversion.for( 'dataDowncast' ).elementToElement( {
            model: customTagConfig.getFullName(),
            view: ( modelItem, { writer: viewWriter } ) => createCustomTagView( modelItem, viewWriter, customTagConfig )
        } );

        // Helper method for both downcast converters.
        function createCustomTagView( modelItem, viewWriter, customTagConfig, isEditing = false ) {
            let tagAttributes = {}, innerText = '';
            customTagConfig.fields.forEach(customTagFieldConfig => {
                if (customTagFieldConfig.isAttribute() && modelItem.getAttribute( customTagFieldConfig.getFieldName() )) {
                    tagAttributes[customTagFieldConfig.getFieldName()] = modelItem.getAttribute( customTagFieldConfig.getFieldName() );
                } else if (modelItem.getAttribute( customTagFieldConfig.getFieldName() ) && !innerText) {
                    innerText = modelItem.getAttribute( customTagFieldConfig.getFieldName() );
                }
            });

            if (isEditing) {
                tagAttributes.class = 'ck-customtag';
                if (customTagConfig.color) {
                    tagAttributes.style = `color: ${customTagConfig.color}; border-color: ${customTagConfig.color};`
                }
            }

            const customTagView = viewWriter.createContainerElement( customTagConfig.getTagName(), tagAttributes, {
                isAllowedInsideAttributeElement: true
            } );

            const innerTextTag = viewWriter.createText( innerText );
            viewWriter.insert( viewWriter.createPositionAt( customTagView, 0 ), innerTextTag );

            if (isEditing && customTagConfig.isIconToTag() && customTagConfig.getIcon()) {
                viewWriter.insert( viewWriter.createPositionAt( customTagView, 0 ), viewWriter.createRawElement( 'span', { class: 'ck-customtag-icon' }, function( domElement ) {
                    domElement.innerHTML = customTagConfig.getIcon();
                } ) );
            }

            return customTagView;
        }
    }
}
