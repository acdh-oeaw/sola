import { Component, type ReactNode } from "react";

import { ClientError } from "@/modules/error/ClientError";

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { error: null };

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	render(): ReactNode {
		if (this.state.error !== null) {
			return <ClientError error={this.state.error} />;
		}
		return this.props.children;
	}
}
