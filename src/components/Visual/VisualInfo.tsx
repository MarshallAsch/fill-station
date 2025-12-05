import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import FormGroup from "../UI/FormGroup";

const VisualInfo = () => {
  return (
    <FormGroup title="Vis Info" description="">
      <FormControl>
        <FormLabel id="valve-type">Valve Type</FormLabel>
        <RadioGroup
          aria-labelledby="valve-type"
          defaultValue="din"
          name="valve-type"
          row
        >
          <FormControlLabel value="din" control={<Radio />} label="Din" />
          <FormControlLabel
            value="k"
            control={<Radio />}
            label="K (standard Yoke)"
          />
          <FormControlLabel value="h" control={<Radio />} label="H" />
          <FormControlLabel value="none" control={<Radio />} label="None" />
        </RadioGroup>
      </FormControl>
    </FormGroup>
  );
};

export default VisualInfo;
