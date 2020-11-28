import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';

import { action } from '@ember/object';

import jobsScheduleConfig from '../../utils/jobs-schedule-config';

export default class JobsItemComponent extends Component {
    config = jobsScheduleConfig();
    @tracked errorMsg;
    @tracked noOfDaysToShiftAllJobs;

    get isFormValid() {
        this.errorMsg = '';
        if (this.daysToSkip.length === this.config.MAX_WEEK_DAYS) {
            this.errorMsg = 'No days available!';
            return false;
        }
        if(isNaN(this.noOfDaysToShiftAllJobs)) {
            this.errorMsg = 'Please enter a valid number!';
            return false;
        }
        return true;
    }

    get daysToSkip() {
        return this.args.weekDays.filter(day => day.isChecked).map(day => day.id);
    }

    @action
    moveAllJobs(noOfDaysToShiftAllJobs) {
        if(this.isFormValid) {
            const model = this.args.model;
            const jobsDetail = this.args.jobDetails;
            const newDateToShiftJobs = moment(jobsDetail.startOn).add(noOfDaysToShiftAllJobs, 'days');
            const jobsIndex = this.config.getJobsIndexOnDate(model, jobsDetail.startOn);
            const previousJobsScheldules = this.config.filterEmptyJobs(model.slice(0, jobsIndex));
            const futurejobSchedules = this.config.filterEmptyJobs(model.slice(jobsIndex));
            this.config.moveAllFutureJobsToNextValidDate(futurejobSchedules, newDateToShiftJobs, this.daysToSkip, previousJobsScheldules[previousJobsScheldules.length - 1]);
            model.clear();
            model.pushObjects([...previousJobsScheldules, ...futurejobSchedules]);
            this.noOfDaysToShiftAllJobs = '';
        }
    }
}
