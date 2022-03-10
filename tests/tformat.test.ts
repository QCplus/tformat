import TemplateFormatter, { TemplateFormatterProps } from '../src/tformat';

const INPUT_ID = "testInput"
var valueInput: HTMLInputElement;

function setupInputField() {
    valueInput = document.createElement('input');
    valueInput.setAttribute('id', INPUT_ID);
    valueInput.setAttribute('name', INPUT_ID);
}

function clearInputField() {
    let inputs = document.getElementsByTagName('input');

    while (inputs.length > 0)
        inputs[inputs.length - 1].remove();    
}

function simulateInputChange(wasCharDeleted: boolean = false) {
    valueInput.dispatchEvent(
        new InputEvent('input', {
            inputType: wasCharDeleted ? 'deleteContentBackward' : 'insertText'
        }));
}

function simulateChange(newValue: string, wasCharDeleted: boolean = false) {
    valueInput.value = newValue;
    simulateInputChange(wasCharDeleted);
}

function createTFormat(props: TemplateFormatterProps) {
    return new TemplateFormatter(valueInput, props);
}

describe("Independent methods", function() {
    test("Test get max unique val", function() {
        let tformat = new TemplateFormatter(null, {
            template: "123 xxx"
        });

        expect(tformat.getUniqueMaxVal([1, 1, 2])).toEqual({ value: 2, index: 2 });
        expect(tformat.getUniqueMaxVal([1, 1, 1])).toEqual({ value: 1, index: -1 });
    })

    test("Test getSuitablePrefixIndex", function() {
        let tformat = new TemplateFormatter(null, {
            template: "+123 xxx",
            prefixes: ["+156 ", "+645 "]
        });

        expect(tformat.getSuitablePrefixIndex(' ')).toBe(0);
        expect(tformat.getSuitablePrefixIndex("1")).toBe(-1);
        expect(tformat.getSuitablePrefixIndex("+15")).toBe(1);
    })

    test("Test format func", function() {
        let tformat = new TemplateFormatter(null, {
            template: '123 xxx xxx'
        });

        let enteredNumber = "123456789";
        
        expect(tformat.formatText(enteredNumber)).toBe('123 456 789');
    })

    test("Test prefix match count calculation", function() {
        let tformat = new TemplateFormatter(null, {
            template: "123 xxx",
            prefixes: ['125 ', '134 ', '666 ']
        });

        expect(tformat.calcPrefixMatchCount("12")).toEqual([2, 2, 1, 0]);
    })

    test("Test pushPostfixIfNeeded", function() {
        let tformat = new TemplateFormatter(null, {
            template: "123 (xxx)"
        })

        expect(tformat.pushPostfixIfNeeded('123 (x')).toBe('123 (x');
        expect(tformat.pushPostfixIfNeeded('123 (xxx')).toBe('123 (xxx)');
    })

    test("removePrefixFormatted", () => {
        let tformat = new TemplateFormatter(null, {
            template: "+123 (xxx)"
        });

        expect(tformat.removePrefixFormatted("+123 (456)")).toBe("456)");
    })

    test("Test removePrefix", function() {
        let tformat = new TemplateFormatter(null, {
            template: "+123 (xxx)"
        })

        expect(tformat.removePrefix("123456")).toBe("456");

        tformat.template = "xxx";
        expect(tformat.removePrefix("123")).toBe("123");
    })

    test("removeNonTemplateVals", () => {
        let tformat = new TemplateFormatter(null, {
            template: "+123 (xxx)"
        });

        expect(tformat.removeNonTemplateVals("+123 (344)")).toBe("123344");
    })

    test("Test formatText", function() {
        let tformat = new TemplateFormatter(null, {
            template: "+123-(xxx)"
        })

        expect(tformat.formatText("123456")).toBe("+123-(456)")
        expect(tformat.formatText("-1 23  45 6")).toBe("+123-(456)")
    })

    test("Test _getFirstTemplateMismatch", function() {
        let tformat = new TemplateFormatter(null, {
            template: "+123-(xxx)"
        });

        expect(tformat._getTemplateMismatchIndex("+123-(123)")).toBe(-1);
        expect(tformat._getTemplateMismatchIndex("")).toBe(0);
        expect(tformat._getTemplateMismatchIndex("+124-(456)")).toBe(3);
        expect(tformat._getTemplateMismatchIndex("+123-(f45)")).toBe(6);
        expect(tformat._getTemplateMismatchIndex("+123-(123")).toBe(9);
        expect(tformat._getTemplateMismatchIndex("+123-(1234)")).toBe(9);
    })

    test("Test isPartiallyMatchTemplate", function() {
        let tformat = new TemplateFormatter(null, {
            template: "1 (xxx) xxx"
        });

        expect(tformat.isPartiallyMatchTemplate("1 (123) ")).toBe(true); // "1 (123) "
        expect(tformat.isPartiallyMatchTemplate("")).toBe(false); // "Empty string doesn't match template"
        expect(tformat.isPartiallyMatchTemplate("9 (123) ")).toBe(false); // "9 (123) "
        expect(tformat.isPartiallyMatchTemplate("1 (12) ")).toBe(false); // "9 (123) "
        expect(tformat.isPartiallyMatchTemplate("1 (123) 123 456 789")).toBe(false); // "9 (123) "
        expect(tformat.isPartiallyMatchTemplate("1 (123) 123")).toBe(true); // "Full match"
    })

    test("Test isMatchTemplate", function() {
        let tformat = new TemplateFormatter(null, {
            template: "+123-(xxx)"
        });

        expect(tformat.isMatchTemplate("+123-")).toBe(false);
        expect(tformat.isMatchTemplate("+123-(345")).toBe(false);
        expect(tformat.isMatchTemplate("+123-(345)")).toBe(true);
        expect(tformat.isMatchTemplate("+456-(345)")).toBe(false);
        expect(tformat.isMatchTemplate("+123-(1234)")).toBe(false);
    })

    test("_findNextTemplateVal", () => {
        const tformat = createTFormat({
            template: "+1 (xxx) xxx"
        });

        expect(tformat._findNextTemplateVal("+1 (234) 5", 6)).toBe(9);
        expect(tformat._findNextTemplateVal("+1 (234) ", 6)).toBe(-1);
    })

    test("_getInputCaretPosition", () => {
        const tformat = createTFormat({
            template: "+1 (xxx) xxx-xx-xx"
        });

        expect(tformat._getInputCaretPosition(10, "+1 (234) 4", false)).toBe(10);
        expect(tformat._getInputCaretPosition(6, "+1 (234) 5", false)).toBe(6);
        expect(tformat._getInputCaretPosition(8, "+1 (234)", true)).toBe(8);

        expect(tformat._getInputCaretPosition(1, "+1 (", false)).toBe(4);
        expect(tformat._getInputCaretPosition(1, "+1 (2__) ___-__-__", false)).toBe(5);
        expect(tformat._getInputCaretPosition(4, "+1 (2__) ___-__-__", true)).toBe(4);

        expect(tformat._getInputCaretPosition(8, "+1 (234) 2", false)).toBe(10);
    })
})

