/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Dimensions,
  Keyboard,
  StatusBar
} from "react-native";

export default class AutoCorrect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      tempText: "",
      dialogVisible: false,
      items: [],
      dialogHeight: 0,
      dialogWidth: 0,
      dialogTop: 0,
      dialogBottom: 0,
      dialogLeft: 0
    };
    this.keyBoardHeight = 0;
  }

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this.keyboardDidShow.bind(this)
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this.keyboardDidHide.bind(this)
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  keyboardDidShow(e) {
    this.keyBoardHeight = e.endCoordinates.height;
    setTimeout(() => this.measure(), 500);
  }

  keyboardDidHide(e) {
    this.keyBoardHeight = 0;
    this.measure();
  }

  measure = () => {
    console.log("measuring");
    if (!this.props.textRef) {
      console.log("null reference");
      return
    }
    this.props.textRef.measure((fx, fy, width, height, px, py) => {
      windowHeight = Dimensions.get("window").height - StatusBar.currentHeight;
      pageHeight = windowHeight - this.keyBoardHeight;
      console.log("StatusBar.currentHeight: " + StatusBar.currentHeight);
      console.log("width: " + width);
      console.log("height: " + height);
      console.log("w-height: " + windowHeight);
      console.log("k-height: " + this.keyBoardHeight);

      bottom = pageHeight - py
      console.log("bottom: " + bottom);
      console.log("pageHeight: " + pageHeight);
      console.log("py + height: " + (py + height));
      console.log("fx: " + fx);
      console.log("fy: " + fy);
      console.log("px: " + px);
      console.log("py: " + py);

      if (py > bottom) {
        if (
          this.state.dialogBottom !== bottom ||
          this.state.dialogHeight !== py * 0.75
        ) {
          this.setState({
            dialogHeight: py * 0.75,
            dialogWidth: width,
            dialogTop: 0,
            dialogBottom: bottom,
            dialogLeft: px
          });
        }
      } else {
        if (
          this.state.dialogTop !== py + height ||
          this.state.dialogHeight !== (bottom - height) * 0.75
        ) {
          this.setState({
            dialogHeight: (bottom - height) * 0.75,
            dialogWidth: width,
            dialogTop: py + height,
            dialogBottom: 0,
            dialogLeft: px
          });
        }
      }
    });
  };

  render() {
    const items = this.state.items.map((s, i) => ({ key: i, value: s }));
    return (
      <View
        style={[styles.container, this.props.style]}
        pointerEvents="box-none"
      >
        {this.state.dialogVisible && this.itemList(items)}
      </View>
    );
  }

  itemList = items => {
    let {
      dialogHeight,
      dialogWidth,
      dialogTop,
      dialogBottom,
      dialogLeft
    } = this.state;
    console.log(
      "dialogHeight,dialogWidth, dialogTop, dialogBottom is",
      dialogHeight,
      dialogWidth,
      dialogTop,
      dialogBottom
    );
    customStyle =
      dialogTop === 0
        ? {
            bottom: dialogBottom,
            width: dialogWidth,
            maxHeight: dialogHeight,
            left: dialogLeft
          }
        : {
            top: dialogTop,
            width: dialogWidth,
            maxHeight: dialogHeight,
            left: dialogLeft
          };
    return (
      <View
        style={[styles.list, customStyle]}
        onStartShouldSetResponderCapture={() => false}
      >
        <FlatList
          ref={(list) => this.list = list}
          data={items}
          renderItem={({ item }) => this.listItem(item)}
          ItemSeparatorComponent={() => this.separator()}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={false}
          pointerEvents="auto"
          onLayout={() => {
            if (this.refs.list && this.state.items.length > 0) {
              this.refs.list.scrollToOffset({ x: 0, y: 0, animated: false });
            }
          }}
        />
      </View>
    );
  };

  textChanged = text => {
    if (text.length < 3) {
      this.setState({
        dialogVisible: false,
        items: [],
        tempText: text,
        text: ""
      });
    } else {
      this.setState({ dialogVisible: false, items: [], tempText: text, text: "" });
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => this.getData(text), 500);
    }
  };

  getData = text => {
    fetch(url + text)
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.status == 200) {
          const results = responseJson.data.results.map((s, i) => {
            return s.city_display;
          });
          if (this.state.tempText.length > 2) {
            this.setState({ dialogVisible: true, items: results });
          }
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  listItem = item =>
    <Text
      style={{ fontSize: 15, padding: 20 }}
      onPress={() => {
        this.onItemClick(item);
      }}
    >
      {item.value}
    </Text>;

  onItemClick = item => {
    this.setState({ text: item.value, dialogVisible: false });
  };

  separator = () => <View style={{ backgroundColor: "#CCCCCC", height: 1 }} />;

  toggleDialog = (isVisible) => {
    if (this.state.dialogVisible !==  isVisible) {
      if ((isVisible && this.state.items.length > 0) || !isVisible) {
        this.setState({ dialogVisible: isVisible })
      }
    }
  }
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "absolute",
    zIndex: 1
  },
  list: {
    backgroundColor: "lightblue",
    borderRadius: 3,
    position: "absolute"
  }
});

const url =
  "http://data.50more.com/profile/search-location?locality_country=1&q=";
