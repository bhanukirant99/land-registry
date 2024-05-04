import * as React from 'react';
import Button from '@mui/material/Button';
import { useState, useEffect } from "react";
// import { Modal,Box } from '@mui/material';
// import sendgrid from '@sendgrid/mail';
import emailjs from '@emailjs/browser';
// Material Dashboard 2 React components

// To fetch data from backend
import getWeb3 from "getWeb3/getWeb3";
import LandRegistry from "abis/LandRegistry.json";
// const sendgrid = require("@sendgrid/mail");

export default function LandRequestViewTable() {
  // const [open, setOpen] = useState(false);
  
  // const msg = {
  //   to: 'ham019708@gmail.com',
  //   from: '25.06manojha@gmail.com',
  //   subject: 'Sending with SendGrid is Fun',
  //   text: 'and easy to do anywhere, even with Node.js',
  //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  // };
  // sendgrid.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

  const [landCount, setLandCount] = useState(0);
  const [details, setdetails] = useState({
    LandInstance: undefined,
    account: null,
    web3: null,
  });

  const [lands, setLands] = useState([]);

  const approveHandler = (event, instance, id, admin, email, name) => {
    event.stopPropagation();
    console.log(email);
    try{
      instance.methods.verifyLand(parseInt(id),true).send({ from: admin,gas: 2100000 }).then((res) => {
        alert("Land Has been verified");
        window.location.reload(false);
      })
      var AcceptTemplateParams = {
        from_name: 'admin',
        to_name: name,
        to_email: email,
        message: 'Land Request Accepted',
      };
      emailjs.send('service_eil3zej', 'template_vi3cepi', AcceptTemplateParams, '_rxW964OmUs6WHOc3')
      .then((result) => {
          // show the user a success message
          console.log("success");
      }, (error) => {
          // show the user an error
          console.log("error");
      });
      
    }catch(error){
      console.log(error);
    }
  }

  const rejectHandler = (event, instance, id, admin, email, name) => {
    event.stopPropagation();
    try{
      instance.methods.verifyLand(parseInt(id),false).send({ from: admin,gas: 2100000}).then((res) => {
        alert("Land Has been rejected");
        window.location.reload(false);
      })
      var RejectTemplateParams = {
        from_name: 'admin',
        to_name: name,
        to_email: email,
        message: 'Land Request Rejected',
      };
      emailjs.send('service_eil3zej', 'template_vi3cepi', RejectTemplateParams, '_rxW964OmUs6WHOc3')
      .then((result) => {
          // show the user a success message
          console.log("success");
      }, (error) => {
          // how the user an error
          console.log("error");
      });
    }catch(error){
      console.log(error);
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
      const landC = await instance.methods.landCount().call();
      setLandCount(landC);
      for (let i = 0; i < landC; i++) {
        const land = await instance.methods.lands(i).call();
        const userDetail = await instance.methods.getUserDetails(land.owner).call();
        console.log(land);
        console.log("userDetail", userDetail);
        
        
        if (!land.verified && userDetail[6]) {
          setLands(prevLands => [...prevLands, {
            // Sl_no: i + 1,
            Owner:land.owner,
            Property_ID: land.pid,
            Survey_No: land.survey,
            Land_Khata: <u><a href={`https://ipfs.io/ipfs/${land.doc_hash}`} target="_blank">Khata Document</a></u>,
            Estimated_Price:land.price,
            Approve: (
              <Button variant="contained" style={{ backgroundColor: "black", marginRight: "5px", }} onClick={(e)=>approveHandler(e,instance,land.id, accounts[0], userDetail[2], userDetail[0])}>Approve</Button>
            ),
            Reject:(
              <Button variant="contained" style={{ backgroundColor: "red", marginLeft: "5px" }} onClick={(e)=>rejectHandler(e,instance,land.id,accounts[0], userDetail[2], userDetail[0])}>Reject</Button>
            )
          }]);
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

    return {
      columns: [
        // { Header: "Sl_No", accessor: "Sl_No", width: "45%", align: "left" },
        { Header: "Owner Address", accessor: "Owner", align: "left" },
        { Header: "Property_ID", accessor: "Property_ID", align: "left" },
        { Header: "Survey_No", accessor: "Survey_No", align: "center" },
        { Header: "Land Khata", accessor: "Land_Khata", align: "center" },
        { Header: "Estimated Price", accessor: "Estimated_Price", align: "left" },
        { Header: "Approve", accessor: "Approve", align: "center" },
        { Header: "Reject", accessor: "Reject", align: "center" },
      ],
  
      rows: lands,
    };  
}



