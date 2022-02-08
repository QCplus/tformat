import React from 'react';

import TemplateFormatter, { TFBaseProps } from '../tformat';

export type TFReactState = {
    formatter: TemplateFormatter,
    wasCharDeleted: boolean,
    prevCaretPosition: number,
}

export type TFReactProps = {
    onFormatted: (val: string, rawVal: string) => void
}   & TFBaseProps
    & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export class TFReact extends React.Component<TFReactProps, TFReactState> {
    inputRef: React.RefObject<HTMLInputElement>;

    constructor(props: TFReactProps) {
        super(props);

        this.state = {
            formatter: new TemplateFormatter(null, props as TFBaseProps),
            wasCharDeleted: false,
            prevCaretPosition: 0
        }

        if (this.props.value) {
            const formattedValue = this.state.formatter._processNewInput(this.props.value as string, false);
            this.props.onFormatted(
                formattedValue,
                this.state.formatter.getRawValue(formattedValue)
            );
        }

        this.inputRef = React.createRef<HTMLInputElement>();
    }

    updateValue(formattedValue: string) {
        this.props.onFormatted(
            formattedValue,
            this.state.formatter.getRawValue(formattedValue)
        );

        this.setState({
            formatter: this.state.formatter,
            wasCharDeleted: this.state.wasCharDeleted,
            prevCaretPosition: this.inputRef?.current?.selectionStart || 0
        }, () => {
            if (this.props.showFullTemplate && this.inputRef.current) {
                const selectionPosition = this.state.formatter._getInputCaretPosition(this.state.prevCaretPosition, this.props.value?.toString() || '');

                this.inputRef.current.setSelectionRange(selectionPosition, selectionPosition);
            }
        })
    }

    onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        this.setState({
            formatter: this.state.formatter,
            wasCharDeleted: e.key == 'Backspace' || e.key == 'Delete'
        });

        this.props.onKeyDown && this.props.onKeyDown(e);
    }

    onChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.updateValue(
            this.state.formatter._processNewInput(e.target.value, this.state.wasCharDeleted)
        );
    }

    onFocus(e: React.FocusEvent<HTMLInputElement>) {
        if (this.props.showPrefixOnFocus && !this.props.value) {
            let firstPrefix = this.state.formatter._prefixes[0] || '';

            this.updateValue(
                this.state.formatter._processNewInput(firstPrefix, false)
            );
        }

        this.props.onFocus && this.props.onFocus(e);
    }

    onBlur(e: React.FocusEvent<HTMLInputElement>) {
        if (this.props.hidePrefixOnBlur && this.state.formatter.currentPrefix === this.props.value)
            this.updateValue('');

        this.props.onBlur && this.props.onBlur(e);
    }

    render(): React.ReactNode {
        return <input ref={this.inputRef}
            id={this.props.id}
            className={this.props.className}
            type={this.props.type}
            value={this.props.value}
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
            onChange={this.onChange.bind(this)} />
    }
}

export default TFReact;
