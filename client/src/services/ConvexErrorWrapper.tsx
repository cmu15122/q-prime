// TODO MAKE THIS WORK CORRECTLY

import { Component, ReactNode } from "react";
import { ConvexError } from "convex/values";
import { showErrorToast } from "./ToastService";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ConvexErrorWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): State {
    // Only catch ConvexErrors
    if (error instanceof ConvexError) {
      return { hasError: true };
    }
    // Re-throw other errors to be handled by parent error boundaries
    throw error;
  }

  componentDidCatch(error: unknown) {
    if (error instanceof ConvexError) {
      // Extract the error message from the ConvexError data
      const message =
        typeof error.data === "string"
          ? error.data
          : error.data && typeof error.data === "object" && "message" in error.data
            ? (error.data as any).message
            : JSON.stringify(error.data);

      showErrorToast(message);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render null to unmount the children, but keep the app running.
      // Ideally, the user of this wrapper would key it to reset on navigation
      // or provide a way to recover.
      return null;
    }

    return this.props.children;
  }
}

