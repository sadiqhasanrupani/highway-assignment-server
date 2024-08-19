import moment, { Moment } from "moment";

export class TimestampFormatter {
  date?: Moment;

  constructor(props?: { date?: Moment }) {
    if (props?.date) {
      this.date = props.date;
    }
  }

  formateDate(): string {
    return timestampFormatter(this.date || this.getCurrentDate());
  }

  getCurrentDate(): Moment {
    return moment(moment().format("YYYY-MM-DD HH:mm:ss.SSSSSS"), "YYYY-MM-DD HH:mm:ss.SSSSSS");
  }
}

function timestampFormatter(date: Moment): string {
  return date.format("YYYY-MM-DD HH:mm:ss.SSSSSS");
}
