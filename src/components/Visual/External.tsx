import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import FormGroup from "../UI/FormGroup";

const External = () => {
  return (
    <FormGroup title="External" description="">
      <>
        <FormControl>
          <FormLabel id="heat-damage">Evidence of Heat Damage</FormLabel>
          <RadioGroup
            aria-labelledby="heat-damage"
            defaultValue="no"
            name="heat-damage"
            row
          >
            <FormControlLabel value="no" control={<Radio />} label="No" />
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="re-painting">Evidence of re-painting</FormLabel>
          <RadioGroup
            aria-labelledby="re-painting"
            defaultValue="no"
            name="re-painting"
            row
          >
            <FormControlLabel value="no" control={<Radio />} label="No" />
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="odor">Evidence of odor</FormLabel>
          <RadioGroup aria-labelledby="odor" defaultValue="no" name="odor" row>
            <FormControlLabel value="no" control={<Radio />} label="No" />
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="bow">Evidence of bow</FormLabel>
          <RadioGroup aria-labelledby="bow" defaultValue="no" name="bow" row>
            <FormControlLabel value="no" control={<Radio />} label="No" />
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="bulge">Evidence of bulges</FormLabel>
          <RadioGroup
            aria-labelledby="bulge"
            defaultValue="no"
            name="bulge"
            row
          >
            <FormControlLabel value="no" control={<Radio />} label="No" />
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="tone-test">
            Hammer tone test - bell like sound
          </FormLabel>
          <RadioGroup
            aria-labelledby="tone-test"
            defaultValue="no"
            name="tone-test"
            row
          >
            <FormControlLabel value="no" control={<Radio />} label="No" />
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          </RadioGroup>
          <FormHelperText>
            Make sure that the valve is removed first
          </FormHelperText>
        </FormControl>

        <TextField
          id="exterior-surface"
          label="Description of exterior surface"
          multiline
          fullWidth
          maxRows={4}
        />

        <TextField
          id="exterior-marks"
          label='Location and depth of marks, pits, gouges of more than 0.015"+'
          multiline
          fullWidth
          maxRows={4}
        />

        <FormControl>
          <FormLabel id="line-corrosion">
            Line corrosion around boot and others accessories
          </FormLabel>
          <RadioGroup
            aria-labelledby="line-corrosion"
            defaultValue="no"
            name="line-corrosion"
            row
          >
            <FormControlLabel value="no" control={<Radio />} label="No" />
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="manufacturer-standards-external">
            Comparison to PSI Standards/Manufacturers
          </FormLabel>
          <RadioGroup
            aria-labelledby="manufacturer-standards-external"
            defaultValue="acceptable"
            name="manufacturer-standards-external"
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

export default External;
