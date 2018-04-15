import * as moment from "moment";

export const ageInWords = (dateStr: string): string => moment(dateStr).fromNow(true);
