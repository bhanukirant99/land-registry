import { useState, useEffect } from "react";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Landimage from "assets/images/Landimage.jpg";
import MDButton from 'components/MDButton';

const Img = styled('img')({
  margin: 'auto',
  display: 'block',
  maxWidth: '100%',
  maxHeight: '100%',
});

export default function ComplexGrid(props) {

  const submitHandler = async (e) => {
    e.preventDefault();
    props.buyLand(props._id, props.Estimated_Price, props.instance, props.account, props.web3);
    console.log(props._id);
  }
  return (
    <Paper
      sx={{
        p: 2,
        margin: 'auto',
        maxWidth: 500,
        flexGrow: 1,
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
      }}
    >
      <Grid container spacing={2}>
        <Grid item>
          <Img alt="complex" src={Landimage} />
        </Grid>
        <Grid item xs='auto' sm container>
          <Grid item xs container direction="column" spacing={2}>
            <Grid item xs>
              <Typography gutterBottom variant="body1" component="div">
                Property {parseInt(props._id) + 1}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                PID: {props.Property_ID}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Survey no: {props.Survey_No}
              </Typography>
            </Grid>
            <Grid item>
              {/* <Typography sx={{ cursor: 'pointer' }} variant="body1">
              <u><a href={`https://ipfs.io/ipfs/${props.Land_Khata}`} target="_blank">Land Document</a></u>
              </Typography> */}
              <Typography sx={{ cursor: 'pointer' }} variant="body1">
                <a href={`http://localhost:3000/viewLand?landId=${props._id}`} target="_blank">tap to view more..</a>
              </Typography>
            </Grid>
          </Grid>
          <Grid item direction="column">
            {/* <Grid item xs mb={13}>
              <Typography variant="subtitle1" component="div">
                {props.Estimated_Price}
              </Typography>
            </Grid> */}
            <Grid item>
              <MDButton onClick={submitHandler} variant="contained" color="error">
                Buy Land
              </MDButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}