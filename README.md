![npm](https://img.shields.io/npm/dy/tformat.js?style=flat-square)
![npm](https://img.shields.io/npm/v/tformat.js?label=version&style=flat-square)

# tformat.js

Tformat.js is a lightweight library for number formatting (credit card and phone numbers, for example)

Examples can be found [here](https://qcplus.github.io/tformat/)

# Table of contents

1. [Usage](#usage)
2. [React](#react)
3. [Constructor options](#constructor-options)

## Usage

Download tformat.js via npm

```bash
npm i tformat.js
```

or directly from the [repo](https://github.com/QCplus/tformat/blob/main/tformat.min.js).

Then import it

```html
<script src="tformat.min.js"></script>
```

To apply a tformat to input element with id `inputField`, create a new class by passing element id or `HTMLInputElement`

```js
let tformat = new TemplateFormatter('inputField', { 
  template: '123 xxx xxx xxx',
  createHiddenInput: true,
  showPrefixOnFocus: true,
  prefixes: ["456 "]
});
```

Where character `x` in template is any number

Template can be with multiple prefixes. In example above, template contains two prefixes: `123 ` and `456 `

Tformat can also be initialized with a `HTMLInputElement`

```js
let tformat = new TemplateFormatter(document.getElementById('inputField'), { 
    ...
```

## React

You can also use tformat in React

```jsx
import React, { useState } from 'react';
import { TFReact } from 'tformat.js';

const MyComponent = () => {
    const [formattedValue, setFormattedValue] = useState('');
    const [unformattedValue, setUnformattedValue] = useState('');

    return (
        <TFReact
            template="+1 xxx xxx"
            showPrefixOnFocus={true}
            onFormatted={(val, rawVal) => { setFormattedValue(val); setUnformattedValue(rawVal); }} />
    )
}
```

React component `TFReact` comes with npm package

## Constructor options

Constructor has two parameters

```js
new TemplateFormatter(input, props)
```

First parameter of constructor is an element that need to be formated. It can be an id of element as `string` or input itself as `HTMLInputElement`

Additional options goes in second parameter as one object. Possible object properties listed below

| Name             | Type     | Mandatory | Default | Description | 
| ---------------- | -------- | --------- | ------- | ----------- |
| template         | string   | Yes       |         | Template for value formatting |
| prefixes         | string[] | No        |         | Possible template prefixes. If user enters first character from `prefixes` then this prefix will be used in input, otherwise template prefix will be used |
| showPrefixOnFocus| boolean  | No        | false   | If `true` then template prefix will be shown after user clicks on input |
| createHiddenInput| boolean  | No        | false   | If `true` then hidden clone of input will be created, that contains only numbers. It can be used in form submitting |
| hidePrefixOnBlur | boolean  | No        | true    | If value input equals template prefix then value will be cleared |
| showFullTemplate | boolean  | No        | false   | If `true` then full template will be shown. [See examples](https://qcplus.github.io/tformat/) |
| emptySpaceChar   | string   | No        | '???' | Used as placeholder for `x` characters if showFullTemplate is `true` |

## Properties

### **template**
`string`
Template for number formatting. Template can be reassigned.

### **prefixes**
`string[]`

All possible prefixes of template.

