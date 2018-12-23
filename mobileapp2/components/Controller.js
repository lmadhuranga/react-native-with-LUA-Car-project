import * as React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';

export default class Controller extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "Init"
        };
    }
    go(dir="para init") {
        this.setState({title:"ck"})
    }

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.title}</Text>
        <View style={styles.controllsContainer} >
          <Text>Stop</Text>
          <Button
            style={styles.controllbtn}
            onPress={this.go.bind(this, 'Stop')}
            title="Stop"
            color="#841584"
          />
        </View>
        <View style={styles.controllsContainer} >
          <Text>Go</Text>
          <Button
            style={styles.controllbtn}
            onPress={this.go.bind(this, 'Go')}
            title="Go"
            color="#841584"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  controllsContainer :{
    width: 50, flex:4, height: 150, backgroundColor: 'powderblue'
  },
  controllbtn:{
    height: 450
  },
  container: {
    height: 200, flexDirection: 'row',
    padding: 24,
  }
});
