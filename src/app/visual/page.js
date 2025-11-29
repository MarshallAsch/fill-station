"use client";

import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import TextField from "@mui/material/TextField";

import dayjs from "dayjs";

import CylinderPicker from "@/components/CylinderPicker";
import NumberField from "@/components/NumberField";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import MonthPicker from "@/components/MonthPicker";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";

export default function About() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
          Record a Tank Vis
        </Typography>

        <CylinderPicker />

        <Typography variant="h4" component="h4" sx={{ mb: 2 }}>
          Tank Info
        </Typography>

        <MonthPicker
          label="First Hydro"
          helpText="The first hydro stamp on the cylinder"
        />

        <MonthPicker
          label="Last Hydro"
          helpText="The most recent hydro stamp on the cylinder"
        />

        <MonthPicker
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

        <Typography variant="h4" component="h4" sx={{ mb: 2 }}>
          Vis Info
        </Typography>

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

        <Typography variant="h5" component="h4" sx={{ mb: 2 }}>
          External
        </Typography>

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

        <Typography variant="h5" component="h4" sx={{ mb: 2 }}>
          Internal
        </Typography>

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

        <Typography variant="h5" component="h4" sx={{ mb: 2 }}>
          Threading
        </Typography>

        <TextField id="thread-description" label="Description" />

        <NumberField
          label="Number of damaged threads"
          min={0}
          max={20}
          size="small"
          defaultValue={0}
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

        <Typography variant="h5" component="h4" sx={{ mb: 2 }}>
          Valve
        </Typography>

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

        <Typography variant="h5" component="h4" sx={{ mb: 2 }}>
          Final Status
        </Typography>

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
      </Box>
    </Container>
  );
}
