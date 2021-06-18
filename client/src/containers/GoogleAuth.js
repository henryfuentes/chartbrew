import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  Grid, Loader, Container, Dimmer, Button, Header, Icon
} from "semantic-ui-react";
import cookie from "react-cookies";
import queryString from "query-string";

import { API_HOST } from "../config/settings";

/*
  Component for processing the authentication code from Google
*/
function GoogleAuth(props) {
  const { history } = props;

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    _processAuth();
  }, []);

  const _processAuth = () => {
    const parsedParams = queryString.parse(document.location.search.slice(1));
    const { state, code } = parsedParams;
    if (!state || !code) {
      setError(true);
      return false;
    }
    const ids = state.split(",");

    const url = `${API_HOST}/project/${ids[0]}/connection/${ids[1]}/auth/google`;
    const method = "PUT";
    const body = JSON.stringify({ code });
    const headers = new Headers({
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cookie.load("brewToken")}`,
    });

    setLoading(false);
    return fetch(url, { method, body, headers })
      .then((response) => {
        if (!response.ok) return Promise.reject(new Error(response.status));

        return response.json();
      })
      .then((result) => {
        setLoading(false);
        setSuccess(true);
        history.push(`/${result.team_id}/${result.connection.project_id}/connections?edit=${result.connection.id}`);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  return (
    <div style={styles.container}>
      <Grid
        centered
        verticalAlign="middle"
        textAlign="center"
      >
        <Grid.Column stretched style={{ maxWidth: 500 }}>
          <Dimmer active={loading} style={{ marginTop: "5em" }} inverted>
            <Loader size="big" inverted content="Authenticating with Google..." />
          </Dimmer>

          {success
            && (
              <Container textAlign="center" style={{ marginTop: "3em" }}>
                <Header as="h2" icon color="green">
                  <Icon color="green" name="checkmark" circular />
                </Header>
                <Button positive icon labelPosition="right">
                  <Link to="/user" style={{ color: "white" }}> Go to connections </Link>
                  <Icon name="arrow alternate circle right outline" />
                </Button>
              </Container>
            )}

          {error
            && (
              <Header as="h2" icon color="red">
                <Icon color="red" name="delete" circular />
                The authentication could not be completed
                <Header.Subheader>
                  Please try refreshing the page or get in touch for help.
                </Header.Subheader>
              </Header>
            )}
        </Grid.Column>
      </Grid>
    </div>
  );
}

GoogleAuth.propTypes = {
  history: PropTypes.object.isRequired,
};

const styles = {
  container: {
    flex: 1,
  },
};

export default connect()(GoogleAuth);