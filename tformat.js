class TemplateFormatter {
    get templateChar() {
        return 'x';
    }

    get nonTemplateValueRegExp() {
        return /\D/g;
    }

    /**
     * @returns {string}
     */
    get template() {
        return this._template;
    }

    set template(newValue) {
        if (typeof (newValue) != 'string')
            throw 'Template must be a string';

        this._prefixes[0] = newValue.split(this.templateChar)[0];

        this._template = newValue.substring(newValue.indexOf(this.templateChar));
        this._templateForHiddenInput = this._template;
    }

    /**
     * @returns {string}
     */
    get currentPrefix() {
        if (this._prefixIndex == -1)
            return '';

        return this._prefixes[this._prefixIndex];
    }

    /**
     * @param {string[]} newValue
     */
    set prefixes(newValue) {
        if (!Array.isArray(newValue) && newValue.length == 0)
            throw "prefixes must be a non empty Array!";
        if (!newValue.every(t => typeof (t) == "string"))
            throw "Possible prefix must be a string!";

        this._prefixes = [this._prefixes[0]].concat(newValue);
    }

    _initEvents() {
        this._inputElement.addEventListener('keyup', this.onKeyUp.bind(this));
        this._inputElement.addEventListener('focus', this.onFocus.bind(this));
        this._inputElement.addEventListener('blur', this.onBlur.bind(this));
    }

    _initHiddenInput(templateForHidden) {
        this._clonedInput = this._inputElement.cloneNode(true);
        this._inputElement.parentElement.insertBefore(this._clonedInput, this._inputElement);

        this._inputElement.setAttribute("name", '');
        this._clonedInput.style.display = "none";
        this._clonedInput.setAttribute("id", '');

        this._templateForHiddenInput = templateForHidden ? templateForHidden : this.template;
    }

    /**
     * @param {string | HTMLInputElement} inputElement 
     * @param {object} props 
     */
    constructor(inputElement, props) {
        if (!inputElement)
            throw "Input element must specified";
        if (typeof (inputElement) == "string") {
            this._inputElement = document.getElementById(inputElement);
            if (!this._inputElement)
                throw "There is no element with id: " + inputElement;
        } else if (typeof (inputElement) == "object" && Object.prototype.toString.call(inputElement) == "[object HTMLInputElement]")
            this._inputElement = inputElement;
        else
            throw "Unknown input element type";

        this._prefixIndex = 0;
        this._prefixes = [];

        if (props.template)
            this.template = props.template
        else
            throw 'Template must be specified';

        if (props.prefixes)
            this._prefixes = this._prefixes.concat(props.prefixes);

        if (props.showPrefixOnFocus)
            this.showPrefixOnFocus = true;

        if (props.createHiddenInput)
            this._initHiddenInput(props.templateForHidden);

        this._initEvents();
    }

    /**
     * 
     * @param {number[]} arr Array of non negative numbers
     * @returns object this properties: max unique value and its index from array or -1 if there is no
     */
    getUniqueMaxVal(arr) {
        let maxVal = -1;
        let maxIndx = -1;
        let isValUnique = true;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i] > maxVal) {
                maxVal = arr[i];
                maxIndx = i;
                isValUnique = true;
            } else if (maxVal == arr[i])
                isValUnique = false;
        }

        return {
            value: maxVal,
            index: isValUnique ? maxIndx : -1
        };
    }

    /**
     * @param {string} textToMatch
     * @returns array where element i is amount of characters that textToMatch and i-th prefix contain (count should end on first different char)
     */
    calcPrefixMatchCount(textToMatch) {
        let clearedText = textToMatch.replace(this.nonTemplateValueRegExp, '');
        let matchCount = [];
        this._prefixes.map(t => t.replace(this.nonTemplateValueRegExp, '')).forEach(v => {
            let matches = 0;
            for (let i = 0; i < Math.min(v.length, clearedText.length); i++) {
                if (v[i] == clearedText[i])
                    matches++;
                else
                    break;
            }
            matchCount.push(matches);
        });
        return matchCount;
    }

    /**
     * @param {string} text 
     * @returns {number} prefix index thats suits text
     */
    getSuitablePrefixIndex(text) {
        if (!text || !text.trim())
            return -1;

        let uniqueVal = this.getUniqueMaxVal(
            this.calcPrefixMatchCount(text));

        return uniqueVal.value === 0 ? 0 : uniqueVal.index;
    }

    /**
     * @param {string} newEnteredText 
     */
    _updatePossiblePrefix(newEnteredText) {
        if (this._prefixes.length == 1 && !this._prefixes[0])
            return;

        this._prefixIndex = this.getSuitablePrefixIndex(newEnteredText);

        this._inputElement.dispatchEvent(new CustomEvent('tf.p.onchange', {
            bubbles: true,
            detail: this._prefixIndex
        }));
    }

    /**
     * 
     * @param {string} text 
     * @returns 
     */
    pushPostfixIfNeeded(text) {
        let startOfPostfix = this.template.lastIndexOf(this.templateChar);

        if (this.currentPrefix.length + startOfPostfix + 1 == text.length)
            return text + this.template.slice(startOfPostfix + 1);
        return text;
    }

    /**
     * 
     * @param {string} textWithPrefix Text with only acceptable chars
     * @returns {string} Text without prefix
     */
    removePrefix(textWithPrefix) {
        let currentPrefix = this.currentPrefix.replace(this.nonTemplateValueRegExp, '');

        let prefixEnd = 0;

        while (textWithPrefix[prefixEnd] && currentPrefix[prefixEnd] === textWithPrefix[prefixEnd])
            prefixEnd++;

        return prefixEnd >= textWithPrefix.length ? '' : textWithPrefix.substring(prefixEnd);
    }

    /**
     * 
     * @param {string} textToFormat 
     * @returns {string} Formatted text
     */
    formatText(textToFormat) {
        let textWithTemplateVals = this.removePrefix(textToFormat.replace(this.nonTemplateValueRegExp, ''));

        let formattedText = "";
        for (let templateIndex = 0, textIndex = 0; templateIndex < this.template.length && textIndex < textWithTemplateVals.length; templateIndex++)
            formattedText += (this.template[templateIndex] != this.templateChar) ?
            this.template[templateIndex] :
            textWithTemplateVals[textIndex++];

        return this.pushPostfixIfNeeded(this.currentPrefix + formattedText);
    }

    /**
     * 
     * @param {string} text 
     * @returns {boolean}
     */
    isPartiallyMatchTemplate(text) {
        if (!text)
            return false;

        let prefixIndx = this.getSuitablePrefixIndex(text);
        let fullTemplate = this._prefixes[prefixIndx] + this.template;

        for (let i = 0; i < Math.min(text.length, fullTemplate.length); i++)
            if (text[i] !== fullTemplate[i] && (fullTemplate[i] !== this.templateChar || this.nonTemplateValueRegExp.test(text[i])))
                return false;
        return true;
    }

    _processNewInput(newInputText, wasCharDeleted) {
        if (wasCharDeleted && this.isPartiallyMatchTemplate(newInputText))
            return newInputText;
        this._updatePossiblePrefix(newInputText);

        return this.formatText(newInputText);
    }

    onKeyUp(event) {
        this._inputElement.value = this._processNewInput(
            event.target.value,
            event.keyCode === 8 || event.keyCode === 46
        );

        if (this._clonedInput)
            this._clonedInput.value = this._inputElement.value.replace(this.nonTemplateValueRegExp, '');
    }

    onFocus(event) {
        if (this.showPrefixOnFocus)
            this._inputElement.dispatchEvent(new Event('keyup'));
    }

    onBlur(event) {
        if (this.currentPrefix == this._inputElement.value)
            this._inputElement.value = '';
    }
}