import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import FormGroup from "../UI/FormGroup";

const Valve = () => {
  return (
    <FormGroup title="Valve" description="">
      <>
        <FormControl>
          <FormLabel id="bust-disk">Burst Disk replaced</FormLabel>
          <RadioGroup
            aria-labelledby="bust-disk"
            defaultValue="no"
            name="bust-disk"
            row
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="oring">O-Ring replaced</FormLabel>
          <RadioGroup
            aria-labelledby="oring"
            defaultValue="yes"
            name="oring"
            row
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="dip-tube">Has Dip Tube</FormLabel>
          <RadioGroup
            aria-labelledby="dip-tube"
            defaultValue="yes"
            name="dip-tube"
            row
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="needs-service">Service Needed</FormLabel>
          <RadioGroup
            aria-labelledby="needs-service"
            defaultValue="no"
            name="needs-service"
            row
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="rebuilt">Valve Rebuilt</FormLabel>
          <RadioGroup
            aria-labelledby="rebuilt"
            defaultValue="no"
            name="rebuilt"
            row
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      </>
    </FormGroup>
  );
};

export default Valve;
