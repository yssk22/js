/* @flow */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { rest } from '@yssk22/utakata';
import { mui } from '@yssk22/kagayaki';
import { type AppContext, withAppContext, CollectionScrollView } from '@yssk22/kagayaki';
import { genTaskResourceSettings, type Task } from '../../resources/Task';
import TaskList from './TaskList';

const styles = StyleSheet.create({
  root: {
    maxWidth: 950,
    paddingLeft: 10,
    paddingRight: 10,
    margin: 'auto'
  },
  collection: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }
});

class Screen extends React.Component<AppContext> {
  settings: rest.ResourceSettings<Task>;
  constructor(props: AppContext) {
    super(props);
    this.settings = genTaskResourceSettings(props.appData.urlprefix);
  }

  render() {
    return (
      <View style={styles.root}>
        <mui.AppBar title={'Tasks: ' + this.props.appData.urlprefix} position="static" />
        <CollectionScrollView
          containerStyle={styles.collection}
          settings={this.settings}
          renderResource={(v: Task) => <TaskList key={v.path} task={v} />}
        />
      </View>
    );
  }
}

export default withAppContext(Screen);
