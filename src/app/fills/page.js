"use client";

import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import dayjs from "dayjs";

import CylinderPicker from "@/components/CylinderPicker";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";

const gotCompressor = dayjs("2025-01-01T00:00:00.000");

export default function About() {
  const [error, setError] = React.useState(null);
  const [typeValue, setType] = React.useState("air");

  const [oxygenAmount, setOxygen] = React.useState("20.9");
  const [heliumAmount, setHelium] = React.useState("0");
  const [startPressure, setStartPressure] = React.useState("0");
  const [endPressure, setEndPressure] = React.useState("0");

  const [oxygenError, setOxygenError] = React.useState("");
  const [heliumError, setHeliumError] = React.useState("");

  const [startError, setStartError] = React.useState("");
  const [endError, setEndError] = React.useState("");

  oxygenError;

  const errorMessage = React.useMemo(() => {
    switch (error) {
      case "disableFuture": {
        return "Please select a date thats not in the future";
      }

      case "minDate": {
        return "Did not have the compressor yet";
      }

      case "invalidDate": {
        return "Your date is not valid";
      }

      default: {
        return "";
      }
    }
  }, [error]);

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

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
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Record a Tank Fill
        </Typography>

        <DatePicker
          label="Fill Date"
          name="date"
          defaultValue={dayjs()}
          minDate={gotCompressor}
          disableFuture
          onError={(newError) => setError(newError)}
          slotProps={{
            textField: {
              helperText: errorMessage,
            },
          }}
        />

        <FormControl>
          <FormLabel id="fill-type-group-label">Fill Type</FormLabel>
          <RadioGroup
            row
            aria-labelledby="fill-type-group-label"
            name="fill-type"
            defaultValue="air"
            value={typeValue}
            onChange={handleTypeChange}
          >
            <FormControlLabel value="air" control={<Radio />} label="Air" />
            <FormControlLabel
              value="nitrox"
              control={<Radio />}
              label="Nitrox"
            />
            <FormControlLabel
              value="trimix"
              control={<Radio />}
              label="Trimix"
            />
          </RadioGroup>
        </FormControl>

        <FormControl
          disabled={typeValue == "air"}
          error={oxygenError != ""}
          variant="standard"
        >
          <InputLabel htmlFor="oxygen">Oxygen %</InputLabel>
          <Input
            id="oxygen"
            value={oxygenAmount}
            onChange={(event) => {
              let value = event.target.value;
              setOxygen(value);

              if (isNaN(value)) {
                setOxygenError("Must be a number");
              } else if (value < 20.9 && typeValue != "trimix") {
                setOxygenError("Must not be hypoxic");
              } else if (value <= 0 || value > 100) {
                setOxygenError("Must be between 0 and 100%");
              } else {
                setOxygenError("");
              }
            }}
            aria-describedby="oxygen-text"
          />
          {oxygenError && (
            <FormHelperText id="oxygen-text">{oxygenError}</FormHelperText>
          )}
        </FormControl>

        <FormControl
          disabled={typeValue != "trimix"}
          error={heliumError != ""}
          variant="standard"
        >
          <InputLabel htmlFor="helium">Helium %</InputLabel>
          <Input
            id="helium"
            value={heliumAmount}
            onChange={(event) => {
              let value = event.target.value;

              setHelium(value);

              if (isNaN(value)) {
                setHeliumError("Must be a number");
              } else if (value <= 0 || value > 100) {
                setHeliumError("Must be between 0 and 100%");
              } else {
                setHeliumError("");
              }
            }}
            aria-describedby="helium-text"
          />
          {heliumError && (
            <FormHelperText id="helium-text">{heliumError}</FormHelperText>
          )}
        </FormControl>

        <FormControl error={startError != ""} variant="standard">
          <InputLabel htmlFor="start-pressure">Start Pressure</InputLabel>
          <Input
            id="start-pressure"
            value={startPressure}
            onChange={(event) => {
              let value = event.target.value;
              setStartPressure(value);

              if (isNaN(value)) {
                setStartError("Must be a number");
              } else if (value < 0) {
                setStartError("Must be above 0");
              } else {
                setStartError("");
              }
            }}
            aria-describedby="start-pressure-text"
          />
          {startError && (
            <FormHelperText id="start-pressure-text">
              {startError}
            </FormHelperText>
          )}
        </FormControl>

        <FormControl error={endError != ""} variant="standard">
          <InputLabel htmlFor="end-pressure">End Pressure</InputLabel>
          <Input
            id="end-pressure"
            value={endPressure}
            onChange={(event) => {
              let value = event.target.value;
              setEndPressure(value);

              if (isNaN(value)) {
                setEndError("Must be a number");
              } else if (value < 0) {
                setEndError("Must be above 0");
              } else if (value <= startPressure) {
                setEndError("Must be more than the start pressure");
              } else {
                setEndError("");
              }
            }}
            aria-describedby="end-pressure-text"
          />
          {endError && (
            <FormHelperText id="end-pressure-text">{endError}</FormHelperText>
          )}
        </FormControl>

        <CylinderPicker />
      </Box>
    </Container>
  );
}
