import TemplateFormatter from '../tformat.min.js'

describe("Test minified js", () => {
    test("Init with input", () => {
        const valueInput = document.createElement("input");

        new TemplateFormatter(valueInput, {
            template: "x x x",
        });

        valueInput.value = "123";
        valueInput.dispatchEvent(new Event('keyup'));

        expect(valueInput.value).toBe("1 2 3");
    })
})
