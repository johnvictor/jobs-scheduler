import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { action } from '@ember/object';

export default class AccordianComponent extends Component {
    @tracked isOpen = false;

    @action 
    onStateChange() {
        this.isOpen = !this.isOpen;
    }
}
