/* @flow */
import React, { type Node } from 'react';
import { View, Text, Button, type StyleProp, type ViewStyle } from 'react-native';

import ScrollView from './ScrollView';
import { rest } from '@yssk22/utakata';

const ErrorContainerStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
};

type Props<T> = {
  containerStyle: StyleProp<ViewStyle>,
  settings: rest.ResourceSettings<T>,
  errorText?: string,
  retryButtonText?: string,
  renderError?: Node,
  renderEmpty?: Node,
  renderResource: (v: T) => Node
};

class CollectionScrollView<T> extends React.Component<rest.Props & Props<T>> {
  constructor(props: rest.Props & Props<T>) {
    super(props);
  }

  componentWillMount() {
    rest.Action.getCollection(this.props.settings).run();
  }

  render() {
    const {
      settings,
      errorText,
      retryButtonText,
      renderError,
      renderEmpty,
      renderResource,
      ...otherProps
    } = this.props;
    const helper = new rest.Helper(settings, this.props.rest);
    const data = helper.getData();
    const refreshing = helper.isCollectionLoading();
    const onRefresh = () => {
      rest.Action.getCollection(this.props.settings).run();
    };
    const error = helper.getError();
    if (error !== null) {
      if (renderError) {
        return renderError;
      }
      return (
        <View style={ErrorContainerStyle}>
          <Text>{errorText || error}</Text>
          <Button
            title={retryButtonText || 'リトライ'}
            onPress={() => {
              rest.Action.getCollection(this.props.settings).run();
            }}
          />
        </View>
      );
    }
    if (data.length === 0) {
      if (renderEmpty) {
        return renderEmpty;
      }
    }

    return (
      <ScrollView
        containerStyle={this.props.containerStyle}
        data={data}
        refreshing={refreshing}
        onRefresh={onRefresh}
        childComponentFunc={renderResource}
        {...otherProps}
      />
    );
  }
}

export default rest.withResources(CollectionScrollView);
