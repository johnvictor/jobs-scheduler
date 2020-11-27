import Controller from '@ember/controller';
import { action } from '@ember/object';
import { set } from '@ember/object';

import moment from 'moment';
import jobsScheduleConfig from '../utils/jobs-schedule-config';

const MAX_WEEK_DAYS = 7;

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
        if (this.daysToSkip.length === MAX_WEEK_DAYS) {
            this.set('errorMsg', 'No days available!');
            return false;
        }
        if(isNaN(this.noOfDaysToShift)) {
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
                this.model[jobsIndex].jobs.pushObject(this.jobName);
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
        let futurejobSchedules = this.config.filterEmptyJobs(this.model.slice(index));
        this.config.createJobsOnNewDate(previousJobsScheldules, moment(newDateToShiftJobs), this.jobName);
        this.model.clear();

        futurejobSchedules.forEach((jobs, index) => {
            let startOn;
            const previousJob = futurejobSchedules[index -1];

            if(previousJob && moment(jobs.startOn).isAfter(moment(previousJob.startOn))) {
                return;
            }

            if (previousJob && moment(jobs.startOn).isSameOrBefore(moment(previousJob.startOn))) {
                startOn = moment(previousJob.startOn);
                startOn.add(1, 'days');
                while(this.daysToSkip.indexOf(startOn.day()) !== -1) {
                    startOn.add(1, 'days');
                }
            } else {
                startOn = moment(newDateToShiftJobs);
                startOn.add(1, 'days');
                while(this.daysToSkip.indexOf(startOn.day()) !== -1) {
                    startOn.add(1, 'days');
                }
            }
            set(jobs, "startOn", startOn.toDate());
        });
        this.model.pushObjects([...previousJobsScheldules, ...futurejobSchedules]);
        this.config.sortJobsSchedule(this.model);
    }

}
