import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import FormGroup from "../UI/FormGroup";

const Internal = () => {
  return (
    <FormGroup title="Internal" description="">
      <>
        <TextField
          id="contents"
          label="Amount and composition of content"
          helperText="if any stuff was in the tank when it was flipped upside down"
          multiline
          fullWidth
          maxRows={4}
        />

        <TextField
          id="internal-surface"
          label="Description of internal surface"
          multiline
          fullWidth
          maxRows={4}
        />

        <TextField
          id="internal-pitting"
          label="Location and estimated depth of any pitting"
          multiline
          fullWidth
          maxRows={4}
        />

        <FormControl>
          <FormLabel id="manufacturer-standards-internal">
            Comparison to PSI Standards/Manufacturers
          </FormLabel>
          <RadioGroup
            aria-labelledby="manufacturer-standards-internal"
            defaultValue="acceptable"
            name="manufacturer-standards-internal"
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

export default Internal;
