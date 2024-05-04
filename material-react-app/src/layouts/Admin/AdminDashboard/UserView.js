import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MDTypography from "components/MDTypography";

/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDBadge from "components/MDBadge";



export default function UserViewTable() {
  
    return {
      columns: [
        { Header: "Account Address", accessor: "Account_Address", width: "45%", align: "left" },        
      ],
  
      rows: [
        {
          Account_Address:(
            <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
              23515184626198626198492526548451
            </MDTypography>
          ),
        }
      ]
    };
  
}



