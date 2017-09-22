/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import { AppRegistry, StyleSheet, View, ScrollView, TextInput } from "react-native";
import Suggester from "./Suggester";

export default class Autofill extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestVisible: false,
      textRef: undefined,
      cities: []
    };
  }
  render() {
    return (
      <View
        style={styles.container}
      >
        <Suggester
          ref={(auto) => {this.auto = auto}}
          textRef={this.state.textRef}
          items={this.state.cities}
          onItemClick={(city) => {this.setState({selected: true, text: city})}}
          visible={!this.state.selected && this.state.dialogVisible}/>
        <ScrollView style={{ alignSelf: "stretch" }}
          keyboardShouldPersistTaps="always"
          onScrollBeginDrag={() => {
            console.log("Begin drag");
            this.setState({dialogVisible: false})
          }}
          onScrollEndDrag={() => {
            console.log("End drag");
            this.setState({dialogVisible: true})
          }}
          onMomentumScrollBegin={() => {
            console.log("Begin momentum");
            this.setState({dialogVisible: false})
          }}
          onMomentumScrollEnd={() => {
            console.log("End momentum");
            this.setState({dialogVisible: true})
          }}
        >
          <View style={{ height: 200, backgroundColor: "red" }} />
          <View style={{ height: 200, backgroundColor: "blue" }} />
          <TextInput
            style={styles.input}
            ref={(text) => {this.state.textRef || this.setState({ textRef: text })}}
            onChangeText={text => {this.textChanged(text)}}
            placeholder="Enter city"
            autoCapitalize={"none"}
            autoCorrect={false}
            value={this.state.text}/>
          <View style={{ height: 200, backgroundColor: "green" }} />
          <View style={{ height: 200, backgroundColor: "yellow" }} />
        </ScrollView>
      </View>
    );
  }

  textChanged = text => {
    this.setState({
      dialogVisible: false,
      selected: false,
      cities: [],
      text: text
    });
    if (text.length > 2) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      console.log("timeout set");
      this.timeout = setTimeout(() => this.getData(text), 500);
    }
  };

  getData = text => {
    console.log("fetching");
    fetch(url + text)
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.status == 200) {
          console.log("fetched");
          const results = responseJson.data.results.map((s, i) => {
            return s.city_display;
          });
          if (this.state.text.length > 2) {
            this.setState({ dialogVisible: true, cities: results });
          }
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "transparent"
  },
  input: {
    height: 40,
    marginHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    borderColor: "#CCCCCC",
    borderWidth: 1,
  }
});

const url =
  "http://data.50more.com/profile/search-location?locality_country=1&q=";

AppRegistry.registerComponent("Autofill", () => Autofill);
