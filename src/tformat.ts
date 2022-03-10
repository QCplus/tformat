export type TFBaseProps = {
    template: string;
    prefixes?: string[];
    showPrefixOnFocus?: boolean;
    hidePrefixOnBlur?: boolean;
    showFullTemplate?: boolean;
    emptySpaceChar?: string;
}

export type TemplateFormatterProps = {
    createHiddenInput?: boolean;
    templateForHidden?: string;
} & TFBaseProps;

export default class TemplateFormatter {
    _inputElement: HTMLInputElement | null | undefined;
    _clonedInput: HTMLInputElement | undefined;
    _template = "";
    _templateForHiddenInput = "";
    _prefixIndex = 0;
    
    /* Constructor props */
    _prefixes = new Array<string>();
    showPrefixOnFocus = false;
    hidePrefixOnBlur = true;
    showTemplateOnFocus = false;
    emptySpaceChar = ' ';

    get templateChar() {
        return 'x';
    }

    get nonTemplateValueRegExp() {
        return /\D/g;
    }

    get templateValueRegExp() {
        return /\d/g;
    }

    /**
     * @returns {string}
     */
    get template(): string {
        return this._template;
    }

    /**
     * @param {string} newValue
     */
    set template(newValue: string) {
        if (typeof (newValue) != 'string')
            throw 'Template must be a string';

        this._prefixes[0] = newValue.split(this.templateChar)[0];

        this._template = newValue.substring(newValue.indexOf(this.templateChar));
        this._templateForHiddenInput = this._template;
    }

    /**
     * @returns {string}
     */
    get currentPrefix(): string {
        if (this._prefixIndex == -1)
            return '';

        return this._prefixes[this._prefixIndex];
    }

    /**
     * @param {string[]} newValue
     */
    set prefixes(newValue: string[] | undefined) {
        if (!Array.isArray(newValue) || newValue.length == 0)
            throw "Prefixes must be a non empty Array!";
        if (!newValue.every(t => typeof (t) == "string"))
            throw "Possible prefix must be a string!";

        this._prefixes = [this._prefixes[0]].concat(newValue);
    }

    _initEvents() {
        this._inputElement?.addEventListener('input', this.onInput.bind(this));
        this._inputElement?.addEventListener('focus', this.onFocus.bind(this));
        this._inputElement?.addEventListener('blur', this.onBlur.bind(this));
    }

    /**
     * 
     * @param {string} templateForHidden 
     */
    _initHiddenInput(templateForHidden: string) {
        if (!this._inputElement)
            return;

        this._clonedInput = this._inputElement.cloneNode(true) as HTMLInputElement;
        this._inputElement.after(this._clonedInput);

        this._inputElement.setAttribute("name", '');
        this._clonedInput.style.display = "none";
        this._clonedInput.setAttribute("id", '');

        this._templateForHiddenInput = templateForHidden ? templateForHidden : this.template;
    }

    /**
     * @param {string | HTMLInputElement | null} inputElement 
     * @param {object} props 
     */
    constructor(inputElement: string | HTMLInputElement | null, props: TemplateFormatterProps) {
        if (props.template)
            this.template = props.template
        else
            throw 'Template must be specified';

        if (inputElement) {
            if (typeof (inputElement) == "string") {
                this._inputElement = document.getElementById(inputElement) as HTMLInputElement;
                if (!this._inputElement)
                    throw "There is no element with id: " + inputElement;
            } 
            else if (typeof (inputElement) == "object" && Object.prototype.toString.call(inputElement) == "[object HTMLInputElement]")
                this._inputElement = inputElement;
            else
                throw "Unknown input element type";

            if (props.showPrefixOnFocus) {
                if (props.prefixes && this._prefixes.length + props.prefixes.length > 1)
                    console.warn("You've set showPrefixOnFocus, but there is more than one prefix")
                else
                    this.showPrefixOnFocus = true;
            }

            if (props.createHiddenInput)
                this._initHiddenInput(props.templateForHidden || '');

            this._initEvents();

            if (this._inputElement.value)
                this._updateInputValue(
                    this._processNewInput(this._inputElement.value, false),
                    false
                );
        }

        if (props.prefixes)
            this._prefixes = this._prefixes.concat(props.prefixes);

        if (props.hidePrefixOnBlur !== undefined)
            this.hidePrefixOnBlur = props.hidePrefixOnBlur ? true : false;

        this.showTemplateOnFocus = props.showFullTemplate ? true : false;

        if (props.emptySpaceChar)
            this.emptySpaceChar = props.emptySpaceChar[0];
    }