describe("Prefixes", function() {
    beforeEach(() => {
        setupInputField();
    })

    afterEach(() => {
        clearInputField();
    })

    test("Test when enters first char not from template", function() {
        new TemplateFormatter(valueInput, {
            template: "123 xxx",
            prefixes: ["678 "]
        });

        valueInput.value = "4";
        simulateInputChange();

        expect(valueInput.value).toBe("123 4");
    })

    test("Test when no prefixes", function() {
        new TemplateFormatter(valueInput, {
            template: "x x x",
        });

        valueInput.value = "41";
        simulateInputChange();

        expect(valueInput.value).toBe("4 1 ");
    })

    test("Test when enters first char from template", function() {
        new TemplateFormatter(valueInput, {
            template: "123 xxx"
        });

        valueInput.value = "1";
        simulateInputChange();

        expect(valueInput.value).toBe("123 ");
    })

    test("Test when first char from second prefix", function() {
        new TemplateFormatter(valueInput, {
            template: "+1 xxx",
            prefixes: [ "+2 ", "+3 "]
        });

        valueInput.value = "2";
        simulateInputChange();

        expect(valueInput.value).toBe("+2 ");
    })

    test("Test backspace", function() {
        new TemplateFormatter(valueInput, {
            template: "+1 (xxx) xxx"
        })

        valueInput.value = "+1 (12)"
        simulateInputChange(true);
        expect(valueInput.value).toBe("+1 (12")
    })

    test("Test when prefixes partially equal", function() {
        new TemplateFormatter(valueInput, {
            template: "1234 xxx",
            prefixes: ["1245 ", "1366 "]
        });

        valueInput.value = "12";
        simulateInputChange();
        expect(valueInput.value).toBe("12");

        valueInput.value = "123";
        simulateInputChange();
        expect(valueInput.value).toBe("1234 ");

        valueInput.value = "12";
        simulateInputChange();
        expect(valueInput.value).toBe("12");

        valueInput.value = "124";
        simulateInputChange();
        expect(valueInput.value).toBe("1245 ");
    })

    test("Test multi prefix (template with prefix)", function() {
        let tformat = new TemplateFormatter(valueInput, {
            template: "12 xxx",
            prefixes: ["13 ", "41 "]
        });

        valueInput.value = "1";
        simulateInputChange()
        expect(valueInput.value).toBe("1");

        valueInput.value = "13";
        simulateInputChange()
        expect(valueInput.value).toBe("13 ");

        valueInput.value = "4";
        simulateInputChange()
        expect(valueInput.value).toBe("41 ");
    })

    test("Test multi prefix (no prefix in template)", function() {
        let tformat = new TemplateFormatter(valueInput, {
            template: "x x x",
            prefixes: ["2 ", "3 "]
        });

        valueInput.value = "456";
        simulateInputChange();
        expect(valueInput.value).toBe("4 5 6");

        valueInput.value = "2345";
        simulateInputChange();
        expect(valueInput.value).toBe("2 3 4 5");
    })

    test("Test prefixes reassign (no prefix in template)", function() {
        let tformat = new TemplateFormatter(valueInput, {
            template: "x x x",
            prefixes: ["2 ", "3 "]
        });

        tformat.prefixes = ["5 ", "6 "];

        valueInput.value = "456";
        simulateInputChange();
        expect(valueInput.value).toBe("4 5 6");

        valueInput.value = "5678";
        simulateInputChange();
        expect(valueInput.value).toBe("5 6 7 8");
    })

    test("Test prefix rollback after deletion", function() {
        let tformat = new TemplateFormatter(valueInput, {
            template: "1 x x x",
            prefixes: ["2 ", "3 "]
        });

        valueInput.value = "2";
        simulateInputChange();
        valueInput.value = "";
        simulateInputChange(true);

        expect(valueInput.value).toBe('');
        expect(tformat.currentPrefix).toBe('1 ');
    })

    test("Test on prefix change event", function() {
        let tformat = new TemplateFormatter(valueInput, {
            template: "123 xxx",
            prefixes: ["145 ", "567 "]
        });

        let eventDetail;
        valueInput.addEventListener('tf.p.onchange', function(e) {
            eventDetail = (e as CustomEvent).detail;
        });

        valueInput.value = "1";
        simulateInputChange();
        expect(eventDetail).toBe(-1);

        valueInput.value = "14";
        simulateInputChange();
        expect(eventDetail).toBe(1);
    })

    test("On prefix has removed", () => {
        createTFormat({
            template: "+1 xxx xxx",
            prefixes: ["+2 "],
        });

        valueInput.value = "+1 ";
        simulateInputChange();

        valueInput.value = "+";
        simulateInputChange(true);

        expect(valueInput.value).toBe('');
    })
})


