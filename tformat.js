'use strict';

var TemplateFormatter = /** @class */ (function () {
    /**
     * @param {string | HTMLInputElement | null} inputElement
     * @param {object} props
     */
    function TemplateFormatter(inputElement, props) {
        this._template = "";
        this._prefixes = new Array();
        this._templateForHiddenInput = "";
        this._prefixIndex = 0;
        this.showPrefixOnFocus = false;
        if (props.template)
            this.template = props.template;
        else
            throw 'Template must be specified';
        if (inputElement) {
            if (typeof (inputElement) == "string") {
                this._inputElement = document.getElementById(inputElement);
                if (!this._inputElement)
                    throw "There is no element with id: " + inputElement;
            }
            else if (typeof (inputElement) == "object" && Object.prototype.toString.call(inputElement) == "[object HTMLInputElement]")
                this._inputElement = inputElement;
            else
                throw "Unknown input element type";
            if (props.showPrefixOnFocus) {
                if (props.prefixes && this._prefixes.length + props.prefixes.length > 1)
                    console.warn("You've set showPrefixOnFocus, but there is more than one prefix");
                else
                    this.showPrefixOnFocus = true;
            }
            if (props.createHiddenInput)
                this._initHiddenInput(props.templateForHidden || '');
            this._initEvents();
        }
        if (props.prefixes)
            this._prefixes = this._prefixes.concat(props.prefixes);
    }
    Object.defineProperty(TemplateFormatter.prototype, "templateChar", {
        get: function () {
            return 'x';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TemplateFormatter.prototype, "nonTemplateValueRegExp", {
        get: function () {
            return /\D/g;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TemplateFormatter.prototype, "template", {
        /**
         * @returns {string}
         */
        get: function () {
            return this._template;
        },
        /**
         * @param {string} newValue
         */
        set: function (newValue) {
            if (typeof (newValue) != 'string')
                throw 'Template must be a string';
            this._prefixes[0] = newValue.split(this.templateChar)[0];
            this._template = newValue.substring(newValue.indexOf(this.templateChar));
            this._templateForHiddenInput = this._template;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TemplateFormatter.prototype, "currentPrefix", {
        /**
         * @returns {string}
         */
        get: function () {
            if (this._prefixIndex == -1)
                return '';
            return this._prefixes[this._prefixIndex];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TemplateFormatter.prototype, "prefixes", {
        /**
         * @param {string[]} newValue
         */
        set: function (newValue) {
            if (!Array.isArray(newValue) || newValue.length == 0)
                throw "Prefixes must be a non empty Array!";
            if (!newValue.every(function (t) { return typeof (t) == "string"; }))
                throw "Possible prefix must be a string!";
            this._prefixes = [this._prefixes[0]].concat(newValue);
        },
        enumerable: false,
        configurable: true
    });
    TemplateFormatter.prototype._initEvents = function () {
        var _a, _b, _c;
        (_a = this._inputElement) === null || _a === void 0 ? void 0 : _a.addEventListener('keyup', this.onKeyUp.bind(this));
        (_b = this._inputElement) === null || _b === void 0 ? void 0 : _b.addEventListener('focus', this.onFocus.bind(this));
        (_c = this._inputElement) === null || _c === void 0 ? void 0 : _c.addEventListener('blur', this.onBlur.bind(this));
    };
    /**
     *
     * @param {string} templateForHidden
     */
    TemplateFormatter.prototype._initHiddenInput = function (templateForHidden) {
        if (!this._inputElement)
            return;
        this._clonedInput = this._inputElement.cloneNode(true);
        this._inputElement.after(this._clonedInput);
        this._inputElement.setAttribute("name", '');
        this._clonedInput.style.display = "none";
        this._clonedInput.setAttribute("id", '');
        this._templateForHiddenInput = templateForHidden ? templateForHidden : this.template;
    };
    /**
     *
     * @param {number[]} arr Array of non negative numbers
     * @returns object this properties: max unique value and its index from array or -1 if there is no
     */
    TemplateFormatter.prototype.getUniqueMaxVal = function (arr) {
        var maxVal = -1;
        var maxIndx = -1;
        var isValUnique = true;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] > maxVal) {
                maxVal = arr[i];
                maxIndx = i;
                isValUnique = true;
            }
            else if (maxVal == arr[i])
                isValUnique = false;
        }
        return {
            value: maxVal,
            index: isValUnique ? maxIndx : -1
        };
    };
    /**
     * @param {string} textToMatch
     * @returns {number[]} array where element i is amount of characters that textToMatch and i-th prefix contain (count should end on first different char)
     */
    TemplateFormatter.prototype.calcPrefixMatchCount = function (textToMatch) {
        var _this = this;
        var clearedText = textToMatch.replace(this.nonTemplateValueRegExp, '');
        var matchCount = new Array();
        this._prefixes.map(function (t) { return t.replace(_this.nonTemplateValueRegExp, ''); }).forEach(function (v) {
            var matches = 0;
            for (var i = 0; i < Math.min(v.length, clearedText.length); i++) {
                if (v[i] == clearedText[i])
                    matches++;
                else
                    break;
            }
            matchCount.push(matches);
        });
        return matchCount;
    };
    /**
     * @param {string} text
     * @returns {number} prefix index thats suits text
     */
    TemplateFormatter.prototype.getSuitablePrefixIndex = function (text) {
        if (!text || !text.trim())
            return -1;
        var uniqueVal = this.getUniqueMaxVal(this.calcPrefixMatchCount(text));
        return uniqueVal.value === 0 ? 0 : uniqueVal.index;
    };
    /**
     * @param {string} newEnteredText
     */
    TemplateFormatter.prototype._updatePossiblePrefix = function (newEnteredText) {
        if (this._prefixes.length == 1 && !this._prefixes[0])
            return;
        this._prefixIndex = this.getSuitablePrefixIndex(newEnteredText);
        if (this._inputElement)
            this._inputElement.dispatchEvent(new CustomEvent('tf.p.onchange', {
                bubbles: true,
                detail: this._prefixIndex
            }));
    };
    /**
     *
     * @param {string} text
     * @returns {string}
     */
    TemplateFormatter.prototype.pushPostfixIfNeeded = function (text) {
        var startOfPostfix = this.template.lastIndexOf(this.templateChar);
        if (this.currentPrefix.length + startOfPostfix + 1 == text.length)
            return text + this.template.slice(startOfPostfix + 1);
        return text;
    };
    /**
     *
     * @param {string} textWithPrefix Text with only acceptable chars
     * @returns {string} Text without prefix
     */
    TemplateFormatter.prototype.removePrefix = function (textWithPrefix) {
        var currentPrefix = this.currentPrefix.replace(this.nonTemplateValueRegExp, '');
        var prefixEnd = 0;
        while (textWithPrefix[prefixEnd] && currentPrefix[prefixEnd] === textWithPrefix[prefixEnd])
            prefixEnd++;
        return prefixEnd >= textWithPrefix.length ? '' : textWithPrefix.substring(prefixEnd);
    };
    /**
     *
     * @param {string} textToFormat
     * @returns {string} Formatted text
     */
    TemplateFormatter.prototype.formatText = function (textToFormat) {
        var textWithTemplateVals = this.removePrefix(textToFormat.replace(this.nonTemplateValueRegExp, ''));
        var formattedText = "";
        for (var templateIndex = 0, textIndex = 0; templateIndex < this.template.length && textIndex < textWithTemplateVals.length; templateIndex++)
            formattedText += (this.template[templateIndex] != this.templateChar) ?
                this.template[templateIndex] :
                textWithTemplateVals[textIndex++];
        return this.pushPostfixIfNeeded(this.currentPrefix + formattedText);
    };
    /**
     * Searches for the first character that differ from template.
     * @param {string} text
     * @returns {number} index of the first character that differ from template. If text and template are equal than -1
     */
    TemplateFormatter.prototype._getFirstTemplateMismatch = function (text) {
        var prefixIndx = this.getSuitablePrefixIndex(text);
        var fullTemplate = this._prefixes[prefixIndx] + this.template;
        for (var i = 0; i < Math.min(text.length, fullTemplate.length); i++)
            if (text[i] !== fullTemplate[i] && (fullTemplate[i] !== this.templateChar || this.nonTemplateValueRegExp.test(text[i])))
                return i;
        if (text.length != fullTemplate.length)
            return Math.min(text.length, fullTemplate.length);
        return -1;
    };
    /**
     *
     * @param {string} text
     * @returns {boolean}
     */
    TemplateFormatter.prototype.isPartiallyMatchTemplate = function (text) {
        if (text) {
            var firstMismatch = this._getFirstTemplateMismatch(text);
            return firstMismatch >= text.length || firstMismatch == -1;
        }
        return false;
    };
    /**
     *
     * @param {string} text
     * @returns {boolean}
     */
    TemplateFormatter.prototype.isMatchTemplate = function (text) {
        return text ? this._getFirstTemplateMismatch(text) == -1 : false;
    };
    /**
     *
     * @returns {boolean}
     */
    TemplateFormatter.prototype.isInputValueValid = function () {
        if (this._inputElement)
            return this.isMatchTemplate(this._inputElement.value);
        throw "There is no input element";
    };
    /**
     *
     * @param {string} newInputText
     * @param {boolean} wasCharDeleted
     * @returns {string}
     */
    TemplateFormatter.prototype._processNewInput = function (newInputText, wasCharDeleted) {
        if (wasCharDeleted && this.isPartiallyMatchTemplate(newInputText))
            return newInputText;
        this._updatePossiblePrefix(newInputText);
        return this.formatText(newInputText);
    };
    /**
     * Format text and update class state
     * @param {KeyboardEvent} event onKeyUp event
     * @returns {string} processed text
     */
    TemplateFormatter.prototype._processNewInputEvent = function (event) {
        return this._processNewInput(event.target.value, event.keyCode === 8 || event.keyCode === 46);
    };
    /**
     *
     * @param {string} formattedText
     * @returns {string}
     */
    TemplateFormatter.prototype.getRawValue = function (formattedText) {
        if (!formattedText)
            return '';
        return formattedText.replace(this.nonTemplateValueRegExp, '');
    };
    /**
     *
     * @param {KeyboardEvent} event
     */
    TemplateFormatter.prototype.onKeyUp = function (event) {
        if (!this._inputElement)
            return;
        this._inputElement.value = this._processNewInputEvent(event);
        if (this._clonedInput)
            this._clonedInput.value = this._inputElement.value.replace(this.nonTemplateValueRegExp, '');
    };
    TemplateFormatter.prototype.onFocus = function (event) {
        if (this.showPrefixOnFocus && this._inputElement && this._inputElement.value == '')
            this._inputElement.value = this._processNewInput(this._prefixes[0] || '', false);
    };
    /**
     *
     * @param {FocusEvent} event
     */
    TemplateFormatter.prototype.onBlur = function (event) {
        var _a;
        if (this.currentPrefix == ((_a = this._inputElement) === null || _a === void 0 ? void 0 : _a.value))
            this._inputElement.value = '';
    };
    return TemplateFormatter;
}());

module.exports = TemplateFormatter;
