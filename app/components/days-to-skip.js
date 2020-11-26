import Component from '@glimmer/component';

import { action, set } from '@ember/object';

export default class DaysToSkipComponent extends Component {

    @action
    skipDaysChange(day, event) {
        set(day, 'isChecked', event.target.checked);
        this.args.onDayChange();
    }
}