describe("Hidden input", function() {
    beforeEach(function() {
        setupInputField();
    })

    afterEach(function() {
        clearInputField();
    })

    test("Test hidden input", function() {
        let tformat = new TemplateFormatter(valueInput, {
            template: "1 xxx",
            createHiddenInput: true
        });

        valueInput.value = "1234";
        simulateInputChange();

        const inputClone = tformat._clonedInput;
        
        expect(valueInput != inputClone).toBeTruthy();
        expect(inputClone?.value).toBe("1234");
    })

    test("Test on base template change", function() {
        let tformat = new TemplateFormatter(valueInput, {
            template: "1 x x x",
            createHiddenInput: true
        });

        expect(tformat._templateForHiddenInput).toBe(tformat.template);

        tformat.template = "2 xxx";
        expect(tformat._templateForHiddenInput).toBe(tformat.template);
    })
})

describe("General", function() {
    beforeEach(function() {
        setupInputField();
    })

    afterEach(function() {
        clearInputField();
    })

    test("Test init from id of element", function() {
        const getElementById = jest.fn();
        global.document.getElementById = getElementById;

        try {
            new TemplateFormatter(INPUT_ID, {
                template: "1 x x x"
            });    
        }
        catch {

        }
        
        expect(document.getElementById).toHaveBeenCalled();
        expect(getElementById.mock.calls[0][0]).toBe(INPUT_ID);
    })

    test("Init with non empty input value", () => {
        valueInput.value = "234";

        let tformat = new TemplateFormatter(valueInput, {
            template: "1 xxx",
            showPrefixOnFocus: true
        });

        expect(valueInput.value).toBe("1 234");
    })

    test("Test postfix", function() {
        new TemplateFormatter(valueInput, {
            template: "+1 (xx)"
        });

        valueInput.value = "+1 (23";
        simulateInputChange();
        
        expect(valueInput.value).toBe("+1 (23)");
    })

    test("Test template change", function() {
        let tformat = new TemplateFormatter(valueInput, {
            template: "1 x x x"
        });

        tformat.template = "2 xxxt";
        
        expect(tformat.template).toBe("xxxt");
        expect(tformat._prefixes).toEqual(['2 ']);
    })

    test("Test using without input", function() {
        let tformat = new TemplateFormatter("", {
            template: "1 x x x",
            prefixes: ["2 ", "3 "]
        });

        expect(tformat.isMatchTemplate("1 2 3 4")).toBe(true);
        expect(tformat.isMatchTemplate("5 4 3 2")).toBe(false);
        expect(tformat.isMatchTemplate("2 3 4 5")).toBe(true);
    })

    test("Space pressed", function() {
        createTFormat({
            template: "1 x x x",
            prefixes: ["2 ", "3 "]
        });

        valueInput.value = " ";
        simulateInputChange();

        expect(valueInput.value).toBe("1 ");
    })

    test("On remove non template value", () => {
        createTFormat({
            template: '+1 (xxx) xxx xx xx',
            showPrefixOnFocus: true
        });

        valueInput.value = "+1 (234)";
        simulateInputChange();

        valueInput.value = "+1 (234";
        simulateInputChange(true);

        expect(valueInput.value).toBe("+1 (234");
    })

    test("If value in the middle of template was removed", () => {
        createTFormat({
            template: "+1 (xxx) xxx"
        });

        valueInput.value = "+1 (234) ";
        simulateInputChange();

        valueInput.value = "+1 (24) ";
        simulateInputChange(true);

        expect(valueInput.value).toBe("+1 (24");
    })
})

