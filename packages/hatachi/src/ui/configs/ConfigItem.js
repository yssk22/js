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
    marginTop: 10
  },
  text: {
    // flexDirection: 'column'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row-reverse'
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

  render() {
    const { settings, config } = this.props;
    const disabled = !this.state.edit;
    const icon = disabled ? 'edit' : 'save';
    return (
      <mui.ListItem style={styles.container}>
        <mui.TextField
          label={config.key}
          value={config.value}
          helperText={config.description}
          placeholder={'(not set)'}
          disabled={disabled}
          shrink
          fullWidth
          margin="normal"
          endAdornment={
            <View style={styles.buttons}>
              {!disabled && (
                <mui.IconButton
                  icon="cancel"
                  onClick={() => {
                    this.setState(state => {
                      return {
                        edit: !state.edit
                      };
                    });
                    rest.Action.revertResources(settings, config.key);
                  }}
                />
              )}
              <mui.IconButton
                icon={icon}
                onClick={() => {
                  if (!disabled) {
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
          }
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
        {/* </View> */}
      </mui.ListItem>
    );
  }
}

export default ConfigItem;
