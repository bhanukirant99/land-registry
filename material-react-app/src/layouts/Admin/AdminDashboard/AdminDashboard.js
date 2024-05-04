import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

function createData(AccountAddress, Name, age, Email, City, AadhaarNumber, PANNumber, VerificationStatus) {
  return {  Name, age, Email, City, AadhaarNumber, PANNumber, VerificationStatus,AccountAddress, };
}

const rows = [
  createData(159,6.0,24, 4.0, 23, 25, 234,14454468613125),
  createData(7638376482634234, 159, 6.0, 24, 4.0, 23, 25, 234),
  createData(324238976987234, 159, 6.0, 24, 4.0, 23, 25, 234),
];

export default function AccessibleTable() {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 750 }} aria-label="caption table">
        
        <TableHead>
          <TableRow >
            <TableCell spacing>Account Address</TableCell>
            <TableCell >Name</TableCell>
            <TableCell >age</TableCell>
            <TableCell >Email</TableCell>
            <TableCell >City</TableCell>
            <TableCell >Aadhaar Number</TableCell>
            <TableCell >PAN Number</TableCell>
            <TableCell >Verification Status</TableCell>
            <TableCell >Verify</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.AccountAddress}>
              <TableCell component="th" scope="row">
                {row.AccountAddress}
              </TableCell>
              <TableCell component="th" scope="row">
                {row.Name}
              </TableCell>
              <TableCell component="th" scope="row">{row.age}</TableCell>
              <TableCell component="th" scope="row">{row.Email}</TableCell>
              <TableCell component="th" scope="row">{row.City}</TableCell>
              <TableCell component="th" scope="row">{row.AadhaarNumber}</TableCell>
              <TableCell component="th" scope="row">{row.PANNumber}</TableCell>
              <TableCell component="th" scope="row">{row.VerificationStatus}</TableCell>
              <TableCell component="th" scope="row"><Button variant="contained" style={{ backgroundColor: "black"}}>Verify</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}