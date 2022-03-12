import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TFReact, { TFReactProps } from './TFReact';

describe("TFReact", () => {
    test("Render the input", () => {
        render(<TFReact template='+1 xxx xxx' onFormatted={(val, rawVal) => {}} />);
    })

    test("Change the input value", async () => {
        let inputValue = "";
        render(<TFReact value={inputValue} placeholder='Enter number'
            template='+1 xxx' onFormatted={(val, rawVal) => { inputValue = val }} showPrefixOnFocus={true} />);
        
        userEvent.type(screen.getByPlaceholderText("Enter number"), "2");

        await waitFor(() => {
            expect(inputValue).toBe("+1 2");
        })
    })

    test("Delete char after space", async () => {
        let inputValue = "";
        render(<TFReact value={inputValue} placeholder="Enter number"
                template='+1 xxx xxx xx xx' onFormatted={(val, rawVal) => { inputValue = val}} showPrefixOnFocus={true} />);
        
        fireEvent.change(screen.getByPlaceholderText("Enter number"), { target: { value: "234" }});

        expect(inputValue).toBe("+1 234 ");

        fireEvent.keyDown(screen.getByPlaceholderText("Enter number"), {
            key: 'Backspace',
            keyCode: 8
        });
        fireEvent.input(screen.getByPlaceholderText("Enter number"), {
            target: { value: "+1 234" },
            inputType: 'deleteContentBackward',
            bubbles: true,
            cancelable: true,
        });

        expect(inputValue).toBe("+1 234");
    })

    test("Init with predefined value", () => {
        let inputValue = "2";
        render(<TFReact value={inputValue} placeholder='Enter number'
            template='+1 xxx' onFormatted={(val, rawVal) => { inputValue = val }} showPrefixOnFocus={true} />);

        expect(inputValue).toBe("+1 2");
    })

    test("Focus the input", () => {
        let inputValue = "";
        render(<TFReact value={inputValue} placeholder='Enter number'
            template='+1 xxx' onFormatted={(val, rawVal) => { inputValue = val }} showPrefixOnFocus={true} />);

        userEvent.click(screen.getByPlaceholderText('Enter number'));

        expect(inputValue).toBe("+1 ");
    })

    test("Don't hide prefix on blur", async () => {
        let inputValue = "+1 ";
        render(<TFReact value={inputValue} placeholder='Enter number'
            template='+1 xxx' onFormatted={(val, rawVal) => { inputValue = val }}
            showPrefixOnFocus={true} hidePrefixOnBlur={false}/>);

        userEvent.click(await screen.findByPlaceholderText('Enter number'));
        userEvent.tab();

        expect(inputValue).toBe("+1 ")
    })

    test("Hide prefix on blur", async () => {
        let inputValue = "+1 ";
        render(<TFReact value={inputValue} placeholder='Enter number'
                    template='+1 xxx' onFormatted={(val, rawVal) => { inputValue = val }}
                    showPrefixOnFocus={true} hidePrefixOnBlur={true} />);

        userEvent.click(await screen.findByPlaceholderText("Enter number"));

        userEvent.tab();

        expect(inputValue).toBe("");
    })
})

describe("React full template display", () => {
    test("Type first number", async () => {
        let inputValue = "+1 4";
        render(<TFReact value={inputValue} placeholder="Enter number"
            template='+1 xxx xxx xx xx' onFormatted={(val, rawVal) => { inputValue = val }}
            showFullTemplate={true} emptySpaceChar='_' />);

        userEvent.type(screen.getByPlaceholderText("Enter number"), "2");

        await waitFor(() => {
            expect(inputValue).toBe("+1 42_ ___ __ __");
            expect(screen.getByPlaceholderText<HTMLInputElement>("Enter number").selectionStart).toBe(5);
        })
    })

    test("Type number in the middle", async () => {
        let inputValue = "+1 234";
        render(<TFReact value={inputValue} placeholder="Enter number"
                template='+1 xxx xxx xx xx' onFormatted={(val, rawVal) => { inputValue = val }}
                showFullTemplate={true} emptySpaceChar='_' />);

        userEvent.click(screen.getByPlaceholderText("Enter number"));
        userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
        userEvent.type(screen.getByPlaceholderText("Enter number"), "1", { skipClick: true });

        await waitFor(() => {
            expect(inputValue).toBe("+1 213 4__ __ __");
            expect(screen.getByPlaceholderText<HTMLInputElement>("Enter number").selectionStart).toBe(5);
        });
    })
})
