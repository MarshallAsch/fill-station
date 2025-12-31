import {
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
import dayjs from 'dayjs'
import { useState } from 'react'

function createData(id, name, date, start, end, o2, he, cylinder) {
	return { id, name, date, start, end, o2, he, cylinder }
}

const fillColumns = [
	{
		id: 'date',
		label: 'Date',
		minWidth: 100,
		align: 'right',
		format: (value) => value.format('DD/MM/YYYY'),
		tooltip: (value) => value.format('MMMM DD, YYYY'),
	},
	{ id: 'name', label: 'Name', minWidth: 100 },
	{
		id: 'o2',
		label: 'Mix',
		minWidth: 170,
		align: 'right',
		format: (value, row) => {
			let o2 = row.o2.toFixed(1)
			let he = row.he.toFixed(1)

			if (he == 0.0) {
				return o2
			} else {
				return `${o2}/${he}`
			}
		},
	},
	{
		id: 'start',
		label: 'Fill',
		minWidth: 200,
		align: 'left',
		format: (value, row) => `${row.start} psi -> ${row.end} psi`,
	},
	{
		id: 'cylinder',
		label: 'Cylinder',
		minWidth: 100,
		align: 'left',
	},
]

const fillRows = [
	createData(
		1,
		'Marshall Asch',
		dayjs('2025-10-01T00:00:00.000'),
		500,
		3400,
		20.9,
		0,
		'abcd-efg-hij',
	),
	createData(
		2,
		'Bob Marley',
		dayjs('2023-11-10T00:00:00.000'),
		0,
		3000,
		18.0,
		42,
		'abcd-efg-hij',
	),
]

const FillsHistory = () => {
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
									<TableRow hover role='checkbox' tabIndex={-1} key={row.id}>
										{fillColumns.map((column) => {
											const value = row[column.id]

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
												)
											} else {
												return (
													<TableCell key={column.id} align={column.align}>
														{column.format ? column.format(value, row) : value}
													</TableCell>
												)
											}
										})}
									</TableRow>
								)
							})}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[10, 25, 100]}
				component='div'
				count={fillRows.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</Paper>
	)
}

export default FillsHistory
