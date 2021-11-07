/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/ui/mediaformview
 */

import {
	ButtonView,
	FocusCycler,
	LabeledFieldView,
	View,
	ViewCollection,
	createLabeledInputText,
	injectCssTransitionDisabler,
	submitHandler
} from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';
import { icons } from 'ckeditor5/src/core';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';

export default class CustomTagFormView extends View {
	/**
	 * @param {Array.<Function>} validators Form validators used by {@link #isValid}.
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {string} language
	 * @param {CustomTagConfig} customTagConfig
	 */
	constructor( validators, locale, language, customTagConfig ) {
		super( locale );

		const t = locale.t;

		this.language = language;

		/**
		 * Tracks information about the DOM focus in the form.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		this.customTagInputValues = {};
		this.inputViews = {};
		this.arInputViews = [];

		customTagConfig.fields.forEach(customTagFieldConfig => {
			this.customTagInputValues[customTagFieldConfig.getFieldName()] = '';
			this.inputViews[customTagFieldConfig.getFieldName()] = this._createFieldInput(customTagFieldConfig);
			// For keep order
			this.arInputViews.push(this.inputViews[customTagFieldConfig.getFieldName()]);
		});

		/**
		 * The Save button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.saveButtonView = this._createButton( t( 'Save' ), icons.check, 'ck-button-save' );
		this.saveButtonView.type = 'submit';

		/**
		 * The Cancel button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.cancelButtonView = this._createButton( t( 'Cancel' ), icons.cancel, 'ck-button-cancel', 'cancel' );

		/**
		 * A collection of views that can be focused in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._focusables = new ViewCollection();

		/**
		 * Helps cycling over {@link #_focusables} in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the <kbd>Tab</kbd> key.
				focusNext: 'tab'
			}
		} );

		/**
		 * An array of form validators used by {@link #isValid}.
		 *
		 * @readonly
		 * @protected
		 * @member {Array.<Function>}
		 */
		this._validators = validators;

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-media-form',
					'ck-responsive-form'
				],

				tabindex: '-1'
			},

			children: [
				...this.arInputViews,
				this.saveButtonView,
				this.cancelButtonView
			]
		} );

		injectCssTransitionDisabler( this );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		submitHandler( {
			view: this
		} );

		const childViews = [
			...this.arInputViews,
			this.saveButtonView,
			this.cancelButtonView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );

		const stopPropagation = data => data.stopPropagation();

		// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
		// keystroke handler would take over the key management in the URL input. We need to prevent
		// this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
		this.keystrokes.set( 'arrowright', stopPropagation );
		this.keystrokes.set( 'arrowleft', stopPropagation );
		this.keystrokes.set( 'arrowup', stopPropagation );
		this.keystrokes.set( 'arrowdown', stopPropagation );

		// Intercept the `selectstart` event, which is blocked by default because of the default behavior
		// of the DropdownView#panelView.
		// TODO: blocking `selectstart` in the #panelView should be configurable per–drop–down instance.
		this.arInputViews.forEach(inputView => {
			this.listenTo( inputView.element, 'selectstart', ( evt, domEvt ) => {
				domEvt.stopPropagation();
			}, { priority: 'high' } );
		})
	}

	/**
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	getField( field ) {
		return this.inputViews[field].fieldView.element.value.trim();
	}

	setField( field, value ) {
		this.inputViews[field].fieldView.element.value = value.trim();
	}

	/**
	 * Validates the form and returns `false` when some fields are invalid.
	 *
	 * @returns {Boolean}
	 */
	isValid() {
		this.resetFormStatus();
		let isValid = true;

		for ( const validator of this._validators ) {
			const error = validator( this );

			// One error per field is enough.
			if ( error ) {
				// Apply updated error.
				//this.textInputView.errorText = errorText;
				this.inputViews[error.field].errorText = error.errorText;

				isValid = false;
			}
		}

		return isValid;
	}

	/**
	 * Cleans up the supplementary error and information text of the {@link #textInputView}
	 * bringing them back to the state when the form has been displayed for the first time.
	 *
	 * See {@link #isValid}.
	 */
	resetFormStatus() {
		this.arInputViews.forEach(inputView => {
			inputView.errorText = null;
		})
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @param {CustomTagFieldConfig} customTagFieldConfig
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} Labeled field view instance.
	 * @private
	 */
	_createFieldInput(customTagFieldConfig) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const inputField = labeledInput.fieldView;

		labeledInput.label = customTagFieldConfig.getLabel(this.language);
		labeledInput.placeholder = customTagFieldConfig.getPlaceholder(this.language);
		labeledInput.infoText = customTagFieldConfig.getInfoText(this.language);

		inputField.on( 'input', () => {
			this.customTagInputValues[customTagFieldConfig.getFieldName()] = inputField.element.value.trim();
		} );

		return labeledInput;
	}

	/**
	 * Creates a button view.
	 *
	 * @private
	 * @param {String} label The button label.
	 * @param {String} icon The button icon.
	 * @param {String} className The additional button CSS class name.
	 * @param {String} [eventName] An event name that the `ButtonView#execute` event will be delegated to.
	 * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
	 */
	_createButton( label, icon, className, eventName ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
	}
}
