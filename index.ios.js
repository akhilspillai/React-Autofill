/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import { AppRegistry, StyleSheet, View, ScrollView } from "react-native";
import AutofillText from "./AutofillTextInput/autofill";

export default class Autofill extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideDialog: false
    };
  }
  render() {
    return (
      <View
        style={styles.container}
      >
        <ScrollView style={{ alignSelf: "stretch" }}
          keyboardShouldPersistTaps="always"
          onScroll={() => {
            this.autofill.hideDialog()
          }}>
          <View style={{ height: 200, backgroundColor: "red" }} />
          <View style={{ height: 200, backgroundColor: "blue" }} />
          <AutofillText
            ref={(autofill) => {this.autofill = autofill}}
            style={styles.autofill}
            hideDialog={this.state.hideDialog}
          />
          <View style={{ height: 200, backgroundColor: "green" }} />
          <View style={{ height: 200, backgroundColor: "yellow" }} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  autofill: {
    alignSelf: "stretch"
  }
});

const url =
  "http://data.50more.com/profile/search-location?locality_country=1&q=";

AppRegistry.registerComponent("Autofill", () => Autofill);
