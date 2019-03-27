/* @flow */
import React from 'react';
import { rest } from '@yssk22/utakata';
import { mui } from '@yssk22/kagayaki';
import { date } from '@yssk22/mizuki';
import { type TaskStatus, type Status } from '../../resources/Task';

type Props = {
  settings: rest.ResourceSettings<TaskStatus>,
  instance: TaskStatus
};

type State = {
  monitorId: ?IntervalID
};

const StatusToIconName = {
  success: 'success',
  failure: 'failure',
  running: 'running',
  unknown: 'unknown',
  timeout: 'unknown',
  ready: 'schedule'
};

class TaskListItem extends React.Component<rest.Props & Props, State> {
  settings: rest.ResourceSettings<TaskStatus>;
  state = {
    monitorId: null
  };

  constructor(props: rest.Props & Props) {
    super(props);
    this.settings = props.settings;
  }

  componentWillMount() {
    const { instance } = this.props;
    if (instance.status === 'running' || instance.status === 'ready') {
      const monitorId = setInterval(() => {
        rest.Action.getResources(this.settings, instance.id)
          .onSuccess(v => {
            if (v.status !== 'running' && v.status !== 'ready') {
              this.setState(oldState => {
                clearInterval(oldState.monitorId);
                return {
                  monitorId: null
                };
              });
            }
          })
          .run();
      }, 1000);
      this.setState({
        monitorId: monitorId
      });
    }
  }

  render() {
    const { instance } = this.props;
    return (
      <mui.TableRow>
        <mui.TableCell>{this._getIcon(instance.status)}</mui.TableCell>
        <mui.TableCell>{instance.id.substr(0, 6)}</mui.TableCell>
        <mui.TableCell>{date.toDateTimeString(instance.start_at)}</mui.TableCell>
        <mui.TableCell>{date.toDateTimeString(instance.finish_at)}</mui.TableCell>
        <mui.TableCell>{this._getParams(instance) + this._getNote(instance)}</mui.TableCell>
      </mui.TableRow>
    );
  }

  _getIcon(status: Status) {
    return <mui.Icon icon={StatusToIconName[status]} />;
  }

  _getParams(instance: TaskStatus) {
    if (instance.params) {
      return `(${instance.params}) `;
    }
    return '';
  }

  _getNote(instance: TaskStatus) {
    if (instance.status === 'failure') {
      return instance.error || 'unknown failure';
    }
    if (instance.status === 'running') {
      if (instance.progress) {
        return `${instance.progress.current}/${instance.progress.total} running`;
      }
      return 'running...';
    }
    return '';
  }
}

export default rest.withResources(TaskListItem);