describe("Phone", function() {
    beforeEach(function() {
        setupInputField();
    })

    afterEach(function() {
        clearInputField();
    })

    test("Test basic phone formatting", function() {
        new TemplateFormatter(valueInput, {
            template: '1 (xxx) xxx xx xx'
        });

        let phone = '19998887766';

        valueInput.value = phone;
        simulateInputChange();

        expect(valueInput.value).toBe('1 (999) 888 77 66');
    })
})

describe("Focus and blur", () => {
    beforeEach(() => {
        setupInputField();
    })

    afterEach(() => {
        clearInputField();
    })

    test("Show prefix on focus", () => {
        new TemplateFormatter(valueInput, {
            template: "+1 xxx xxx",
            showPrefixOnFocus: true,
        });

        valueInput.dispatchEvent(new FocusEvent('focus'));
        expect(valueInput.value).toBe("+1 ");
    })

    test("Hide prefix on blur", () => {
        new TemplateFormatter(valueInput, {
            template: '+1 xxx xxx',
            hidePrefixOnBlur: true,
            showPrefixOnFocus: true,
        });

        valueInput.dispatchEvent(new FocusEvent('focus'));
        valueInput.dispatchEvent(new FocusEvent('blur'));

        expect(valueInput.value).toBe('');
    })

    test("Don't hide prefix on blur", () => {
        new TemplateFormatter(valueInput, {
            template: '+1 xxx xxx',
            hidePrefixOnBlur: false,
            showPrefixOnFocus: true,
        });

        valueInput.dispatchEvent(new FocusEvent('focus'));
        valueInput.dispatchEvent(new FocusEvent('blur'));

        expect(valueInput.value).toBe('+1 ');
    })
})

