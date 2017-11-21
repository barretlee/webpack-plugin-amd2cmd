import { Component, render, createElement } from 'rax';
import View from '@ali/tile-view';
import Text from '@ali/tile-text';
import styles from './index.css';

export default class App extends Component {

  componentWillMount() {
    Tida.Storage.setItem('a', 'a');
    Tida.Storage.setItem('a', 'b');
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>测试模块</Text>
        <Text>测试模块</Text>
      </View>
    )
  }

}