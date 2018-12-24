import * as React from 'react';
import { Text, View, StyleSheet, Button, TextInput } from 'react-native';
import { Accelerometer } from 'expo';
 
const tForward= 'forward';
const tRight  = 'right';
const tLeft   = 'left';
const tStop   = 'stop';
const tBack   = 'back';

export default class Controller extends React.Component {
  constructor(props) {
      super(props);
      this.lastCommand = tStop;
      this.state = {
          title: "Init", accelerometerData: {},
          server :'192.168.15.153',
          speed :'60',
          lastCommand:tStop,
          currentState:tStop
      };
  }
    
  go(direction=tStop) {
    const { currentState, lastCommand } = this.state;
    console.log(`direction`, direction);
    if(this.lastCommand!=direction) {
      this.lastCommand = direction;
      this.setState({title: direction})
      let url = `http://${this.state.server}`;
      try {
        const res = fetch(url, {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'multipart/form-data',
                    },
                    body:`goto=${direction}`,
                  });
      } catch (error) {
        console.log('error',error);
      }
    }
    else {
      console.log(`last -> ${lastCommand}:  currnt -> ${currentState}`);
    }
  }

    _timer = () => {
      Accelerometer.setUpdateInterval(100); 
    }

    _subscribe = () => {
      this._subscription = Accelerometer.addListener(accelerometerData => {
        // console.log('accelerometerData',accelerometerData);
        this.setState({ accelerometerData });
        this.leftOrRight(accelerometerData.y)
      });
    }
    _round(n) {
      if (!n) {
        return 0;
      }
    
      return Math.floor(n * 100) / 100;
    }

    _isTurning() {
      return (this.lastCommand == tLeft) || (this.lastCommand == tRight);
    }

    _isForwarding() {
      return (this.lastCommand==tForward)?tForward:tStop;
    }

    doStop() {
      const { currentState } = this.state;
      // if stop go back
      if(currentState===tStop) {
        this.setState({ currentState: tBack, lastCommand:tStop });
        this.go(tBack)
      }
      else {
        this.setState({ currentState:tStop, lastCommand:tStop });
        this.go(tStop)
      }
    }
    
    forward() {
      this.setState({currentState:tForward, lastCommand:tStop});
      this.go(tForward)
    }
    leftOrRight(angle) {
      const turningValue = 30;
      const tA  = this._round(angle) * 100;
      // Check currently trunign right
      if((this.lastCommand!=tRight) && (tA > turningValue)) { // positive right
        this.setState({ currentState:tRight, lastCommand:this._isForwarding()});        
        this.go(tRight);
      }
      // Check current turn is not left
      else if((this.lastCommand!=tLeft) && (tA < -turningValue)){                   // negative left
        this.setState({ currentState:tLeft, lastCommand:this._isForwarding()});
        this.go(tLeft);
      }
      else {
        if((tA < turningValue) && (tA > -turningValue) && this._isTurning()) {
          const nextCommand = this.state.lastCommand;
          this.setState({ currentState:nextCommand, lastCommand:tStop});
          this.go(nextCommand);
        }
      }
    }
   
    componentDidMount() {
      this._timer();
      this._subscribe();
    }

  render() {
    let { accelerometerData, currentState, lastCommand } = this.state;
    let { x, y, z } = accelerometerData;
    
    return (
      <View >
        <View style={styles.container}>
          <View style={styles.controllsContainer} >
            <Text>
              {currentState}
            </Text>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              defaultValue={this.state.server}
              onChangeText={(server) => this.setState({server})}
              value={this.state.server}
            />
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              defaultValue={this.state.speed}
              onChangeText={(speed) => this.setState({speed})}
              value={this.state.speed}
            />
            <Text>x: {round(x)}</Text>
            <Text>y: {round(y)}</Text>
            <Text>z: {round(z)}</Text>
          </View>
        </View>
        <View style={styles.container}>
          <View style={styles.controllsContainer} >
            <Text>Stop</Text>
            <Button
              style={styles.controllbtn}
              onPress={this.doStop.bind(this)}
              title={ currentState==tStop || this._isTurning() ?'Back': 'Stop' }
              color="#841584"
            />
          </View>
          <View style={styles.controllsContainer} >
            <Text>Go</Text>
            <Button
              style={styles.controllbtn}
              onPress={this.forward.bind(this)}
              title="Go"
              color="#841584"
            />
          </View>
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



function round(n) {
  if (!n) {
    return 0;
  }

  return Math.floor(n * 100) / 100;
}