/* @flow */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { rest } from '@yssk22/utakata';
import { mui } from '@yssk22/kagayaki';
import { type AppContext, withAppContext, CollectionScrollView } from '@yssk22/kagayaki';
import { genConfigResourceSettings, type Config } from '../../resources/Config';
import ConfigItem from './ConfigItem';

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
  settings: rest.ResourceSettings<Config>;
  constructor(props: AppContext) {
    super(props);
    this.settings = genConfigResourceSettings(props.appData.urlprefix);
  }

  render() {
    console.log(this.props.appData);
    return (
      <View style={styles.root}>
        <mui.AppBar title={'Config: ' + this.props.appData.urlprefix} position="static" />
        <CollectionScrollView
          containerStyle={styles.collection}
          settings={this.settings}
          renderResource={(v: Config) => (
            <ConfigItem key={v.key} settings={this.settings} config={v} />
          )}
        />
      </View>
    );
  }
}

export default withAppContext(Screen);
