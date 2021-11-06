// import {TemplateFormatter} from '../tformat';

const INPUT_ID = "phoneInput";

var valueInput;

function setupInputField() {
    valueInput = document.createElement('input');
    valueInput.setAttribute('id', INPUT_ID);
    valueInput.setAttribute('name', INPUT_ID);

    document.getElementsByTagName('main')[0].prepend(valueInput);
}

function clearInputField() {
    let inputs = document.getElementsByTagName('input');

    while (inputs.length > 0)
        inputs[inputs.length - 1].remove();    
}

function simulateKeyUp() {
    valueInput.dispatchEvent(new Event('keyup'));
}

describe("Independent methods", function() {
    beforeEach(function() {
        setupInputField();
    })

    afterEach(function() {
        clearInputField();
    })

    it("Test get max unique val", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "123 xxx"
        });

        assert.deepEqual(tformat.getUniqueMaxVal([1, 1, 2]), { value: 2, index: 2 });
        assert.deepEqual(tformat.getUniqueMaxVal([1, 1, 1]), { value: 1, index: -1 });
    })

    it("Test getSuitablePrefixIndex", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "+123 xxx",
            prefixes: ["+156 ", "+645 "]
        });

        assert.equal(tformat.getSuitablePrefixIndex(''), -1);
        assert.equal(tformat.getSuitablePrefixIndex('  '), -1);
        assert.equal(tformat.getSuitablePrefixIndex("1"), -1);
        assert.equal(tformat.getSuitablePrefixIndex("+15"), 1);
    })

    it("Test format func", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: '123 xxx xxx'
        });

        let enteredNumber = "123456789";
        
        assert.equal(tformat.formatText(enteredNumber), '123 456 789');
    })

    it("Test prefix match count calculation", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "123 xxx",
            prefixes: ['125 ', '134 ', '666 ']
        });

        assert.deepEqual(tformat.calcPrefixMatchCount("12"), [2, 2, 1, 0]);
    })

    it("Test pushPostfixIfNeeded", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "123 (xxx)"
        })

        assert.equal(tformat.pushPostfixIfNeeded('123 (x'), '123 (x');
        assert.equal(tformat.pushPostfixIfNeeded('123 (xxx'), '123 (xxx)');
    })

    it("Test removePrefix", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "+123 (xxx)"
        })

        assert.equal(tformat.removePrefix("123456"), "456");

        tformat.template = "xxx";
        assert.equal(tformat.removePrefix("123"), "123");
    })

    it("Test formatText", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "+123-(xxx)"
        })

        assert.equal(tformat.formatText("123456"), "+123-(456)")
        assert.equal(tformat.formatText("-1 23  45 6"), "+123-(456)")
    })

    it("Test _getFirstTemplateMismatch", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "+123-(xxx)"
        });

        assert.equal(tformat._getFirstTemplateMismatch("+123-(123)"), -1);
        assert.equal(tformat._getFirstTemplateMismatch(""), 0);
        assert.equal(tformat._getFirstTemplateMismatch("+124-(456)"), 3);
        assert.equal(tformat._getFirstTemplateMismatch("+123-(f45)"), 6);
        assert.equal(tformat._getFirstTemplateMismatch("+123-(123"), 9);
        assert.equal(tformat._getFirstTemplateMismatch("+123-(1234)"), 9);
    })

    it("Test isPartiallyMatchTemplate", function() {
        tformat = new TemplateFormatter(INPUT_ID, {
            template: "1 (xxx) xxx"
        });

        assert.equal(tformat.isPartiallyMatchTemplate("1 (123) "), true, "1 (123) ");
        assert.equal(tformat.isPartiallyMatchTemplate(""), false, "Empty string doesn't match template");
        assert.equal(tformat.isPartiallyMatchTemplate("9 (123) "), false, "9 (123) ");
        assert.equal(tformat.isPartiallyMatchTemplate("1 (12) "), false, "9 (123) ");
        assert.equal(tformat.isPartiallyMatchTemplate("1 (123) 123 456 789"), false, "9 (123) ");
        assert.equal(tformat.isPartiallyMatchTemplate("1 (123) 123"), true, "Full match");
    })

    it("Test isMatchTemplate", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "+123-(xxx)"
        });

        assert.equal(tformat.isMatchTemplate("+123-"), false, "+123-");
        assert.equal(tformat.isMatchTemplate("+123-(345"), false, "+123-(345");
        assert.equal(tformat.isMatchTemplate("+123-(345)"), true, "+123-(345)");
        assert.equal(tformat.isMatchTemplate("+456-(345)"), false, "+456-(345)");
        assert.equal(tformat.isMatchTemplate("+123-(1234)"), false, "+123-(1234)");
    })
})

