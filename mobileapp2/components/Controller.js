import * as React from 'react';
import { Text, View, StyleSheet, Button, TextInput } from 'react-native';
import { Accelerometer } from 'expo';
 
const tForward= 'forward';
const tRight  = 'right';
const tLeft   = 'left';
const tStop   = 'stop';
const tBack   = 'back';
const tRotate   = 'rotate';
const sInit   = 'init';

export default class Controller extends React.Component {
  constructor(props) {
      super(props);
      this.lastCommand = tStop;
      this.state = {
          title: "Init", accelerometerData: {},
          server :'192.168.15.153',
          speed :'60',
          isOn:sInit,
          lastCommand:tStop,
          currentState:tStop
      };
  }
  
  // update the server and callBack trigger
  updateServer(direction=tStop, _callback=(()=>{})) {
    const { currentState, lastCommand, isOn } = this.state;
    console.log(`direction`, direction);
    // Current Command not equal to last command
    if(this.lastCommand!=direction) {
      // update the states
      this.lastCommand = direction;
      this.setState({title: direction})
      let url = `http://${this.state.server}`;
      try {
          fetch(url, {
            method: 'POST',
            headers: {
              Accept: 'application/html',
              'Content-Type': 'multipart/form-data',
            },
            body:`goto=${direction}`,
          }).then((res)=>{
            _callback({error:false, status:'ok', res:res});
          });
      } catch (error) {
        _callback({error:error});
        console.log('error',error);
      }
    }
    else {
      console.log(`last -> ${lastCommand}:  currnt -> ${currentState}`);
      _callback({error:'sameValue'});
    }
  }
  
  // check the permission to go 
  go(direction=tStop, _callback=(()=>{})) {
    const { isOn } = this.state;
    // App On button click
    if(isOn) {
      this.updateServer(direction, _callback);
    }
    // if Initial request send first request as stop the device
    else if(isOn==sInit) {
      this.setState({isOn:false, lastCommand:sInit});
      this.updateServer(direction, _callback);
    }
    // Inform app is not on
    else {
      this.setState({currentState:tStop, lastCommand:tStop});
      console.log('Sorry Device Offline isOn',isOn);
    }
  }

  // accelometer value geting interval set
  _timer = () => {
    Accelerometer.setUpdateInterval(100); 
  }

  // get data from accelometor
  _subscribe = () => {
    this._subscription = Accelerometer.addListener(accelerometerData => {
      // console.log('accelerometerData',accelerometerData);
      this.setState({ accelerometerData });
      this.leftOrRight(accelerometerData)
    });
  }

  // Round the numbers
  _round(n) {
    if (!n) {
      return 0;
    }  
    return Math.floor(n * 100);
  }

  _isRevers() {
    return (this.lastCommand==tBack);
  }

  _isTurning() {
    return (this.lastCommand==tLeft) || (this.lastCommand==tRight);
  }

  _isForwarding() {
    return this.lastCommand==tForward;
  }

  _isRotating() {
    return this.lastCommand==tRotate;
  }

  _isReady() {
    const { isOn } = this.state;
    return isOn==true?true:false;
  }

  // Stop last moving direction and send next direction
  _stopLastAction(_callback=(()=>{}), lcomand=tStop) {
    if(this.lastCommand!=tStop) {
      this.setState({currentState:tStop, lastCommand:lcomand});
      this.go(tStop, (res)=>{
        _callback(true);
      });
    }
    _callback(true)
  }

  // start to do 360 rotation
  doRotate() {
    if(this.lastCommand!=tRotate) {
      this._stopLastAction((res)=> {
        this.setState({currentState:tRotate});
        this.go(tRotate);
      });
    }
  }

  //App turn off
  doOnOff() {
    const { isOn } = this.state;
    this.setState({isOn:!isOn});
    this._stopLastAction();
  }

  // Reverse the device
  doRevers() {
    this.setState({ currentState: tBack, lastCommand:tStop });
    this.go(tBack)
  }
  
  // Stop the device or Go backward because both action done by same button
  doStop() {
    // if current state Stop go back
    if(this.lastCommand===tStop) 
      this.doRevers(); 
    // if currently in Moving stop the action
    else 
      this._stopLastAction();
  }
  
  // Go forward
  doForward() {
    // check currently in forwarding
    if(!this._isForwarding()) {
      if(this._isTurning()) {
        this.setState({currentState:tForward});
        this.go(tForward)
      }
      else {
        this._stopLastAction(()=> {
          this.setState({currentState:tForward});
          this.go(tForward)
        });      
      }
    } else {
      console.log('Already Forwarding');
    }
  }

  leftOrRight(accelerometerData) {
    const turningValue = 30;
    const tmpCommand = this._isForwarding()?tForward:(this._isRevers()?tBack:tStop);
    const angle = accelerometerData.y
    const tA  = this._round(angle);
    // Check currently turning is not Right and value should be more than expect value
    if((this.lastCommand!=tRight) && (tA > turningValue)) { // positive right
      this.setState({ currentState:tRight, lastCommand:tmpCommand });        
      this.go(tRight);
    }
    // Check currently turning is not left and value should be more than expect value
    else if((this.lastCommand!=tLeft) && (tA < -turningValue)){                   // negative left
      this.setState({ currentState:tLeft, lastCommand:tmpCommand });
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
    this.go();
    this._timer();
    this._subscribe();
  }

  render() {
    let { accelerometerData, currentState, lastCommand, isOn } = this.state;
    let { x, y, z } = accelerometerData;
    
    return (
      <View>
        <View style={styles.containerRow}>
          <View style={styles.displayView} >
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
            <Text>x: {this._round(x)}</Text>
            <Text>y: {this._round(y)}</Text>
            <Text>z: {this._round(z)}</Text>
          </View>
          <View style={styles.controllView} >
            <Text>Stop</Text>
            <Button
              style={styles.controllbtn}
              onPress={this.doOnOff.bind(this)}
              title={ this._isReady()?'To Off': 'To On' }
              color="#841584"
            />
          </View>
          <View style={styles.controllView} >
            <Text>Rotate</Text>
            <Button
              disabled={!this._isReady()}
              style={styles.controllbtn}
              onPress={this.doRotate.bind(this)}
              title="Rotate"
              color="#841584"
            />
          </View>
        </View>
        <View style={styles.containerRow}>
          <View style={styles.controllView} >
            <Text>Stop</Text>
            <Button
              disabled={!this._isReady()}
              style={styles.controllbtn}
              onPress={this.doStop.bind(this)}
              title={ currentState==tStop || this._isTurning() ?'Back': 'Stop' }
              color="#841584"
            />
          </View>
          <View style={styles.controllView} >
            <Text>Go</Text>
            <Button
              disabled={!this._isReady()}
              style={styles.controllbtn}
              onPress={this.doForward.bind(this)}
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
  containerRow: {
    height: 200, flexDirection: 'row',
    padding: 24,
  },
  displayView :{
    width: 30, flex:4, height: 160, backgroundColor: 'powderblue'
  },
  controllView :{
    width: 30, flex:4, height: 70, backgroundColor: 'powderblue'
  },
  controllbtn:{
    height: 250
  },
});