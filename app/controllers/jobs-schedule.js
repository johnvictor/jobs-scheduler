import Controller from '@ember/controller';
import { action } from '@ember/object';

import moment from 'moment';
import jobsScheduleConfig from '../utils/jobs-schedule-config';

export default class JobsScheduleController extends Controller {
    config = jobsScheduleConfig();
    weekDays = this.config.weekDays;
    jobDetails;
    noOfDaysToShift;
    jobName;
    dateShiftRequired = false;
    previousJob;
    errorMsg;

    @action 
    shiftDays(args, noOfDaysToShift) {
        this.dateShiftRequired = false;
        this.jobName = args.name;
        this.jobDetails = args.jobDetails;
        this.noOfDaysToShift = noOfDaysToShift;
        if(!this.isFormValid) {
            return;
        }
        this.removeJobFromCurrentDate();
        const newDateToShiftJobs = moment(this.jobDetails.startOn).add(this.noOfDaysToShift, 'days');
        this.validateDateAndArrangeSchedule(newDateToShiftJobs);
    }

    @action 
    onDayChange() {
        this.set('errorMsg', '');
    }

    get isFormValid() {
        this.set('errorMsg', '');
        if (this.daysToSkip.length === this.config.MAX_WEEK_DAYS) {
            this.set('errorMsg', 'No days available!');
            return false;
        }
        if(isNaN(this.noOfDaysToShift) || this.noOfDaysToShift === '') {
            this.set('errorMsg', 'Please enter a valid number!');
            return false;
        }
        return true;
    }

    get daysToSkip() {
        return this.weekDays.filter(day => day.isChecked).map(day => day.id);
    }

    removeJobFromCurrentDate() {
        const index = this.jobDetails.jobs.indexOf(this.jobName);
        const currentJobModel = this.model.find(job => job.startOn === this.jobDetails.startOn)
        currentJobModel.jobs.removeAt(index);
    }

    validateDateAndArrangeSchedule(newDateToShiftJobs) {
        if (this.daysToSkip.indexOf(newDateToShiftJobs.day()) === -1) {
            this.addJobToDate(newDateToShiftJobs);
            return;
        } else {
            this.dateShiftRequired = true;
            newDateToShiftJobs.add(1, 'days');
            this.validateDateAndArrangeSchedule(newDateToShiftJobs);
        }
    }

    addJobToDate(newDateToShiftJobs) {
        const jobsIndex = this.config.getJobsIndexOnDate(this.model, newDateToShiftJobs);

        if(jobsIndex !== -1) {
            if(this.dateShiftRequired) {
                this.shiftTheSchedule(jobsIndex, newDateToShiftJobs);
            } else {
                this.model[jobsIndex].jobs.unshiftObject(this.jobName);
                this.config.sortJobsSchedule(this.model);
            }
        } else {
            this.config.createJobsOnNewDate(this.model, newDateToShiftJobs, this.jobName);
            this.config.sortJobsSchedule(this.model);
        }
    }

    //if dates overlaps, shift the schedule by one or valid date
    shiftTheSchedule(index, newDateToShiftJobs) {
        const previousJobsScheldules = this.config.filterEmptyJobs(this.model.slice(0, index));
        const futurejobSchedules = this.config.filterEmptyJobs(this.model.slice(index));

        futurejobSchedules.unshiftObject({
            startOn: moment(newDateToShiftJobs),
            jobs: [this.jobName]
        });

        this.model.clear();

        this.config.moveAllJobsToNextValidDate(futurejobSchedules, this.daysToSkip);
        this.model.pushObjects([...previousJobsScheldules, ...futurejobSchedules]);
        this.config.sortJobsSchedule(this.model);
    }

}
