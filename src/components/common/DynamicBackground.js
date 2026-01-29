import React from "react";
import { Opulento, Lumiflex, Tranquiluxe, Novatrix, Velustro, Zenitho } from "uvcanvas";

class DynamicBackground extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error rendering DynamicBackground:", error, errorInfo);
  }

  renderBackground() {
    const { theme } = this.props;
    switch (theme.label) {
      case "Tranquiluxe":
        return <Tranquiluxe className="dynamicBackground" />;
      case "Lumiflex":
        return <Lumiflex className="dynamicBackground" />;
      case "Opulento":
        return <Opulento className="dynamicBackground" />;
      case "Novatrix":
        return <Novatrix className="dynamicBackground" />;
      case "Velustro":
        return <Velustro className="dynamicBackground" />;
      case "Zenitho":
        return <Zenitho className="dynamicBackground" />;
      default:
        return null;
    }
  }

  render() {
    if (this.state.hasError) {
      return <div></div>;
    }

    return (
      <div>
        <canvas id="uvcanvas-canvas" style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }} />
        {this.renderBackground()}
      </div>
    );
  }
}

export default DynamicBackground;