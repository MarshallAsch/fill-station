import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import MonthPicker from "../MonthPicker";
import FormGroup from "../UI/FormGroup";
import dayjs from "dayjs";

const TankInfo = () => {
  return (
    <FormGroup title="Tank Info" description="">
      <>
        <MonthPicker
          initialValue={dayjs()}
          name="firstHydro"
          label="First Hydro"
          helpText="The first hydro stamp on the cylinder"
        />

        <MonthPicker
          initialValue={dayjs()}
          name="lastHydro"
          label="Last Hydro"
          helpText="The most recent hydro stamp on the cylinder"
        />

        <MonthPicker
          initialValue={dayjs()}
          name="lastVis"
          label="Last Vis"
          helpText="The most recent Vis sticker on the cylinder"
        />
        <FormControl>
          <FormLabel id="material">Cylinder Material</FormLabel>
          <RadioGroup aria-labelledby="material" name="material" row>
            <FormControlLabel value="steel" control={<Radio />} label="Steel" />
            <FormControlLabel
              value="aluminum"
              control={<Radio />}
              label="Aluminum"
            />
            <FormControlLabel
              value="composite"
              control={<Radio />}
              label="Carbon Composite"
            />
          </RadioGroup>
        </FormControl>
      </>
    </FormGroup>
  );
};

export default TankInfo;
