import Component from '@glimmer/component';

import jobsScheduleConfig from '../../utils/jobs-schedule-config';

export default class JobsItemComponent extends Component {
    config = jobsScheduleConfig();
}