describe("Full template display", () => {
    beforeEach(() => {
        setupInputField();
    })

    afterEach(() => {
        clearInputField();
    })

    test("Show template on focus", () => {
        createTFormat({
            template: "+1 (xxx)xxx-xx-xx",
            showPrefixOnFocus: true,
            showFullTemplate: true,
        });

        valueInput.dispatchEvent(new FocusEvent('focus'));

        expect(valueInput.value).toBe('+1 (   )   -  -  ');
    })

    test("Show template on focus with custom chars", () => {
        createTFormat({
            template: "+1 (xxx)xxx-xx-xx",
            showPrefixOnFocus: true,
            showFullTemplate: true,
            emptySpaceChar: '__',
        });

        valueInput.dispatchEvent(new FocusEvent('focus'));

        expect(valueInput.value).toBe("+1 (___)___-__-__");
    })

    test("Input with full template display", () => {
        createTFormat({
            template: "+1 (xxx)xxx-xx-xx",
            showPrefixOnFocus: true,
            showFullTemplate: true,
            emptySpaceChar: '_',
        });

        valueInput.value = "2";
        valueInput.setSelectionRange(1, 1);
        simulateInputChange();

        expect(valueInput.value).toBe("+1 (2__)___-__-__");
        expect(valueInput.selectionStart).toBe(5);
    })

    test("Input caret has moved", () => {
        createTFormat({
            template: "+1 (xxx)xxx-xx-xx",
            showPrefixOnFocus: true,
            showFullTemplate: true,
        });

        valueInput.dispatchEvent(new FocusEvent('focus'));

        valueInput.value = "+1 (2   )   -  -  ";
        valueInput.setSelectionRange(5, 5);
        simulateInputChange();

        expect(valueInput.selectionStart == valueInput.selectionEnd).toBeTruthy();
        expect(valueInput.selectionStart).toBe(5);
    })

    test("On prefix has removed", () => {
        createTFormat({
            template: "+1 (xxx)xxx-xx-xx",
            showFullTemplate: true,
            emptySpaceChar: '_'
        });

        valueInput.dispatchEvent(new FocusEvent('focus'));
        valueInput.setSelectionRange(2, 2);
        valueInput.value = "+ (___)___-__-__";
        simulateInputChange(true);

        expect(valueInput.value).toBe('');
    })

    test("Space pressed", () => {
        createTFormat({
            template: "+1 (xxx)xxx-xx-xx",
            showFullTemplate: true,
            prefixes: ["+2 ("],
            emptySpaceChar: '_'
        });

        valueInput.value = " ";
        simulateInputChange();

        expect(valueInput.value).toBe("+1 (___)___-__-__");
    })

    test("If delete before delimiter", () => {
        createTFormat({
            template: "+1 (xxx)xxx-xx-xx",
            showFullTemplate: true,
            emptySpaceChar: '_'
        });

        valueInput.value = "+1 (234)567-89-10";
        simulateInputChange();

        simulateChange("+1 (234)567-89-", true);

        expect(valueInput.value).toBe("+1 (234)567-89-__");
    })

    test("Input after non template val", () => {
        createTFormat({
            template: "+1 (xxx) xxx",
            showFullTemplate: true,
            emptySpaceChar: '_'
        });

        valueInput.value = "+1 (234) 2";
        valueInput.setSelectionRange(8, 8);
        simulateInputChange();

        expect(valueInput.selectionStart).toBe(10);
    })
})

describe("Input caret", () => {
    beforeEach(() => {
        setupInputField();
    })

    afterEach(() => {
        clearInputField();
    })

    test("Print char in the middle", () => {
        createTFormat({
            template: "+1 (xxx) xxx-xx-xx"
        });

        valueInput.value = "+1 (123) 4";
        simulateInputChange();

        valueInput.value = "+1 (1523) 4";
        valueInput.selectionStart = 6;
        simulateInputChange();

        expect(valueInput.value).toBe("+1 (152) 34")
        expect(valueInput.selectionStart).toBe(6);
    })

    test("Remove char from the middle", () => {
        createTFormat({
            template: "+1 (xxx) xxx-xx-xx"
        });

        valueInput.value = "+1 (234) 5";
        valueInput.setSelectionRange(10, 10);
        simulateInputChange();

        valueInput.value = "+1 (24) 5";
        valueInput.setSelectionRange(5, 5);
        simulateInputChange(true);

        expect(valueInput.selectionStart).toBe(5);
    })

    test("Input caret position after char deletion", () => {
        createTFormat({
            template: "+1 (xxx)xxx-xx-xx",
            showFullTemplate: true,
        });

        valueInput.dispatchEvent(new FocusEvent('focus'));
        valueInput.value = "+1 (23)   -  -  ";
        valueInput.selectionStart = 6, valueInput.selectionEnd = 6;
        simulateInputChange(true);
        
        expect(valueInput.value).toBe("+1 (23 )   -  -  ");
        expect(valueInput.selectionStart).toBe(6);
    })
})
