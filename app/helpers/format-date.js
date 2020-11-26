import { helper } from '@ember/component/helper';

import moment from 'moment';

export default helper(function formatDate([value], {format}) {
  return moment(value).format(format);
});
