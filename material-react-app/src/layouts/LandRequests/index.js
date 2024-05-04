import { useState } from "react";
// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Data
import DataTable from "examples/Tables/DataTable";

import LandViewTable from "./LandView";
import LandRequestViewTable from "./LandRequestView"

function LandRequests() {
  
  const { columns, rows } = LandViewTable();
  const { columns: pColumns, rows: pRows } = LandRequestViewTable();
  
  return (
    <DashboardLayout>
      <DashboardNavbar />
       
        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            
            <Grid item xs={12}>
              <Card>
                <MDBox
                  mx={2}
                  mt={-3}
                  py={3}
                  px={2}
                  variant="gradient"
                  bgColor="info"
                  borderRadius="lg"
                  coloredShadow="info"
                >
                  <MDTypography variant="h6" color="white">
                    Land Info
                  </MDTypography>
                </MDBox>
                
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
                
              </Card>
            </Grid>
          </Grid>
       
        </MDBox>
        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            
            <Grid item xs={12}>
              <Card>
                <MDBox
                  mx={2}
                  mt={-3}
                  py={3}
                  px={2}
                  variant="gradient"
                  bgColor="info"
                  borderRadius="lg"
                  coloredShadow="info"
                >
                  <MDTypography variant="h6" color="white">
                    Land Verification Requests
                  </MDTypography>
                </MDBox>
                
                <DataTable
                  table={{ columns: pColumns, rows: pRows }}
                //   table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
                
              </Card>
            </Grid>
          </Grid>
        </MDBox>

    </DashboardLayout>
  );
}

export default LandRequests;
