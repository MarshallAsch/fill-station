import * as React from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";

import Stack from "@mui/material/Stack";

import { green } from "@mui/material/colors";
import FormControlLabel from "@mui/material/FormControlLabel";

import MonthPicker from "@/components/MonthPicker";

import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport"; // ES 2015

dayjs.extend(objectSupport);

const filter = createFilterOptions();

const Cylinders = [
  {
    serialNumber: "abcd-efg-hi",
    birthDate: dayjs({ month: 10, year: 2020 }),
    lastHydro: 2024,
    lastVis: 2023,
    oxygenClean: false,
  },
];

export default function CylinderPicker() {
  const [value, setValue] = React.useState(null);
  const [open, toggleOpen] = React.useState(false);

  const handleClose = () => {
    setDialogValue({
      serialNumber: "",
      birthDate: "",
      lastHydro: "",
      lastVis: "",
      oxygenClean: false,
    });
    toggleOpen(false);
  };

  const [dialogValue, setDialogValue] = React.useState({
    serialNumber: "",
    birthDate: "",
    lastHydro: "",
    lastVis: "",
    oxygenClean: false,
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log(dialogValue);

    setValue({
      serialNumber: dialogValue.serialNumber,
      birthDate: dialogValue.birthDate,
      lastHydro: dialogValue.lastHydro,
      lastVis: dialogValue.lastVis,
      oxygenClean: dialogValue.oxygenClean,
    });
    handleClose();
  };

  return (
    <React.Fragment>
      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            // timeout to avoid instant validation of the dialog's form.
            setTimeout(() => {
              toggleOpen(true);
              setDialogValue({
                serialNumber: newValue,
                birthDate: "",
                lastHydro: "",
                lastVis: "",
                oxygenClean: false,
              });
            });
          } else if (newValue && newValue.inputValue) {
            toggleOpen(true);
            setDialogValue({
              serialNumber: newValue.inputValue,
              birthDate: "",
              lastHydro: "",
              lastVis: "",
              oxygenClean: false,
            });
          } else {
            setValue(newValue);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          if (params.inputValue !== "") {
            filtered.push({
              inputValue: params.inputValue,
              serialNumber: `Add "${params.inputValue}"`,
            });
          }

          return filtered;
        }}
        id="free-solo-dialog-demo"
        options={Cylinders}
        getOptionLabel={(option) => {
          // for example value selected with enter, right from the input
          if (typeof option === "string") {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }
          return option.serialNumber;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              {option.serialNumber}
            </li>
          );
        }}
        sx={{ width: 300 }}
        freeSolo
        renderInput={(params) => (
          <TextField {...params} label="Select a cylinder" />
        )}
      />
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>New Cylinder</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Add the new cylinders information to save it for next time.
            </DialogContentText>
            <Stack spacing={2}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                value={dialogValue.serialNumber}
                onChange={(event) =>
                  setDialogValue({
                    ...dialogValue,
                    serialNumber: event.target.value,
                  })
                }
                label="Serial Number"
                type="text"
                variant="standard"
              />

              <Stack direction="row" spacing={2}>
                <MonthPicker
                  label="First Hydro"
                  helpText="The first hydro stamp on the cylinder"
                  initialValue={dialogValue.birthDate}
                  onChange={(value) =>
                    setDialogValue({
                      ...dialogValue,
                      birthDate: value,
                    })
                  }
                />

                <MonthPicker
                  label="Last Hydro"
                  helpText="The most recent hydro stamp on the cylinder"
                  initialValue={dialogValue.lastHydro}
                  onChange={(value) =>
                    setDialogValue({
                      ...dialogValue,
                      lastHydro: value,
                    })
                  }
                />
              </Stack>

              <MonthPicker
                label="Last Vis"
                helpText="The most recent Vis sticker on the cylinder"
                initialValue={dialogValue.lastVis}
                onChange={(value) =>
                  setDialogValue({
                    ...dialogValue,
                    lastVis: value,
                  })
                }
              />

              <FormControlLabel
                label="Tank and valve have been cleaned for oxygen service to 100%"
                labelPlacement="end"
                control={
                  <Checkbox
                    checked={dialogValue.oxygenClean}
                    onChange={(event) =>
                      setDialogValue({
                        ...dialogValue,
                        oxygenClean: event.target.checked,
                      })
                    }
                    sx={{
                      color: green[800],
                      "&.Mui-checked": {
                        color: green[600],
                      },
                    }}
                  />
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </React.Fragment>
  );
}
