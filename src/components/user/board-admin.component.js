import React, { Component } from "react";

import UserService from "../../service/user.service";
import EventBus from "../common/EventBus";

export default class BoardAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: "",
      activeUsers5m: null
    };
  }

  componentDidMount() {
    UserService.getAdminBoard().then(
      response => {
        this.setState({
          content: response.data
        });
      },
      error => {
        this.setState({
          content:
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString()
        });

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
      }
    );

    // Fetch "active users" (best-effort)
    UserService.getActiveUsersCount(5).then(
      res => {
        const count = res?.data?.activeUsers;
        this.setState({ activeUsers5m: typeof count === "number" ? count : null });
      },
      () => {
        this.setState({ activeUsers5m: null });
      }
    );
  }

  render() {
    return (
      <div className="container">
        <header className="jumbotron">
          <h3>{this.state.content}</h3>
          <div style={{ marginTop: 12, fontSize: 14, opacity: 0.85 }}>
            Active users (last 5 min):{" "}
            <strong>{this.state.activeUsers5m ?? "—"}</strong>
          </div>
        </header>
      </div>
    );
  }
}