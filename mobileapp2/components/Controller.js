import * as React from 'react';
import { Text, View, StyleSheet, Button, TextInput } from 'react-native';
import { Accelerometer } from 'expo';
 
export default class Controller extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "Init", accelerometerData: {},
            server :'192.168.15.153',
            speed :'60',
            turning: true,
            stop:true
        };
    }
    
    go(direction="stop") {
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
          console.log('res',res);
        } catch (error) {
          console.log('error',error);
        }
        
    }

    _timer = () => {
      Accelerometer.setUpdateInterval(300); 
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

    doStop() {
      if(this.state.stop) {
        this.setState({stop:false});
        this.go('back');
      }
      else {
        this.setState({stop:true});
        this.go('stop');
      }
    }

    notStop() {
      this.setState({stop:false});
    }

    leftOrRight(angle) {
      const turningValue = 30;
      const { turning } = this.state;
      const tA  = this._round(angle) * 100;
      if(!turning && (tA > turningValue)) {
        this.setState({turning:true});
        this.go('right');
      } else if(!turning && (tA < -turningValue)) {
        this.setState({turning:true});
        this.go('left');
      }else if(turning==true && ((tA < turningValue) && (tA > -turningValue))) {
        this.setState({turning:false});
        this.go('stop');
        this.setState({stop:true});
      }

    }
   
    componentDidMount() {
      this._timer();
      this._subscribe();
    }

  render() {
    let { x, y, z } = this.state.accelerometerData;
    
    return (
      <View >
        <View style={styles.container}>
          <View style={styles.controllsContainer} >
            <Text>
              {this.state.title}
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
              title="Stop"
              color="#841584"
            />
          </View>
          <View style={styles.controllsContainer} >
            <Text>Go</Text>
            <Button
              style={styles.controllbtn}
              onPress={this.go.bind(this, 'forward')}
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