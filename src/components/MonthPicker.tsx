import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport"; // ES 2015
import { useState } from "react";

dayjs.extend(objectSupport);

type Props = {
  label: string;
  name: string;
  helpText: string;
  initialValue: dayjs.Dayjs | null;
  onChange?: (val: dayjs.Dayjs) => void;
};

export default function MonthPicker({
  label,
  name,
  helpText,
  initialValue,
  onChange = (_) => {},
}: Props) {
  const [value, setValue] = useState(initialValue);

  return (
    <DatePicker
      label={label}
      name={name}
      value={value || null}
      onAccept={(value) => {
        setValue(dayjs(value));
        onChange(dayjs(value));
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
