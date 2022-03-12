import React from 'react';

import TemplateFormatter, { TFBaseProps } from '../tformat';

export type TFReactState = {
    value: string,
    wasCharDeleted: boolean,
}

export type TFReactProps = {
    onFormatted: (val: string, rawVal: string) => void
}   & TFBaseProps
    & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export class TFReact extends React.Component<TFReactProps, TFReactState> {
    inputRef: React.RefObject<HTMLInputElement>;
    formatter: TemplateFormatter;

    constructor(props: TFReactProps) {
        super(props);

        this.inputRef = React.createRef<HTMLInputElement>();
        this.formatter = new TemplateFormatter(null, this.props as TFBaseProps);
        
        let inputValue = String(this.props.value || '');

        if (inputValue) {
            const formattedValue = this.formatter._processNewInput(inputValue, false);
            this.props.onFormatted(
                formattedValue,
                this.formatter.getRawValue(formattedValue)
            );
        }

        this.state = {
            value: inputValue,
            wasCharDeleted: false,
        }
    }

    updateValue(formattedValue: string) {
        this.props.onFormatted(
            formattedValue,
            this.formatter.getRawValue(formattedValue)
        );

        const selectionPosition = this.formatter
            ._getInputCaretPosition(this.inputRef.current?.selectionStart || 0, formattedValue, this.state.wasCharDeleted);

        this.setState({
            value: formattedValue,
            wasCharDeleted: this.state.wasCharDeleted
        }, () => {
            if (this.props.showFullTemplate && this.inputRef.current) {
                this.inputRef.current.setSelectionRange(selectionPosition, selectionPosition);
            }
        })
    }

    onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        this.setState({
            value: this.state.value,
            wasCharDeleted: e.key == 'Backspace' || e.key == 'Delete'
        });

        this.props.onKeyDown && this.props.onKeyDown(e);
    }

    onChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.updateValue(
            this.formatter._processNewInput(e.target.value, this.state.wasCharDeleted)
        );
    }

    onFocus(e: React.FocusEvent<HTMLInputElement>) {
        if (this.props.showPrefixOnFocus && !this.state.value) {
            let firstPrefix = this.formatter._prefixes[0] || '';

            this.updateValue(
                this.formatter._processNewInput(firstPrefix, false)
            );
        }

        this.props.onFocus && this.props.onFocus(e);
    }

    onBlur(e: React.FocusEvent<HTMLInputElement>) {
        if (this.props.hidePrefixOnBlur && this.formatter.currentPrefix === this.state.value)
            this.updateValue('');

        this.props.onBlur && this.props.onBlur(e);
    }

    render(): React.ReactNode {
        return <input ref={this.inputRef}
            id={this.props.id}
            className={this.props.className}
            type={this.props.type}
            value={this.state.value}
            placeholder={this.props.placeholder}
            style={this.props.style}
            onCopy={this.props.onCopy}
            onCut={this.props.onCut}
            onPaste={this.props.onPaste}
            onBlur={this.onBlur.bind(this)}
            onFocus={this.onFocus.bind(this)}
            onSelect={this.props.onSelect}
            onSubmit={this.props.onSubmit}
            onReset={this.props.onReset}
            onKeyDown={this.onKeyDown.bind(this)}
            onKeyPress={this.props.onKeyPress}
            onKeyUp={this.props.onKeyUp}
            onChange={this.onChange.bind(this)}
             />
    }
}

export default TFReact;