describe("Prefixes", function() {
    beforeEach(function() {
        setupInputField();
    })

    afterEach(function() {
        clearInputField();
    })

    it("Test when enters first char not from template", function() {
        new TemplateFormatter(INPUT_ID, {
            template: "123 xxx",
            prefixes: ["678 "]
        });

        valueInput.value = "4";
        simulateKeyUp();

        assert.equal(valueInput.value, "123 4");
    })

    it("Test when no prefixes", function() {
        new TemplateFormatter(INPUT_ID, {
            template: "x x x",
        });

        valueInput.value = "41";
        simulateKeyUp();

        assert.equal(valueInput.value, "4 1");
    })

    it("Test when enters first char from template", function() {
        new TemplateFormatter(INPUT_ID, {
            template: "123 xxx"
        });

        valueInput.value = "1";
        simulateKeyUp();

        assert.equal(valueInput.value, "123 ");
    })

    it("Test when first char from second prefix", function() {
        new TemplateFormatter(INPUT_ID, {
            template: "+1 xxx",
            prefixes: [ "+2 ", "+3 "]
        });

        valueInput.value = "2";
        simulateKeyUp();

        assert.equal(valueInput.value, "+2 ");
    })

    it("Test backspace", function() {
        new TemplateFormatter(INPUT_ID, {
            template: "+1 (xxx) xxx"
        })

        valueInput.value = "+1 "
        valueInput.dispatchEvent(new KeyboardEvent('keyup', { key: "Backspace", keyCode: 8 }))
        assert.equal(valueInput.value, "+1 ");

        valueInput.dispatchEvent(new KeyboardEvent('keyup', { key: "Delete", keyCode: 46 }))
        assert.equal(valueInput.value, "+1 ");

        valueInput.value = "+1 (12)"
        valueInput.dispatchEvent(new KeyboardEvent('keyup', { key: "Backspace", keyCode: 8 }))
        assert.equal(valueInput.value, "+1 (12")
    })

    it("Test when prefixes partially equal", function() {
        new TemplateFormatter(INPUT_ID, {
            template: "1234 xxx",
            prefixes: ["1245 ", "1366 "]
        });

        valueInput.value = "12";
        simulateKeyUp();
        assert.equal(valueInput.value, "12");

        valueInput.value = "123";
        simulateKeyUp();
        assert.equal(valueInput.value, "1234 ");

        valueInput.value = "12";
        simulateKeyUp();
        assert.equal(valueInput.value, "12");

        valueInput.value = "124";
        simulateKeyUp();
        assert.equal(valueInput.value, "1245 ");
    })

    it("Test multi prefix (template with prefix)", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "12 xxx",
            prefixes: ["13 ", "41 "]
        });

        valueInput.value = "1";
        simulateKeyUp()
        assert.equal(valueInput.value, "1");

        valueInput.value = "13";
        simulateKeyUp()
        assert.equal(valueInput.value, "13 ");

        valueInput.value = "4";
        simulateKeyUp()
        assert.equal(valueInput.value, "41 ");
    })

    it("Test multi prefix (no prefix in template)", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "x x x",
            prefixes: ["2 ", "3 "]
        });

        valueInput.value = "456";
        simulateKeyUp();
        assert.equal(valueInput.value, "4 5 6");

        valueInput.value = "2345";
        simulateKeyUp();
        assert.equal(valueInput.value, "2 3 4 5");
    })

    it("Test prefixes reassign (no prefix in template)", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "x x x",
            prefixes: ["2 ", "3 "]
        });

        tformat.prefixes = ["5 ", "6 "];

        valueInput.value = "456";
        simulateKeyUp();
        assert.equal(valueInput.value, "4 5 6");

        valueInput.value = "5678";
        simulateKeyUp();
        assert.equal(valueInput.value, "5 6 7 8");
    })

    it("Test prefix rollback after deletion", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "1 x x x",
            prefixes: ["2 ", "3 "]
        });

        valueInput.value = "2";
        simulateKeyUp();
        valueInput.value = "";
        simulateKeyUp();

        assert.equal(valueInput.value, '');
        assert.equal(tformat.currentPrefix, '');
    })

    it("Test on prefix change event", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "123 xxx",
            prefixes: ["145 ", "567 "]
        });

        let eventDetail;
        valueInput.addEventListener('tf.p.onchange', function(e) {
            eventDetail = e.detail;
        });

        valueInput.value = "1";
        simulateKeyUp();
        assert.equal(eventDetail, -1);

        valueInput.value = "14";
        simulateKeyUp();
        assert.equal(eventDetail, 1);
    })
})

