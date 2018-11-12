/* @flow */
import React from 'react';
import { View, Text } from 'react-native';
import { rest } from '@yssk22/utakata';
import { type AppContext, withAppContext, CollectionScrollView } from '@yssk22/kagayaki';

import { genConfigResourceSettings, type Config } from '../../resources/Config';

class Screen extends React.Component<AppContext> {
  settings: rest.ResourceSettings<Config>;
  constructor(props: AppContext) {
    super(props);
    this.settings = genConfigResourceSettings(props.appData.urlprefix);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <CollectionScrollView
          settings={this.settings}
          renderResource={(v: Config) => {
            return (
              <View key={v.key}>
                <Text>{v.key}</Text>
              </View>
            );
          }}
        />
      </View>
    );
  }
}

export default withAppContext(Screen);
