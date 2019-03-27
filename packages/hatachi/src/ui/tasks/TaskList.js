/* @flow */
import React from 'react';
import { rest } from '@yssk22/utakata';
import { mui, StyleSheet } from '@yssk22/kagayaki';
import { genTaskStatusResourceSettings, type Task, type TaskStatus } from '../../resources/Task';
import TaskListItem from './TaskListItem';

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
  task: Task
};

type State = {
  params: string
};

class TaskList extends React.Component<rest.Props & Props, State> {
  settings: rest.ResourceSettings<TaskStatus>;
  state = {
    params: ''
  };

  constructor(props: rest.Props & Props) {
    super(props);
    this.settings = genTaskStatusResourceSettings(props.task.path);
  }

  componentWillMount() {
    this._fetchTaskInstances();
  }

  render() {
    const { task } = this.props;
    const helper = new rest.Helper(this.settings, this.props.rest);
    const data = ((helper.getData(): any): Array<TaskStatus>);
    return (
      <mui.Card style={styles.container}>
        <mui.CardHeader title={task.path} subtitle={this.getSubtitle()} />
        <mui.CardContent>
          <mui.Table>
            <mui.TableHead>
              <mui.TableRow>
                <mui.TableCell>Status</mui.TableCell>
                <mui.TableCell>ID</mui.TableCell>
                <mui.TableCell>Start</mui.TableCell>
                <mui.TableCell>Finish</mui.TableCell>
                <mui.TableCell>Note</mui.TableCell>
              </mui.TableRow>
            </mui.TableHead>
            {this._renderTaskInstances(data)}
          </mui.Table>
        </mui.CardContent>
        <mui.CardActions>
          <mui.TextField
            value={this.state.params}
            fullWidth={true}
            onChange={v => {
              this.setState({
                params: v
              });
            }}
          />
          <mui.Button
            color="primary"
            onClick={() => {
              const id = rest.Action.createDraft(this.settings);
              rest.Action.saveDrafts(this.settings, id)
                .urlQuery(this.state.params)
                .onSuccess(() => {
                  setTimeout(() => this._fetchTaskInstances(), 1000);
                })
                .run();
              this.setState({ params: '' });
            }}
          >
            Submit
          </mui.Button>
        </mui.CardActions>
      </mui.Card>
    );
  }

  getSubtitle() {
    const { task } = this.props;
    if (task.schedule === '') {
      return task.description;
    }
    return `${task.description} (scheduled: "${task.schedule}")`;
  }

  _renderTaskInstances(data: Array<TaskStatus>) {
    if (data.length === 0) {
      return (
        <mui.TableBody>
          <mui.TableRow>
            <mui.TableCell colSpan={5}>No instances created.</mui.TableCell>
          </mui.TableRow>
        </mui.TableBody>
      );
    }
    return (
      <mui.TableBody>
        {data.map((v: TaskStatus) => (
          <TaskListItem settings={this.settings} instance={v} key={v.id} />
        ))}
      </mui.TableBody>
    );
  }

  _fetchTaskInstances() {
    rest.Action.getCollection(this.settings)
      .replaceCollection(true)
      .run();
  }
}

export default rest.withResources(TaskList);
