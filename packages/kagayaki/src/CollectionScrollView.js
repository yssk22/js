/* @flow */
import React from 'react';
import { View, Text, Button } from 'react-native';
import ScrollView from './ScrollView';
import { rest } from '@yssk22/utakata';

const ErrorContainerStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
};

type Props<T> = {
  settings: rest.ResourceSettings<T>,
  errorText: ?string,
  retryButtonText: ?string,
  renderResource: (v: T) => Node
};

class RestRefreshableScrollViewList<T> extends React.Component<rest.Props & Props<T>> {
  constructor(props: rest.Props & Props<T>) {
    super(props);
  }

  componentWillMount() {
    rest.Action.getCollection(this.props.settings).run();
  }

  render() {
    const { settings, errorText, retryButtonText, renderResource, ...otherProps } = this.props;
    const helper = new rest.Helper(settings, this.props.rest);
    const data = helper.getData();
    const refreshing = helper.isCollectionLoading();
    const onRefresh = () => {
      rest.Action.getCollection(this.props.settings).run();
    };
    const error = helper.getError();
    if (error !== null) {
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
    return (
      <ScrollView
        data={data}
        refreshing={refreshing}
        onRefresh={onRefresh}
        childComponentFunc={renderResource}
        {...otherProps}
      />
    );
  }
}

export default rest.withResources(RestRefreshableScrollViewList);
