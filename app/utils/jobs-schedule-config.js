import moment from "moment";
import { set } from "@ember/object";

export default function jobsScheduleConfig() {
  const weekDays = [
    { id: 0, day: "Sunday", isChecked: true, isDisabled: true },
    { id: 1, day: "Monday", isChecked: false },
    { id: 2, day: "Tuesday", isChecked: false },
    { id: 3, day: "Wednesday", isChecked: false },
    { id: 4, day: "Thurdays", isChecked: false },
    { id: 5, day: "Friday", isChecked: false },
    { id: 6, day: "Saturday", isChecked: true, isDisabled: true },
  ];

  const dateFormat = "DD MMM YYYY";
  const dayFormat = "ddd";
  const MAX_WEEK_DAYS = 7;

  const jobsList = [
    {
      startOn: "2020-09-01",
      jobs: ["Job 1", "Job 2", "job 3", "Job 4", "Job 5"],
    },
    {
      startOn: "2020-09-02",
      jobs: ["Job 6", "Job 7", "job 8", "Job 9", "Job 10"],
    },
    {
      startOn: "2020-09-03",
      jobs: [],
    },
    {
      startOn: "2020-09-04",
      jobs: [],
    },
    {
      startOn: "2020-09-05",
      jobs: ["Job 11", "Job 12"],
    },
  ];

  const sortJobsSchedule = (model) => {
    model.sort(function (a, b) {
      const aStartOn = moment(a.startOn),
        bStartOn = moment(b.startOn);
      if (aStartOn !== bStartOn) {
        return aStartOn - bStartOn;
      }
    });
  };

  const createJobsOnNewDate = (model, date, job) => {
    model.pushObject({
      startOn: date,
      jobs: [job],
    });
  };

  const filterEmptyJobs = (jobsSchedule) => {
    return jobsSchedule.filter((jobs) => jobs.jobs.length);
  };

  const getJobsIndexOnDate = (model, date) => {
    return model.findIndex((job) => moment(job.startOn).isSame(date));
  };

  const moveAllFutureJobsToNextValidDate = (
    futurejobSchedules,
    newDateToShiftJobs,
    daysToSkip,
    lastPastJobs
  ) => {
    futurejobSchedules.forEach((jobs, index) => {
      let startOn;
      const previousJob = futurejobSchedules[index - 1] || lastPastJobs;

      if (
        previousJob &&
        moment(jobs.startOn).isAfter(moment(previousJob.startOn))
      ) {
        return;
      }

      if (
        previousJob &&
        moment(jobs.startOn).isSameOrBefore(moment(previousJob.startOn))
      ) {
        startOn = moment(previousJob.startOn);
        startOn.add(1, "days");
        while (daysToSkip.indexOf(startOn.day()) !== -1) {
          startOn.add(1, "days");
        }
      } else {
        startOn = moment(newDateToShiftJobs);
        while (daysToSkip.indexOf(startOn.day()) !== -1) {
          startOn.add(1, "days");
        }
      }
      set(jobs, "startOn", startOn.toDate());
    });
  };

  return {
    weekDays,
    jobsList,
    dateFormat,
    dayFormat,
    sortJobsSchedule,
    createJobsOnNewDate,
    filterEmptyJobs,
    getJobsIndexOnDate,
    moveAllFutureJobsToNextValidDate,
    MAX_WEEK_DAYS
  };
}
