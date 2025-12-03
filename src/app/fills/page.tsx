"use client";

import React, { useMemo, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import dayjs from "dayjs";

import PersonPicker from "@/components/PersonPicker";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import Tooltip from "@mui/material/Tooltip";

import AddIcon from "@mui/icons-material/Add";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";

import FillTableRow from "@/components/FillTableRow";

import Stack from "@mui/material/Stack";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addNewFill, removeFill } from "@/redux/fills/fillsSlice";

const gotCompressor = dayjs("2025-01-01T00:00:00.000");

export default function About() {
  const { fills } = useAppSelector((state) => state);
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  const [personValue, setPerson] = useState(null);

  const errorMessage = useMemo(() => {
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

        <Stack direction="row" spacing={2}>
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
          <PersonPicker
            value={personValue}
            onChange={(value) => setPerson(value)}
          />
        </Stack>
        <TableContainer component={Paper}>
          <Table aria-label="new stock table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Cylinder</TableCell>
                <TableCell align="left">Fill Type</TableCell>
                <TableCell align="left">Contents</TableCell>
                <TableCell align="center">Start Pressure</TableCell>
                <TableCell align="center">End Pressure</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fills.map((item) => (
                <FillTableRow
                  key={item.id}
                  index={item.id}
                  item={item}
                  person={personValue}
                  onCancel={(index) => dispatch(removeFill(index))}
                />
              ))}
              <TableRow key={"add-stock"}>
                <TableCell align="center" colSpan={6}>
                  <Tooltip title={"Another Fill"}>
                    <IconButton
                      edge="end"
                      aria-label="Another Fill"
                      onClick={() => {
                        dispatch(addNewFill());
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}
