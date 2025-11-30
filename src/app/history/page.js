"use client";

import * as React from "react";

import Container from "@mui/material/Container";

import { red } from "@mui/material/colors";

import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import dayjs from "dayjs";
import Tooltip from "@mui/material/Tooltip";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DangerousRoundedIcon from "@mui/icons-material/DangerousRounded";

const fillColumns = [
  {
    id: "date",
    label: "Date",
    minWidth: 100,
    align: "right",
    format: (value) => value.format("DD/MM/YYYY"),
    tooltip: (value) => value.format("MMMM DD, YYYY"),
  },
  { id: "name", label: "Name", minWidth: 100 },
  {
    id: "o2",
    label: "Mix",
    minWidth: 170,
    align: "right",
    format: (value, row) => {
      let o2 = row.o2.toFixed(1);
      let he = row.he.toFixed(1);

      if (he == 0.0) {
        return o2;
      } else {
        return `${o2}/${he}`;
      }
    },
  },
  {
    id: "start",
    label: "Fill",
    minWidth: 200,
    align: "left",
    format: (value, row) => `${row.start} psi -> ${row.end} psi`,
  },
  {
    id: "cylinder",
    label: "Cylinder",
    minWidth: 100,
    align: "left",
  },
];

const visColumns = [
  {
    id: "date",
    label: "Date",
    minWidth: 100,
    align: "right",
    format: (value) => value.format("DD/MM/YYYY"),
    tooltip: (value) => value.format("MMMM DD, YYYY"),
  },
  {
    id: "cylinder",
    label: "Cylinder",
    minWidth: 100,
    align: "left",
  },
  {
    id: "pass",
    label: "Passed",
    align: "right",
    format: (value) =>
      value ? (
        <CheckCircleRoundedIcon color="success" />
      ) : (
        <DangerousRoundedIcon sx={{ color: red[500] }} />
      ),
    tooltip: (value) => (value ? "Pass" : "Fail"),
  },
  {
    id: "o2Clean",
    label: "Oxygen Clean",
    align: "right",
    format: (value) => value && <CheckCircleRoundedIcon color="success" />,
    tooltip: (value) =>
      value ? "Cleaned for Oxygen Service" : "Not Clean for Oxygen Service",
  },
];

function createData(id, name, date, start, end, o2, he, cylinder) {
  return { id, name, date, start, end, o2, he, cylinder };
}

const fillRows = [
  createData(
    1,
    "Marshall Asch",
    dayjs("2025-10-01T00:00:00.000"),
    500,
    3400,
    20.9,
    0,
    "abcd-efg-hij",
  ),
  createData(
    2,
    "Bob Marley",
    dayjs("2023-11-10T00:00:00.000"),
    0,
    3000,
    18.0,
    42,
    "abcd-efg-hij",
  ),
];

const visRows = [
  {
    id: 1,
    date: dayjs("2025-10-01T00:00:00.000"),
    cylinder: "abcd-efg-hij",
    pass: true,
    o2Clean: true,
  },
  {
    id: 2,
    date: dayjs("2025-10-01T10:00:00.000"),
    cylinder: "hih-klm-nop",
    pass: true,
    o2Clean: false,
  },
  {
    id: 3,
    date: dayjs("2022-10-01T10:00:00.000"),
    cylinder: "hih-klm-nop",
    pass: false,
    o2Clean: false,
  },
];

function FillHistory(props) {
  const { children, value, index, ...other } = props;

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {fillColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fillRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {fillColumns.map((column) => {
                      const value = row[column.id];

                      if (column.tooltip) {
                        return (
                          <Tooltip
                            key={row.id}
                            title={column.tooltip(value, row)}
                          >
                            <TableCell key={column.id} align={column.align}>
                              {column.format
                                ? column.format(value, row)
                                : value}
                            </TableCell>
                          </Tooltip>
                        );
                      } else {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format ? column.format(value, row) : value}
                          </TableCell>
                        );
                      }
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={fillRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

function VisHistory(props) {
  const { children, value, index, ...other } = props;

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {visColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
              <TableCell key="details" align="center" style={{ minWidth: 20 }}>
                Details
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {visColumns.map((column) => {
                      const value = row[column.id];

                      if (column.tooltip) {
                        return (
                          <Tooltip
                            key={column.id}
                            title={column.tooltip(value, row)}
                          >
                            <TableCell key={column.id} align={column.align}>
                              {column.format
                                ? column.format(value, row)
                                : value}
                            </TableCell>
                          </Tooltip>
                        );
                      } else {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format ? column.format(value, row) : value}
                          </TableCell>
                        );
                      }
                    })}
                    <TableCell key="details" align="center">
                      <IconButton aria-label="details">
                        <OpenInNewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={visRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

export default function History() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange}>
            <Tab label="Fills" {...a11yProps(0)} />
            <Tab label="Visual Inspections" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <FillHistory />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <VisHistory />
        </CustomTabPanel>
      </Box>
    </Container>
  );
}
