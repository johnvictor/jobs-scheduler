import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { action } from '@ember/object';

export default class JobsListJobsItemJobActionComponent extends Component {
    @tracked isEdit = false;
    noOfDaysToShift;

    @action
    toggleEdit(shiftDays) {
        this.isEdit = !this.isEdit;

        if(shiftDays) {
            this.noOfDaysToShift = this.noOfDaysToShift ? this.noOfDaysToShift.trim() : '';
            this.args.shiftDays(this.args, this.noOfDaysToShift);
        }
    }
}