    /**
     * 
     * @param {number[]} arr Array of non negative numbers
     * @returns object this properties: max unique value and its index from array or -1 if there is no
     */
    getUniqueMaxVal(arr: number[]): { value: number, index: number } {
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
     * @returns {number[]} array where element i is amount of characters that textToMatch and i-th prefix contain (count should end on first different char)
     */
    calcPrefixMatchCount(textToMatch: string): number[] {
        let clearedText = textToMatch.replace(this.nonTemplateValueRegExp, '');
        let matchCount = new Array<number>();
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
    getSuitablePrefixIndex(text: string): number {
        if (!text || !text.trim())
            return this._prefixes.length > 0 ? 0 : -1;

        let uniqueVal = this.getUniqueMaxVal(
            this.calcPrefixMatchCount(text));

        return uniqueVal.value === 0 ? 0 : uniqueVal.index;
    }

    /**
     * @param {string} newEnteredText 
     */
    _updatePossiblePrefix(newEnteredText: string) {
        if (this._prefixes.length == 1 && !this._prefixes[0])
            return;

        this._prefixIndex = this.getSuitablePrefixIndex(newEnteredText);

        if (this._inputElement)
            this._inputElement.dispatchEvent(new CustomEvent('tf.p.onchange', {
                bubbles: true,
                detail: this._prefixIndex
            }));
    }

    /**
     * 
     * @param {string} text 
     * @returns {string}
     */
    pushPostfixIfNeeded(text: string): string {
        let startOfPostfix = this.template.lastIndexOf(this.templateChar);

        if (this.currentPrefix.length + startOfPostfix + 1 == text.length)
            return text + this.template.slice(startOfPostfix + 1);
        return text;
    }

    removePrefixFormatted(formattedText: string): string {
        const currentPrefix = this.currentPrefix;

        return currentPrefix
            ? formattedText.substring(formattedText.indexOf(currentPrefix) == 0 ? currentPrefix.length : 0)
            : formattedText;
    }

    removePrefix(text: string): string {
        const textWithPrefix = this.removeNonTemplateVals(text);
        const currentPrefix = this.currentPrefix.replace(this.nonTemplateValueRegExp, '');

        let prefixEnd = 0;

        while (textWithPrefix[prefixEnd] && currentPrefix[prefixEnd] === textWithPrefix[prefixEnd])
            prefixEnd++;

        return prefixEnd >= textWithPrefix.length ? '' : textWithPrefix.substring(prefixEnd);
    }

    removeNonTemplateVals(text: string): string {
        return text.replace(this.nonTemplateValueRegExp, '');
    }

    _fillTemplateWithTextVals(text: string): string {
        const textWithTemplateVals = this.removePrefix(text);

        let textIndex = 0;
        let formattedText = '';
        Array.from(this.template).some((currentTemplateChar) => {
            if (currentTemplateChar == this.templateChar)
            {
                if (textIndex < textWithTemplateVals.length)
                    formattedText += textWithTemplateVals[textIndex++];
                else if (this.showTemplateOnFocus)
                    formattedText += this.emptySpaceChar;
                else
                    return true;
            }
            else
                formattedText += currentTemplateChar;
        });
        
        return formattedText;
    }

    /**
     * 
     * @param {string} textToFormat 
     * @returns {string} Formatted text
     */
    formatText(textToFormat: string): string {
        let formattedText = this._fillTemplateWithTextVals(textToFormat);

        return this.pushPostfixIfNeeded(this.currentPrefix + formattedText);
    }

    /**
     * Searches for the first character that differ from template.
     * @param {string} text 
     * @returns {number} index of the first character that differ from template. If text and template are equal than -1
     */
    _getTemplateMismatchIndex(text: string): number {
        let prefixIndx = this.getSuitablePrefixIndex(text);
        let fullTemplate = this._prefixes[prefixIndx] + this.template;

        for (let i = 0; i < Math.min(text.length, fullTemplate.length); i++)
            if (text[i] !== fullTemplate[i] && (fullTemplate[i] !== this.templateChar || this.nonTemplateValueRegExp.test(text[i])))
                return i;

        if (text.length != fullTemplate.length)
            return Math.min(text.length, fullTemplate.length)

        return -1;
    }

    /**
     * 
     * @param {string} text 
     * @returns {boolean}
     */
    isPartiallyMatchTemplate(text: string): boolean {
        if (text) {
            let firstMismatch = this._getTemplateMismatchIndex(text);

            return firstMismatch >= text.length || firstMismatch == -1;
        }
        return false;
    }

    /**
     * 
     * @param {string} text 
     * @returns {boolean}
     */
    isMatchTemplate(text: string | undefined): boolean {
        return text ? this._getTemplateMismatchIndex(text) == -1 : false;
    }

    /**
     * 
     * @returns {boolean}
     */
    isInputValueValid(): boolean {
        if (this._inputElement)
            return this.isMatchTemplate(this._inputElement.value);
        throw "There is no input element";
    }

    /**
     * 
     * @param {string} newInputText 
     * @param {boolean} wasCharDeleted 
     * @returns {string}
     */
    _processNewInput(newInputText: string, wasCharDeleted: boolean): string {
        this._updatePossiblePrefix(newInputText);

        if (wasCharDeleted) {
            const textWithTemplateVals = newInputText.replace(this.nonTemplateValueRegExp, '');
            if (!textWithTemplateVals || textWithTemplateVals == this.currentPrefix.replace(this.nonTemplateValueRegExp, ''))
                return '';
            if (!this.showTemplateOnFocus && this.isPartiallyMatchTemplate(newInputText))
                return newInputText;
        }

        const formattedText = this.formatText(newInputText);

        return formattedText;
    }

    /**
     * 
     * @param {string} formattedText 
     * @returns {string}
     */
    getRawValue(formattedText: string): string {
        if (!formattedText)
            return '';

        return formattedText.replace(this.nonTemplateValueRegExp, '');
    }

    _findNextTemplateVal(text: string, startIndex: number) {
        for (let i = startIndex + 1; i < text.length; i++)
            if (this.templateValueRegExp.test(text[i]))
                return i;

        return -1;
    }

    _getInputCaretPosition(currCaretPosition: number, inputValue: string, wasCharDeleted: boolean) {
        // If first value was inputed
        if (!wasCharDeleted) {
            const noPrefixValueLen = this.removeNonTemplateVals(this.removePrefixFormatted(inputValue)).length;

            if (noPrefixValueLen <= 1)
                return this.currentPrefix.length + noPrefixValueLen;

            if (this.removeNonTemplateVals(inputValue.substring(currCaretPosition)).length == 1)
                return this._findNextTemplateVal(inputValue, currCaretPosition - 1) + 1;
        }

        return currCaretPosition;
    }

    _updateInputValue(newValue: string, wasCharDeleted: boolean) {
        if (!this._inputElement)
            return;

        // Caret position changes before oninput event
        const caretPosition = this._inputElement.selectionStart || 0

        this._inputElement.value = newValue;

        const newCaretPosition = this._getInputCaretPosition(caretPosition, newValue, wasCharDeleted);
        this._inputElement.setSelectionRange(newCaretPosition, newCaretPosition);

        if (this._clonedInput)
            this._clonedInput.value = this._inputElement.value.replace(this.nonTemplateValueRegExp, '');
    }

    onInput(event: Event) {
        const inputEvent = event as InputEvent;
        const wasCharDeleted = inputEvent.inputType.startsWith("delete");
        
        this._updateInputValue(
            this._processNewInput((<HTMLInputElement>event.target).value, wasCharDeleted),
            wasCharDeleted
        );
    }

    onFocus(event: FocusEvent) {
        if (this.showPrefixOnFocus && this._inputElement && this._inputElement.value == '')
            this._inputElement.value = this._processNewInput(this._prefixes[0] || '', false);
    }

    onBlur(event: FocusEvent) {
        if (this.hidePrefixOnBlur && this.currentPrefix == this._inputElement?.value)
            this._inputElement.value = '';
    }
}
