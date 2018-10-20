import * as React from "react";
import {Segment} from "semantic-ui-react";

interface IErrorState {
    error?: any;
    errorInfo?: any;
}

export class ErrorBoundary extends React.Component<{}, IErrorState> {
    public render() {
        if (this.state && (this.state.errorInfo || this.state.error)) {
            return (
                <Segment raised>
                    <h2>Something went wrong.</h2>
                    <pre className="wrapped">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </Segment>
            );
        }
        return this.props.children;
    }

    public componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
    }
}
