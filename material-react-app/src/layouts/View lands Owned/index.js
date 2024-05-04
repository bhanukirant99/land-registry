import { useState, useEffect } from "react";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import MDButton from 'components/MDButton';

import LandCard from './Components/LandCard';
import getWeb3 from "getWeb3/getWeb3";
import LandRegistry from "abis/LandRegistry.json";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function LandsForSale() {
  const [Survey_No, setSurvey_No] = useState("");

  const [details, setdetails] = useState({
    LandInstance: undefined,
    account: null,
    web3: null,
  });

  const [landCount, setLandCount] = useState(0);
  const [lands, setLands] = useState([]);

  const buyLand = async (id, price, instance, account, web3) => {
    try {
        await instance.methods.buyLand(id).send({ from: account, value: web3.utils.toWei(price.toString(), "ether")}).then((res) => {

          console.log(res);
       })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(async () => {
    if (!window.location.hash) {
      window.location = window.location + '#loaded';
      window.location.reload();
    }
    try {
      //Get network provider and web3 instance
      const web3 = await getWeb3();

      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = await LandRegistry.networks[networkId];
      const instance = await new web3.eth.Contract(
        LandRegistry.abi,
        deployedNetwork && deployedNetwork.address,
      );
      setdetails({ LandInstance: instance, web3: web3, account: accounts[0] });
      const landCount = await instance.methods.landCount().call();
      setLandCount(landCount);
      for (let i = 0; i < landCount; i++) {
        const land = await instance.methods.lands(i).call();
          if(land.owner != accounts[0] && land.forsale == true && land.verified == true){
            setLands(prevLands => [...prevLands, <Grid item xs={4}> <LandCard
              account = {accounts[0]}
              web3 = {web3}
              instance = {instance}
              buyLand = {buyLand}
              _id = {land.id}
              Property_ID = {land.pid}
              Survey_No = {land.survey}
              Land_Khata = {land.doc_hash}
              Estimated_Price = {land.price} /> 
                           
              </Grid>
            ]);
            
          }
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }, []);

  console.log(details);

  // const submitHandler = async (e) => {
  //   e.preventDefault();
  //   console.log("hello");
  //   console.log(details);
  //   console.log(details.account);
  //   //buyLand(1, 15)
  // }

  return (
     <DashboardLayout>
      <DashboardNavbar />
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        {lands}
      </Grid>
    </Box>
    {/* <MDButton onClick={submitHandler} variant="contained" color="error">
                Buy Land
              </MDButton> */}
    </DashboardLayout>
    
  );
}