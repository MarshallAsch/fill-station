import * as React from "react";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport"; // ES 2015

dayjs.extend(objectSupport);

export default function MonthPicker(props) {
  let { label, helpText, initialValue, onChange = (_) => {} } = props;

  const [value, setValue] = React.useState(initialValue);

  return (
    <DatePicker
      label={label}
      name="birth"
      value={value || null}
      onAccept={(value) => {
        setValue(value);
        onChange(value);
      }}
      views={["month", "year"]}
      yearsOrder="desc"
      disableFuture
      slotProps={{
        textField: {
          helperText: helpText,
        },
      }}
    />
  );
}
