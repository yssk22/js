/* @flow &*/
import React, { type Node } from 'react';
import { ScrollView, RefreshControl, type StyleProp, type ViewStyle } from 'react-native';

type Props<T> = {
  refreshing?: boolean,
  data: Array<T>,
  containerStyle?: StyleProp<ViewStyle>,
  onRefresh?: () => void,
  childComponentFunc: (v: T) => Node
};

const ScrollViewList = function<T>(props: Props<T>) {
  const data = props.data;
  const func = props.childComponentFunc;
  const refreshing = props.refreshing || false;
  return (
    <ScrollView
      contentContainerStyle={props.containerStyle}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={props.onRefresh} />}
    >
      {data.map(func)}
    </ScrollView>
  );
};

export default ScrollViewList;
