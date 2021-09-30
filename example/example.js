var creditCardList;

function initPhoneInput() {
    let phoneFormatter = new TemplateFormatter('phoneInput', {
        template: '+1 (xxx) xxx xx xx',
        createHiddenInput: true,
        /*showPrefixOnFocus: true,*/
        prefixes: ["+4 ("]
    });
}

function submitPhoneNumber(event, form) {
    event.preventDefault();

    alert('Form was serialized as ' + new FormData(form).get('phone'))
}

function initCardInput() {
    creditCardList = document.getElementById('creditCardList');

    let cardInput = document.getElementById('cardInput');
    let cardFormatter = new TemplateFormatter(cardInput, {
        template: "3xxx xxxx xxxx",
        prefixes: ["4", "5"]
    });

    cardInput.addEventListener('tf.p.onchange', function (e) {
        creditCardList.querySelectorAll('li').forEach(t => {
            t.classList.remove('clr-valid');
            if (t.dataset['cardType'] == e.detail)
                t.classList.add('clr-valid');
        })
        
        if (e.detail == -1)
            creditCardList.classList.remove('faded');
        else
            creditCardList.classList.add('faded');
    })
}

function initInputWithTwoTemplates() {
    const parcelCodeTemplate = "LCxxxxxxCN";
    const phoneNumberTemplate = "+1 xxx xxx xx xx";
    let postInput = new TemplateFormatter('postInput', {
        template: parcelCodeTemplate
    })
    postInput._inputElement.setAttribute('placeholder', parcelCodeTemplate);

    document.getElementById("postInputType").addEventListener('change', (e) => {
        switch (e.target.value) {
            case "1":
                postInput.template = parcelCodeTemplate;
                postInput._inputElement.setAttribute('placeholder', parcelCodeTemplate);
                postInput._inputElement.value = '';
                break;
            case "2":
                postInput.template = phoneNumberTemplate;
                postInput._inputElement.setAttribute('placeholder', phoneNumberTemplate);
                postInput._inputElement.value = '';
                break;
        }
    })
}

document.addEventListener('DOMContentLoaded', function () {
    initPhoneInput();
    initCardInput();
    initInputWithTwoTemplates();
})