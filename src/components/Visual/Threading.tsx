import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import FormGroup from "../UI/FormGroup";
import NumberField from "../NumberField";

const Threading = () => {
  return (
    <FormGroup title="Threading" description="">
      <>
        <TextField id="thread-description" label="Description" />

        <NumberField
          id="damagedThreads"
          name="damagedThreads"
          min={0}
          max={20}
          helperText="How many damaged threads are visible?"
        />

        <TextField id="oring-surface" label="O-ring Surface" />

        <FormControl>
          <FormLabel id="manufacturer-standards-threads">
            Comparison to PSI Standards/Manufacturers
          </FormLabel>
          <RadioGroup
            aria-labelledby="manufacturer-standards-threads"
            defaultValue="acceptable"
            name="manufacturer-standards-threads"
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
              value="condemn"
              control={<Radio />}
              label="Condemn"
            />
          </RadioGroup>
        </FormControl>
      </>
    </FormGroup>
  );
};

export default Threading;
