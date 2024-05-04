import { useState, useEffect } from "react";
import * as React from 'react';
import { useNavigate } from "react-router-dom";
// @mui material components
import MDBadge from "components/MDBadge";
import MDBox from "components/MDBox";
import { Button } from "@mui/material";

// Images

import getWeb3 from "getWeb3/getWeb3";
import LandRegistry from "abis/LandRegistry.json";


export default function data() {
  const navigate = useNavigate();
  const [details, setdetails] = useState({
    LandInstance: undefined,
    account: null,
    web3: null,
  });

  const [landCount, setLandCount] = useState(0);
  const [lands, setLands] = useState([]);

  const approveHandler = async (event,instance,id,account,sale) => {
    event.stopPropagation();
    
    instance.methods.editForSale(parseInt(id)).send({ from: account, gas: 2100000 }).then((res) => {
      if(sale == false){
        alert("Land Has been added for sale");
      }else{
        alert("Land Has been removed from the sale-list");
      }
      window.location.reload(false);
    })
  }

  const editHandler = async (event,instance,id,account)=>{
    event.stopPropagation();
    navigate(`/editLand?id=${id}`);
  };



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
        if (land.owner == accounts[0]) {
          if(land.verified == true){
            if(land.forsale == false){
              setLands(prevLands => [...prevLands, {
                Property_ID: land.pid,
                Survey_No: land.survey,
                Land_Khata: <u><a href={`https://ipfs.io/ipfs/${land.doc_hash}`} target="_blank">Khata Document</a></u>,
                Estimated_Price: land.price,
                Verification_Status: land.verified ? <MDBox ml={-1}>
                  <MDBadge badgeContent="VERIFIED" color="success" variant="gradient" size="sm" />
                </MDBox> : <MDBox ml={-1}>
                  <MDBadge badgeContent="NOT VERIFIED" color="dark" variant="gradient" size="sm" />
                </MDBox>,
                Add: (
                  <Button variant="contained" style={{ backgroundColor: "green", marginRight: "5px", color:"white", width:"80px" }} onClick={(e)=>approveHandler(e,instance,land.id, accounts[0], land.forsale)}>Add</Button>
                ),
                Edit_Land:(
                  <Button variant="contained" style={{ backgroundColor: "blue", marginRight: "5px", color:"white", width:"80px" }} disabled={land.verified} onClick={(e)=>editHandler(e,instance,land.id, accounts[0])}>Edit</Button>
                )
              }]);
            }
            else{
              setLands(prevLands => [...prevLands, {
                Property_ID: land.pid,
                Survey_No: land.survey,
                Land_Khata: <u><a href={`https://ipfs.io/ipfs/${land.doc_hash}`} target="_blank">Khata Document</a></u>,
                Estimated_Price: land.price,
                Verification_Status: land.verified ? <MDBox ml={-1}>
                  <MDBadge badgeContent="VERIFIED" color="success" variant="gradient" size="sm" />
                </MDBox> : <MDBox ml={-1}>
                  <MDBadge badgeContent="NOT VERIFIED" color="dark" variant="gradient" size="sm" />
                </MDBox>,
                Add: (
                  <Button variant="contained" style={{ backgroundColor: "red", marginRight: "5px", color:"white", width:"80px", }} onClick={(e)=>approveHandler(e,instance,land.id, accounts[0], land.forsale)}>Remove</Button>
                ),
                Edit_Land:(
                  <Button variant="contained" style={{ backgroundColor: "blue", marginRight: "5px", color:"white", width:"80px" }} disabled={land.verified} onClick={(e)=>editHandler(e,instance,land.id, accounts[0])}>Edit</Button>
                )
              }]);
            }
          }
          else{
            setLands(prevLands => [...prevLands, {
              Property_ID: land.pid,
              Survey_No: land.survey,
              Land_Khata: <u><a href={`https://ipfs.io/ipfs/${land.doc_hash}`} target="_blank">Khata Document</a></u>,
              Estimated_Price: land.price,
              Verification_Status: land.verified ? <MDBox ml={-1}>
                <MDBadge badgeContent="VERIFIED" color="success" variant="gradient" size="sm" />
              </MDBox> : <MDBox ml={-1}>
                <MDBadge badgeContent="NOT VERIFIED" color="dark" variant="gradient" size="sm" />
              </MDBox>,
              Add: (
                <MDBadge badgeContent="Land is not verified" color="dark" variant="gradient" size="sm" />
              ),
              Edit_Land:(
                <Button variant="contained" style={{ backgroundColor: "blue", marginRight: "5px", color:"white", width:"80px" }} disabled={land.verified} onClick={(e)=>editHandler(e,instance,land.id, accounts[0])}>Edit</Button>
              )
            }]);
          }
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

  console.log(typeof(lands));

  return {
    columns: [
      { Header: "Property_ID", accessor: "Property_ID", align: "left" },
      { Header: "Survey_No", accessor: "Survey_No", align: "left" },
      { Header: "Land Khata", accessor: "Land_Khata", width: "15%", align: "left" },
      { Header: "Estimated_Price", accessor: "Estimated_Price", width: "15%", align: "left" },
      { Header: "Verification Status", accessor: "Verification_Status", width: "15%", align: "left" },
      { Header: "SellLand", accessor: "Add", width: "15%", align: "left" },
      { Header: "Edit Land", accessor: "Edit_Land", width: "15%", align: "left" },
    ],
    rows: lands
  };
}
