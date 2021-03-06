'use strict';

var TemplateFormatter = /** @class */ (function () {
    /**
     * @param {string | HTMLInputElement | null} inputElement
     * @param {object} props
     */
    function TemplateFormatter(inputElement, props) {
        this._template = "";
        this._prefixIndex = 0;
        /* Constructor props */
        this._prefixes = new Array();
        this.showPrefixOnFocus = false;
        this.hidePrefixOnBlur = true;
        this.showTemplateOnFocus = false;
        this.emptySpaceChar = ' ';
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
                this._initHiddenInput();
            this._initEvents();
            if (this._inputElement.value)
                this._updateInputValue(this._processNewInput(this._inputElement.value, false), false);
        }
        if (props.prefixes)
            this._prefixes = this._prefixes.concat(props.prefixes);
        if (props.hidePrefixOnBlur !== undefined)
            this.hidePrefixOnBlur = props.hidePrefixOnBlur ? true : false;
        this.showTemplateOnFocus = props.showFullTemplate ? true : false;
        if (props.emptySpaceChar)
            if (this.templateValueRegExp.test(props.emptySpaceChar))
                console.error("emptySpaceChar can't be a number!");
            else
                this.emptySpaceChar = props.emptySpaceChar[0];
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
    Object.defineProperty(TemplateFormatter.prototype, "templateValueRegExp", {
        get: function () {
            return /\d/g;
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
        (_a = this._inputElement) === null || _a === void 0 ? void 0 : _a.addEventListener('input', this.onInput.bind(this));
        (_b = this._inputElement) === null || _b === void 0 ? void 0 : _b.addEventListener('focus', this.onFocus.bind(this));
        (_c = this._inputElement) === null || _c === void 0 ? void 0 : _c.addEventListener('blur', this.onBlur.bind(this));
    };
    TemplateFormatter.prototype._initHiddenInput = function () {
        if (!this._inputElement)
            return;
        this._clonedInput = this._inputElement.cloneNode(true);
        this._inputElement.after(this._clonedInput);
        this._inputElement.setAttribute("name", '');
        this._clonedInput.style.display = "none";
        this._clonedInput.setAttribute("id", '');
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
            return this._prefixes.length > 0 ? 0 : -1;
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
    TemplateFormatter.prototype.removePrefixFormatted = function (formattedText) {
        var currentPrefix = this.currentPrefix;
        return currentPrefix
            ? formattedText.substring(formattedText.indexOf(currentPrefix) == 0 ? currentPrefix.length : 0)
            : formattedText;
    };
    TemplateFormatter.prototype.removePrefix = function (text) {
        var textWithPrefix = this.removeNonTemplateVals(text);
        var currentPrefix = this.currentPrefix.replace(this.nonTemplateValueRegExp, '');
        var prefixEnd = 0;
        while (textWithPrefix[prefixEnd] && currentPrefix[prefixEnd] === textWithPrefix[prefixEnd])
            prefixEnd++;
        return prefixEnd >= textWithPrefix.length ? '' : textWithPrefix.substring(prefixEnd);
    };
    TemplateFormatter.prototype.removeNonTemplateVals = function (text) {
        return text.replace(this.nonTemplateValueRegExp, '');
    };
    TemplateFormatter.prototype._fillTemplateWithTextVals = function (text) {
        var _this = this;
        var textWithTemplateVals = this.removePrefix(text);
        var textIndex = 0;
        var formattedText = '';
        Array.from(this.template).some(function (currentTemplateChar) {
            if (currentTemplateChar == _this.templateChar) {
                if (textIndex < textWithTemplateVals.length)
                    formattedText += textWithTemplateVals[textIndex++];
                else if (_this.showTemplateOnFocus)
                    formattedText += _this.emptySpaceChar;
                else
                    return true;
            }
            else
                formattedText += currentTemplateChar;
        });
        return formattedText;
    };
    /**
     *
     * @param {string} textToFormat
     * @returns {string} Formatted text
     */
    TemplateFormatter.prototype.formatText = function (textToFormat) {
        var formattedText = this._fillTemplateWithTextVals(textToFormat);
        return this.pushPostfixIfNeeded(this.currentPrefix + formattedText);
    };
    /**
     * Searches for the first character that differ from template.
     * @param {string} text
     * @returns {number} index of the first character that differ from template. If text and template are equal than -1
     */
    TemplateFormatter.prototype._getTemplateMismatchIndex = function (text) {
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
            var firstMismatch = this._getTemplateMismatchIndex(text);
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
        return text ? this._getTemplateMismatchIndex(text) == -1 : false;
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
        this._updatePossiblePrefix(newInputText);
        if (wasCharDeleted) {
            var textWithTemplateVals = newInputText.replace(this.nonTemplateValueRegExp, '');
            if (!textWithTemplateVals || textWithTemplateVals == this.currentPrefix.replace(this.nonTemplateValueRegExp, ''))
                return '';
            if (!this.showTemplateOnFocus && this.isPartiallyMatchTemplate(newInputText))
                return newInputText;
        }
        return this.formatText(newInputText);
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
    TemplateFormatter.prototype._findNextTemplateVal = function (text, startIndex) {
        for (var i = startIndex + 1; i < text.length; i++)
            if (this.templateValueRegExp.test(text[i]))
                return i;
        return -1;
    };
    TemplateFormatter.prototype._getInputCaretPosition = function (currCaretPosition, inputValue, wasCharDeleted) {
        if (!wasCharDeleted) {
            var noPrefixValueLen = this.removeNonTemplateVals(this.removePrefixFormatted(inputValue)).length;
            // If first value was inputed
            if (noPrefixValueLen <= 1)
                return this.currentPrefix.length + noPrefixValueLen;
            // If need to skip non template chars
            if (currCaretPosition > 0 && !this.templateValueRegExp.test(inputValue[currCaretPosition - 1])
                && this.removeNonTemplateVals(inputValue.substring(currCaretPosition - 1)).length > 0) {
                var nextTemplateValIndex = this._findNextTemplateVal(inputValue, currCaretPosition - 1);
                return nextTemplateValIndex == -1 ? currCaretPosition : nextTemplateValIndex + 1;
            }
        }
        return currCaretPosition;
    };
    TemplateFormatter.prototype._updateInputValue = function (newValue, wasCharDeleted) {
        if (!this._inputElement)
            return;
        // Caret position changes before oninput event
        var caretPosition = this._inputElement.selectionStart || 0;
        this._inputElement.value = newValue;
        var newCaretPosition = this._getInputCaretPosition(caretPosition, newValue, wasCharDeleted);
        this._inputElement.setSelectionRange(newCaretPosition, newCaretPosition);
        if (this._clonedInput)
            this._clonedInput.value = this._inputElement.value.replace(this.nonTemplateValueRegExp, '');
    };
    TemplateFormatter.prototype.onInput = function (event) {
        var inputEvent = event;
        var wasCharDeleted = inputEvent.inputType.startsWith("delete");
        this._updateInputValue(this._processNewInput(event.target.value, wasCharDeleted), wasCharDeleted);
    };
    TemplateFormatter.prototype.onFocus = function (event) {
        if (this.showPrefixOnFocus && this._inputElement && this._inputElement.value == '')
            this._inputElement.value = this._processNewInput(this._prefixes[0] || '', false);
    };
    TemplateFormatter.prototype.onBlur = function (event) {
        var _a;
        if (this.hidePrefixOnBlur && this.currentPrefix == ((_a = this._inputElement) === null || _a === void 0 ? void 0 : _a.value))
            this._inputElement.value = '';
    };
    return TemplateFormatter;
}());

