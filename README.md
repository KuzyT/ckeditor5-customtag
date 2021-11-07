
# ckeditor5-customtag

## About
Plugin for [ckeditor5](https://github.com/ckeditor/ckeditor5) that let you insert custom tag with content and attributes from form. It could be helpful for custom tags like Vue components like:
```html
<customtag name="Custom tag name" custom-link="Custom tag inner link">Custom tag content</customtag>
```

## Thanks
This plugin was inspired by [ckeditor5-custom-element](https://www.npmjs.com/package/ckeditor5-custom-element) from [centaur54dev](https://github.com/centaur54dev), but I need the ability to create tags with editable attributes, so I had to do new plugin for it. Form looks like [ckeditor5-media-embed](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed) plugin, config and instruction a little similar to [ckeditor5-custom-element](https://www.npmjs.com/package/ckeditor5-custom-element). I need this plugin for my own, but published it for public as ckeditor5 says, so you should use it at your own risk.

*P.S. Default icon is a [code solid icon](https://fontawesome.com/v5.15/icons/code?style=solid) from FontAwesome 5 free.*

## Install
```bash
npm install --save ckeditor5-customtag
```

To add the functionality of this plugin you should make a custom build of the editor. Follow the instructions [here](https://docs.ckeditor.com/ckeditor5/latest/builds/guides/development/installing-plugins.html).

To load the plugin, configure ckeditor (e.g. edit file `ckeditor.js`) like this:

#### Import plugin
```javascript
import CustomTag from "ckeditor5-customtag/src/customtag";
```

#### Import toolbar icons (optional)
```javascript
import customTabFirstIcon from './icon-path/first-icon.svg';
```

#### Configure plugin
Assuming that the build is based on Classic Editor:

```javascript
export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	...
    CustomTag,
	...
],

ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			...
			'customtag-book',
			'customtag-hero',
			...
			]
	},
    
    ...

    CustomTag: {
        items: [
            {
                name: 'book',
                color: '#654321',
                placeholder: {
                    en: 'Insert Book tag',
                    ru: 'Ссылка на книгу'
                },
                icon: customTabFirstIcon,
                fields: [
                    {
                        name: 'text',
                        type: 'content',
                        label: 'Text',
                        placeholder: 'Input text here',
                        infoText: 'Text inside tag',
                        required: true,
                        defaultSelected: true
                    },
                    {
                        name: 'link',
                        type: 'attribute',
                        label: 'Link',
                        infoText: 'Book\'s link'
                    },
                    {
                        name: 'name',
                        type: 'attribute',
                        label: 'Name',
                        infoText: 'Book\'s name',
                        required: true
                    }
                ]
            },
            {
                name: 'hero'
            },
        ]
    },

	...
};

```
*Note: the toolbar item names should have the format: `customtag-tagname`, where `tagname` must be replaced by tag that would be in html (and name in object from CustomTag.items array)*



## Custom tag options
The elements can be customized through the CustomTag object that is passed to the editor, as shown above. Many different custom tags can be defined. The following options are available for each one:
* `name` : (string) the name for the created custom tags
* `placeholder` : (optional)(string|Object) placeholder text for the toolbar button. If missing, the name with first uppercase char is displayed (see `Option with localization`)
* `icon`: (optional)(icon object) icon for the toolbar button. If missing, a default icon is used: `</>`
* `fallbackLanguage`: (optional)(string) fallback language for options with localization. Default is `en` 
* `color`: (optional)(string) color for tag link (with icon or not) in editor. Default is `#000`
* `iconToTag`: (optional)(boolean) if false, no icon will be appear before tag link in editor. Default is `true`
* `fields`: (optional)(Array) array of fields (see `Custom tag fields options`)

## Custom tag fields options
Each tag could use some fields, that will appear in form. You shouldn't use more then one `content` field. You could use many fields, but now all input in form will appears in a line. The following options are available for each one:
* `name` : (string) the name for the field in form and attribute if type is `attribute`
* `type` : (optional)(string) `attribute` or `content`. Default `attribute`. Only one field should be `content` (this field data will be created inside the tag, as slot in Vue)
* `label`: (optional)(string|Object) label for the field (see `Option with localization`). Default is field name with first uppercase char
* `placeholder`: (optional)(string|string) placeholder for the field (see `Option with localization`). Default is field name with first uppercase char (ckeditor5 may not use this option)
* `infoText`: (optional)(string|Object) info text for the field (see `Option with localization`). Default is empty
* `required`: (optional)(boolean) if true, field must not be empty. Default is `false`
* `requiredMessage`: (optional)(string|Object) If `required` option is `true` and field is empty, this message will appear then user will try to create tag (see `Option with localization`). Default is `<field name with first uppercase char> must not be empty.`
* `defaultSelected`: (optional)(boolean) if true, current selected text will be set as default value for field then button on toolbar clicked. Default is `false`

## Option with localization
Some options from tag or field could be used for different languages, or only for one. If you only need one language, this option must be a string.
```javascript
...
placeholder: 'Insert Book tag',
...
```
But if you need a localization, you should use an object like
```javascript
...
placeholder: {
    en: 'Insert Book tag',
    ru: 'Ссылка на книгу'
},
...
```
Language that be used rely on your editor language, if no such exists in object - fallbackLanguage will be used.
