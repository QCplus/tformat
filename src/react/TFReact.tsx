import React from 'react';

import TemplateFormatter from '../tformat';

export type TFReactState = {
    formatter: TemplateFormatter
}

export type TFReactProps = {
    template: string,
    prefixes?: string[],
    showPrefixOnFocus?: boolean,
    onFormatted: (val: string, rawVal: string) => void
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export class TFReact extends React.Component<TFReactProps, TFReactState> {
    constructor(props: TFReactProps) {
        super(props);

        this.state = {
            formatter: new TemplateFormatter(null, {
                template: props.template,
                prefixes: props.prefixes,
                showPrefixOnFocus: props.showPrefixOnFocus,
                createHiddenInput: false
            })
        }

        if (this.props.value)
            this.updateValue(
                this.state.formatter._processNewInput(this.props.value as string, false)
            );
    }

    updateValue(formattedValue: string) {
        this.props.onFormatted(
            formattedValue,
            this.state.formatter.getRawValue(formattedValue)
        );
    }

    onChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.updateValue(
            this.state.formatter._processNewInput(e.target.value, false)
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
        if (this.state.formatter.currentPrefix === this.props.value)
            this.updateValue('');

        this.props.onBlur && this.props.onBlur(e);
    }

    render(): React.ReactNode {
        return <input
            id={this.props.id}
            className={this.props.className}
            type={this.props.type}
            value={this.props.value}
            placeholder={this.props.placeholder}
            defaultValue={this.props.defaultValue}
            style={this.props.style}
            onCopy={this.props.onCopy}
            onCut={this.props.onCut}
            onPaste={this.props.onPaste}
            onBlur={this.onBlur.bind(this)}
            onFocus={this.onFocus.bind(this)}
            onSelect={this.props.onSelect}
            onSubmit={this.props.onSubmit}
            onReset={this.props.onReset}
            onKeyDown={this.props.onKeyDown}
            onKeyPress={this.props.onKeyPress}
            onKeyUp={this.props.onKeyUp}
            onChange={this.onChange.bind(this)} />
    }    
}

export default TFReact;