var creditCardList;

function initPhoneInput() {
    let phoneFormatter = new TemplateFormatter('phoneInput', {
        template: '+1 (xxx) xxx xx xx',
        createHiddenInput: true,
        prefixes: ["+4 ("],
        showTemplateOnFocus: true,
        emptySpaceChar: '_'
    });

    submitPhoneNumber.formatter = phoneFormatter;
}

function submitPhoneNumber(event, form) {
    event.preventDefault();

    if (submitPhoneNumber.formatter.isInputValueValid())
        alert('Form was serialized as ' + new FormData(form).get('phone'))
    else
        alert('Phone number is invalid');
}

function highlightCardType(cardType) {
    creditCardList = document.getElementById('creditCardList');

    creditCardList.querySelectorAll('li').forEach(t => {
        t.classList.remove('clr-valid');
        if (t.dataset['cardType'] == cardType)
            t.classList.add('clr-valid');
    })
    
    if (cardType == -1)
        creditCardList.classList.remove('faded');
    else
        creditCardList.classList.add('faded');
}

function initCardInput() {
    creditCardList = document.getElementById('creditCardList');

    let cardInput = document.getElementById('cardInput');
    /* We can also initialize formatter with HTMLElement */
    new TemplateFormatter(cardInput, {
        template: "3xxx xxxx xxxx",
        prefixes: ["4", "5"]
    });

    cardInput.addEventListener('tf.p.onchange', function (e) {
        let enteredCardType = e.detail;

        highlightCardType(enteredCardType);
    });
}

function initInputWithTwoTemplates() {
    const parcelCodeTemplate = "LCxxxxxxCN";
    const phoneNumberTemplate = "+1 xxx xxx xx xx";
    let parcelFormatter = new TemplateFormatter('postInput', {
        template: parcelCodeTemplate
    })
    parcelFormatter._inputElement.setAttribute('placeholder', parcelCodeTemplate);

    document.getElementById("postInputType").addEventListener('change', (e) => {
        switch (e.target.value) {
            case "1":
                parcelFormatter.template = parcelCodeTemplate;
                parcelFormatter._inputElement.setAttribute('placeholder', parcelCodeTemplate);
                parcelFormatter._inputElement.value = '';
                break;
            case "2":
                parcelFormatter.template = phoneNumberTemplate;
                parcelFormatter._inputElement.setAttribute('placeholder', phoneNumberTemplate);
                parcelFormatter._inputElement.value = '';
                break;
        }
    })
}

document.addEventListener('DOMContentLoaded', function () {
    initPhoneInput();
    initCardInput();
    initInputWithTwoTemplates();
})