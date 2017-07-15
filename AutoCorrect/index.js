import React, { Component } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Dimensions,
  Keyboard,
  StatusBar,
  Platform
} from "react-native";

export default class AutoCorrect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      tempText: "",
      items: props.items ? props.items : [],
      dialogHeight: 0,
      dialogWidth: 0,
      dialogTop: 0,
      dialogBottom: 0,
      dialogLeft: 0,
      dialogVisible: props.visible
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

  componentWillReceiveProps(newProps) {
    console.log("props changed");
    if (newProps.items) {
      console.log("New items", newProps.items);
      this.setState({
        dialogVisible: newProps.visible,
        items: newProps.items ? newProps.items : []
      });
    }
  }

  keyboardDidShow(e) {
    this.keyBoardHeight = e.endCoordinates.height;
    if (Platform.OS === "android") {
      setTimeout(() => this.measure(), 500);
    } else {
      this.measure();
    }
  }

  keyboardDidHide(e) {
    this.keyBoardHeight = 0;
    this.measure();
  }

  measure = () => {
    if (!this.props.textRef) {
      return;
    }
    this.props.textRef.measure((fx, fy, width, height, px, py) => {
      statusBarHeight = 0;
      if (StatusBar.currentHeight) {
        statusBarHeight = StatusBar.currentHeight;
      }
      windowHeight = Dimensions.get("window").height - statusBarHeight;
      pageHeight = windowHeight - this.keyBoardHeight;

      actualBottom = pageHeight - py;
      if (Platform.OS === "android") {
        bottom = actualBottom;
      } else {
        bottom = windowHeight - py;
      }

      if (py > actualBottom) {
        if (
          this.state.dialogBottom !== 1 ||
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
            dialogHeight: (actualBottom - height) * 0.75,
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
          ref={list => (this.list = list)}
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
    this.props.onItemClick(item.value);
    this.setState({ dialogVisible: false });
  };

  separator = () => <View style={{ backgroundColor: "#CCCCCC", height: 1 }} />;

  toggleDialog = isVisible => {
    if (this.state.dialogVisible !== isVisible) {
      if ((isVisible && this.state.items.length > 0) || !isVisible) {
        this.setState({ dialogVisible: isVisible });
      }
    }
  };
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "absolute",
    zIndex: 1
  },
  list: {
    backgroundColor: "white",
    borderColor: "#CCCCCC",
    borderRadius: 3,
    position: "absolute"
  }
});

const url =
  "http://data.50more.com/profile/search-location?locality_country=1&q=";
