import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from "@mui/material";
import FormGroup from "../UI/FormGroup";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const FinalStatus = () => {
  return (
    <FormGroup title="Final Status" description="">
      <>
        <FormControl>
          <FormLabel id="status">Cylinder Status</FormLabel>
          <RadioGroup
            aria-labelledby="status"
            defaultValue="acceptable"
            name="status"
            row
          >
            <FormControlLabel
              value="acceptable"
              control={<Radio />}
              label="Acceptable"
            />
            <FormControlLabel
              value="marginal"
              control={<Radio />}
              label="Marginal"
            />
            <FormControlLabel
              value="reject"
              control={<Radio />}
              label="Reject"
            />
          </RadioGroup>
        </FormControl>

        <DatePicker
          label="Inspection Date"
          name="date"
          defaultValue={dayjs()}
          disableFuture
        />

        <FormControl>
          <FormLabel id="oxygen-cleaned">
            Valve and Tank cleaned for oxygen service
          </FormLabel>
          <RadioGroup
            aria-labelledby="oxygen-cleaned"
            defaultValue="no"
            name="oxygen-cleaned"
            row
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="oxygen-clean">
            Valve and Tank marked clean for oxygen service
          </FormLabel>
          <RadioGroup
            aria-labelledby="oxygen-clean"
            defaultValue="yes"
            name="oxygen-clean"
            row
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
          <FormHelperText>
            If the tank and valve were already clean or if they were cleaned as
            part of this Vis
          </FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="inspector">Inspector</InputLabel>
          <Select labelId="inspector" id="inspector" label="Inspector">
            <MenuItem value="marshall">Marshall Asch</MenuItem>
          </Select>
        </FormControl>
      </>
    </FormGroup>
  );
};

export default FinalStatus;
