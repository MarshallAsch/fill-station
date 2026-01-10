import {
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	Tooltip,
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DangerousRoundedIcon from '@mui/icons-material/DangerousRounded'
import { useState } from 'react'
import dayjs from 'dayjs'
import { red } from '@mui/material/colors'

const visColumns = [
	{
		id: 'date',
		label: 'Date',
		minWidth: 100,
		align: 'right',
		format: (value) => value.format('DD/MM/YYYY'),
		tooltip: (value) => value.format('MMMM DD, YYYY'),
	},
	{
		id: 'cylinder',
		label: 'Cylinder',
		minWidth: 100,
		align: 'left',
	},
	{
		id: 'pass',
		label: 'Passed',
		align: 'right',
		format: (value) =>
			value ? (
				<CheckCircleRoundedIcon color='success' />
			) : (
				<DangerousRoundedIcon sx={{ color: red[500] }} />
			),
		tooltip: (value) => (value ? 'Pass' : 'Fail'),
	},
	{
		id: 'o2Clean',
		label: 'Oxygen Clean',
		align: 'right',
		format: (value) => value && <CheckCircleRoundedIcon color='success' />,
		tooltip: (value) =>
			value ? 'Cleaned for Oxygen Service' : 'Not Clean for Oxygen Service',
	},
]

const visRows = [
	{
		id: 1,
		date: dayjs('2025-10-01T00:00:00.000'),
		cylinder: 'abcd-efg-hij',
		pass: true,
		o2Clean: true,
	},
	{
		id: 2,
		date: dayjs('2025-10-01T10:00:00.000'),
		cylinder: 'hih-klm-nop',
		pass: true,
		o2Clean: false,
	},
	{
		id: 3,
		date: dayjs('2022-10-01T10:00:00.000'),
		cylinder: 'hih-klm-nop',
		pass: false,
		o2Clean: false,
	},
]

const VisHistory = () => {
	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useState(10)

	const handleChangePage = (event, newPage) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(+event.target.value)
		setPage(0)
	}

	return (
		<Paper sx={{ width: '100%', overflow: 'hidden' }}>
			<TableContainer sx={{ maxHeight: 440 }}>
				<Table stickyHeader aria-label='sticky table'>
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
							<TableCell key='details' align='center' style={{ minWidth: 20 }}>
								Details
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{visRows
							.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.map((row) => {
								return (
									<TableRow hover role='checkbox' tabIndex={-1} key={row.id}>
										{visColumns.map((column) => {
											const value = row[column.id]

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
												)
											} else {
												return (
													<TableCell key={column.id} align={column.align}>
														{column.format ? column.format(value, row) : value}
													</TableCell>
												)
											}
										})}
										<TableCell key='details' align='center'>
											<IconButton
												aria-label='details'
												href={`/visual/${row.id}`}
											>
												<OpenInNewIcon />
											</IconButton>
										</TableCell>
									</TableRow>
								)
							})}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[10, 25, 100]}
				component='div'
				count={visRows.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</Paper>
	)
}

export default VisHistory
