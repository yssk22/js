/* @flow */
import React from 'react';
import { View } from 'react-native';
import { rest } from '@yssk22/utakata';
import { mui, StyleSheet } from '@yssk22/kagayaki';
import { type Config } from '../../resources/Config';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row-reverse'
  },
  text: {
    flexGrow: 1
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column'
  }
});

type Props = {
  settings: rest.ResourceSettings<Config>,
  config: Config
};

type State = {
  edit: boolean
};

class ConfigItem extends React.Component<Props, State> {
  state = {
    edit: false
  };
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { settings, config } = this.props;
    const readOnly = !this.state.edit;
    const icon = readOnly ? 'edit' : 'save';
    return (
      <mui.ListItem style={styles.container}>
        <View style={styles.buttons}>
          {!readOnly && (
            <mui.IconButton
              icon="cancel"
              onClick={() =>
                this.setState(state => {
                  return {
                    edit: !state.edit
                  };
                })
              }
            />
          )}
          <mui.IconButton
            icon={icon}
            onClick={() => {
              if (!readOnly) {
                rest.Action.saveResources(settings, config.key)
                  .onSuccess(() => {
                    this.setState(state => {
                      return {
                        edit: !state.edit
                      };
                    });
                  })
                  .run();
              } else {
                this.setState(state => {
                  return {
                    edit: !state.edit
                  };
                });
              }
            }}
          />
        </View>
        <View style={styles.text}>
          <mui.TextField
            label={config.key}
            value={config.value}
            helperText={config.description}
            fullWidth
            readOnly={readOnly}
            margin="normal"
            variant="outlined"
            onChange={vv => {
              rest.Action.updateResources(settings, {
                id: config.key,
                fields: {
                  value: {
                    value: vv
                  }
                }
              });
            }}
          />
        </View>
      </mui.ListItem>
    );
  }
}

export default ConfigItem;