describe("Hidden input", function() {
    beforeEach(function() {
        setupInputField();
    })

    afterEach(function() {
        clearInputField();
    })

    it("Test hidden input", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "1 xxx",
            createHiddenInput: true
        });

        valueInput.value = "1234";
        simulateKeyUp();
        assert.isTrue(document.getElementById(INPUT_ID) != document.getElementsByName(INPUT_ID)[0]);
        assert.equal(document.getElementsByName(INPUT_ID)[0].value, "1234");
    })

    it("Test on base template change", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "1 x x x",
            createHiddenInput: true
        });

        assert.equal(tformat._templateForHiddenInput, tformat.template);

        tformat.template = "2 xxx";
        assert.equal(tformat._templateForHiddenInput, tformat.template);
    })
})

describe("General", function() {
    beforeEach(function() {
        setupInputField();
    })

    afterEach(function() {
        clearInputField();
    })

    it("Test init from HTMLElement", function() {
        new TemplateFormatter(document.getElementById(INPUT_ID), {
            template: "1 x x x"
        });

        valueInput.value = "234";
        simulateKeyUp();

        assert.equal(valueInput.value, "1 2 3 4");
    })

    it("Test focus and blur", function() {
        let tformat = new TemplateFormatter(INPUT_ID, {
            template: "1 xxx",
            showPrefixOnFocus: true
        });

        valueInput.focus();
        assert.equal(valueInput.value, "1 ");

        valueInput.blur();
        assert.equal(valueInput.value, "");
    })

    it("Test postfix", function() {
        new TemplateFormatter(INPUT_ID, {
            template: "+1 (xx)"
        });

        valueInput.value = "+1 (23";
        simulateKeyUp();
        
        assert.equal(valueInput.value, "+1 (23)");
    })

    it("Test template change", function() {
        tformat = new TemplateFormatter(INPUT_ID, {
            template: "1 x x x"
        });

        tformat.template = "2 xxxt";
        
        assert.equal(tformat.template, "xxxt");
        assert.deepEqual(tformat._prefixes, ['2 ']);
    })

    it("Test using without input", function() {
        tformat = new TemplateFormatter("", {
            template: "1 x x x",
            prefixes: ["2 ", "3 "]
        });

        assert.equal(tformat.isMatchTemplate("1 2 3 4"), true, "1 2 3 4");
        assert.equal(tformat.isMatchTemplate("5 4 3 2"), false, "5 4 3 2");
        assert.equal(tformat.isMatchTemplate("2 3 4 5"), true, "2 3 4 5");
    })
})

describe("Phone", function() {
    beforeEach(function() {
        setupInputField();
    })

    afterEach(function() {
        clearInputField();
    })

    it("Test basic phone formatting", function() {
        new TemplateFormatter(INPUT_ID, {
            template: '1 (xxx) xxx xx xx'
        });

        let phone = '19998887766';

        valueInput.value = phone;
        simulateKeyUp();

        assert.equal(valueInput.value, '1 (999) 888 77 66');
    })
})