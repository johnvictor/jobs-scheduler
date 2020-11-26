import Route from '@ember/routing/route';
import jobsScheduleConfig from '../utils/jobs-schedule-config';

export default class JobsScheduleRoute extends Route {

    model() {
        return jobsScheduleConfig().jobsList;
    }
}
