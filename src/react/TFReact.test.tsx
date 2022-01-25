import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TFReact from './TFReact';
import { wait } from '@testing-library/user-event/dist/utils';

describe("TFReact", () => {
    test("Render the input", () => {
        render(<TFReact template='+1 xxx xxx' onFormatted={(val, rawVal) => {}} />);
    })

    test("Change the input value", async () => {
        let inputValue = "";
        render(<TFReact value={inputValue} placeholder='Enter number'
            template='+1 xxx' onFormatted={(val, rawVal) => { inputValue = val }} showPrefixOnFocus={true} />);
        
        await userEvent.type(screen.getByPlaceholderText("Enter number"), "2");

        expect(inputValue).toBe("+1 2");
    })

    test("Init with predefined value", () => {
        let inputValue = "2";
        render(<TFReact value={inputValue} placeholder='Enter number'
            template='+1 xxx' onFormatted={(val, rawVal) => { inputValue = val }} showPrefixOnFocus={true} />);

        var inputElem = screen.getByPlaceholderText("Enter number") as HTMLInputElement;

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
