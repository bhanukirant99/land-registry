import { useState, useEffect } from "react";
import * as React from 'react';
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import Typography from '@mui/material/Typography';

import Card from "@mui/material/Card";
import getWeb3 from "getWeb3/getWeb3";
import LandRegistry from "abis/LandRegistry.json";

import axios from "axios";
import VisibilityIcon from '@mui/icons-material/Visibility';
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// import AuthService from "../../services/auth-service";

const AddLand = () => {
//   const url = window.location.href;
//   const url1 = url.split("=");
//   const url2 = url1[1].split("#");
//   const id = url2[0];
// //   console.log(id);
  const queryParameters = new URLSearchParams(window.location.search);
  const id = queryParameters.get("landId");

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);

  const [notification, setNotification] = useState(false);

  const [doc1, setDoc1] = useState(null);
  const [landD, setlandD] = useState({
    doc_hash: "",
    pid: "",
    survey: "",
    price: "",
    owner: ""
  });

  const [userD, setUserD] = useState({
    name: "",
    age: "",
    email: "",
    pan: "",
    phone: "",
    verified: ""
  });

  const [verification, setVerification] = useState(false);

  const [land, setLand] = useState({
    LandInstance: undefined,
    account: null,
    web3: null,
    hissa:"",
    survey:"",
    doc_hash:"",
    pid: "",
    price: "",
  });

  const [errors, setErrors] = useState({
    hissaError: false,
    surveyError: false,
    pidError: false,
    priceError: false,
  });

  useEffect( async () => {
    if(!window.location.hash){
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
      setLand({ ...land,LandInstance: instance, web3: web3, account: accounts[0] });
      const landDetail = await instance.methods.getLandDetails(id).call();
      console.log(landDetail);
      setlandD({owner: landDetail[4], survey: landDetail[2], doc_hash: landDetail[0], pid: landDetail[1], price: landDetail[3] });
      
      const userDetail = await instance.methods.getUserDetails(landDetail[4]).call();
      setUserD({name: userDetail[0], age: userDetail[1], email: userDetail[2], pan: userDetail[4], phone: userDetail[5], verified: userDetail[6] });
      console.log(userDetail);

      const user = await instance.methods.users(accounts[0]).call();
      if(user.verified == false){
        setVerification(true);
      }

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
  },[]);


  useEffect(() => {
    if (notification === true) {
      setTimeout(() => {
        setNotification(false);
      }, 5000);
    }
  }, [notification]);

  const changeHandler = (e) => {
    setLand({
      ...land,
      [e.target.name]: e.target.value,
    });
  };

  const addLand = async (land) => {
    try {
      const formData = new FormData();
      formData.append("file", doc1);
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
        },
        // headers: {
        //   'pinata_api_key': `${process.env.REACT_APP_PINATA_API_KEY}`,
        //   'pinata_secret_api_key': `${process.env.REACT_APP_PINATA_API_SECRET}`,
        //   "Content-Type": "multipart/form-data",
        //   'Authorization': `Bearer ${process.env.REACT_APP_PINATA_API_ACCESS_TOKEN}`
        // },
      });
      const doc1Hash = `${resFile.data.IpfsHash}`;
      console.log(doc1Hash);
      setLand({ ...land, doc_hash: doc1Hash });
      // var verified = land.LandInstance.methods.getUserVerificationStatus(land.account);
      // if(verified){
        console.log(land);
        await land.LandInstance.methods.addLand(land.hissa,land.survey,land.pid,land.price).send({ from: land.account}).then((res) => {
          setNotification(true);
          //window.location.reload(false);
          console.log(res);
          setLand({
            ...land,
            hissa:"",
            survey:"",
            pid: "",
            price: "",
          });
          setDoc1("");
       })
      // }else{
      //   alert(
      //     "User verfication is still pending"
      // );
      // }
    } catch (error) {
      console.log(error)
    }
  }

  const submitHandler = async (e) => {
    e.preventDefault();

    var hissaErr = false;
    var surveyErr = false;
    var pidErr = false;
    var priceErr = false;

    if (land.pid.trim().length === 0) {
      pidErr = true;
    }

    if (land.hissa.trim().length === 0) {
      hissaErr = true;
    }

    if (land.survey.trim().length === 0) {
      surveyErr = true;
    }

    if (land.price.trim().length === 0) {
      priceErr = true;
    }

    if (hissaErr || surveyErr || pidErr || priceErr) {
      setErrors({
        hissaError:  hissaErr,
        surveyError: surveyErr,
        pidError: pidErr,
        priceError: priceErr,
      });
      return;
    }

    addLand(land);

    setErrors({
      hissaError: false,
      surveyError: false,
      pidError: false,
      priceError: false,
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card sx={{
        position: "relative",
        mt: 5,
        px: 2,
        mr:10,
        ml:10
        
      }} >
        <h4>Land & User Details</h4>
        <MDBox
          component="form"
          role="form"
          onSubmit={submitHandler}
          display="flex"
          flexDirection="column"
        >
          {/* PID Number */}
          <MDBox display="flex" flexDirection="row" mt={5} mb={3}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              mr={2}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
                PID Number
              </MDTypography>
              <MDBox mb={2} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="pid"
                  value={landD.pid}
                  onChange={changeHandler}
                  error={errors.pidError}
                  disabled
                />
                {errors.pidError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    PID number can not be null
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              ml={2}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
                Owner Address
              </MDTypography>
              <MDBox mb={1} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="owner"
                  value={landD.owner}
                  onChange={changeHandler}
                  error={errors.hissaError}
                  disabled
                />
                {errors.hissaError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    Hissa number must be valid
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          </MDBox>
          <MDBox display="flex" flexDirection="row" mt={5} mb={3}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              mr={3}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
                Survey Number
              </MDTypography>
              <MDBox mb={2} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="survey"
                  value={landD.survey}
                  onChange={changeHandler}
                  error={errors.surveyError}
                  disabled
                />
                {errors.surveyError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    The survey number can not be null
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
            {/* Price */}
           <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              ml={2}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
              Owner Name
              </MDTypography>
              <MDBox mb={2} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="price"
                  value={userD.name}
                  onChange={changeHandler}
                  error={errors.priceError}
                  disabled
                />
                {errors.priceError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    The price can not be null
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          </MDBox>
          <MDBox display="flex" flexDirection="row" mt={5} mb={3}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              mr={2}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
              Price (Enter in rupees)
              </MDTypography>
              <MDBox mb={2} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="pid"
                  value={landD.price}
                  onChange={changeHandler}
                  error={errors.pidError}
                  disabled
                />
                {errors.pidError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    PID number can not be null
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              mr={0.1}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
                Email 
              </MDTypography>
              <MDBox mb={2} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="survey"
                  value={userD.email}
                  onChange={changeHandler}
                  error={errors.surveyError}
                  disabled
                />
                {errors.surveyError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    The survey number can not be null
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
            {/* Price */}
          </MDBox>
          <MDBox display="flex" flexDirection="row" mt={5} mb={3}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              mr={3}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
                Phone 
              </MDTypography>
              <MDBox mb={2} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="survey"
                  value={userD.phone}
                  onChange={changeHandler}
                  error={errors.surveyError}
                  disabled
                />
                {errors.surveyError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    The survey number can not be null
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
            {/* Price */}
           <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              ml={2}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
                verified
              </MDTypography>
              <MDBox mb={2} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="price"
                  value={userD.verified}
                  onChange={changeHandler}
                  error={errors.priceError}
                  disabled
                />
                {errors.priceError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    The price can not be null
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          </MDBox>    
          {/* Documents Upload */}
          <MDBox display="flex" flexDirection="row" mt={5} mb={3}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              ml={2}
              mt={1}
            >
              <MDTypography variant="body2" color="text" mr={5} fontWeight="regular" width="100%">
                View Khata Document
              </MDTypography>
              <MDBox>
                <a href={`https://ipfs.io/ipfs/${landD.doc_hash}`} target="_blank"><MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  type="button"
                >
                  Land Document
                </MDButton></a>
              </MDBox>
              {/* <Typography sx={{ cursor: 'pointer' }} variant="body1">
              <u><a href={`https://ipfs.io/ipfs/${landD.doc_hash}`} target="_blank">Land Document</a></u>
              </Typography> */}
            </MDBox>
          </MDBox>      
        </MDBox>
      </Card>
      
    </DashboardLayout>
  );
};

export default AddLand;
