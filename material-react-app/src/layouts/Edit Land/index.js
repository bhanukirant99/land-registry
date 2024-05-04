import { useState, useEffect } from "react";
import * as React from 'react';
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import Card from "@mui/material/Card";
import getWeb3 from "getWeb3/getWeb3";
import LandRegistry from "abis/LandRegistry.json";
import VisibilityIcon from '@mui/icons-material/Visibility';

import { Navigate, useNavigate } from "react-router-dom";

import axios from "axios";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

import CardMedia from '@mui/material/CardMedia';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

var id;

const EditLand = () => {
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [doc1, setDoc1] = useState(null);

  const [land, setLand] = useState({
    LandInstance: undefined,
    account: null,
    web3: null,
    survey: "",
    doc_hash: "",
    pid: "",
    price: "",
    verified:false
  });

  const [errors, setErrors] = useState({
    surveyError: false,
    pidError: false,
    priceError: false,
  });

  useEffect(async () => {
    const queryParameters = new URLSearchParams(window.location.search);
    const d = queryParameters.get("id");
    if(d){
      console.log(d);
      id=d
    }
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
      const land1 = await instance.methods.lands(id).call();
      setLand({
        ...land,
        LandInstance: instance,
        web3: web3,
        account: accounts[0],
        survey: land1.survey,
        doc_hash: land1.doc_hash,
        pid: land1.pid,
        price: land1.price,
        verified:land1.verified
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }, []);


  const changeHandler = (e) => {
    setLand({
      ...land,
      [e.target.name]: e.target.value,
    });
  };

  const updateLand = async (land) => {
    try {
      if(doc1){
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
      await land.LandInstance.methods.updateLand(doc1Hash,land.survey, land.pid, land.price,id).send({ from: land.account }).then((res) => {
        console.log(res);
        setLand({
          ...land,
          survey: "",
          pid: "",
          price: "",
        });
        setDoc1("");
        alert(
          `Land details updated successfully.You will be redirected to dashboard`,
        );
        navigate('/dashboard');
      });
    }else{
      await land.LandInstance.methods.updateLand(land.doc_hash,land.survey, land.pid, land.price,id).send({ from: land.account }).then((res) => {
        console.log(res);
        setLand({
          ...land,
          survey: "",
          pid: "",
          price: "",
        });
        setDoc1("");
        alert(
          `Land details updated successfully.You will be redirected to dashboard`,
        );
        navigate('/dashboard');
      });
    }
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
    var surveyErr = false;
    var pidErr = false;
    var priceErr = false;

    if (land.pid.trim().length === 0) {
      pidErr = true;
    }

    if (land.survey.trim().length === 0) {
      surveyErr = true;
    }

    if (land.price.trim().length === 0) {
      priceErr = true;
    }

    if (surveyErr || pidErr || priceErr) {
      setErrors({
        surveyError: surveyErr,
        pidError: pidErr,
        priceError: priceErr,
      });
      return;
    }

    updateLand(land);

    setErrors({
      surveyError: false,
      pidError: false,
      priceError: false,
    });
  };

  return (
    <DashboardLayout>
      <Card sx={{
        position: "relative",
        mt: 5,
        px: 2,
        mr: 10,
        ml: 10
      }}>
        {land.verified && (
          <MDAlert color="info" mt="20px">
            <MDTypography variant="body2" color="white">
              Land details can no longer be changed as it is already verified
            </MDTypography>
          </MDAlert>
        )}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <MDBox sx={style}>
            {land.doc_hash ? <><MDTypography id="modal-modal-title" variant="h6" component="h2">
              Preview
            </MDTypography>
              <CardMedia
                image={`https://ipfs.io/ipfs/${land.doc_hash}`} component="img"
                height="700" sx={{ objectFit: "contain" }} />
            </> : "No Preview Available"}
          </MDBox>
        </Modal>
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
                  value={land.pid}
                  onChange={changeHandler}
                  error={errors.pidError}
                />
                {errors.pidError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    PID number can not be null
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
                  value={land.survey}
                  onChange={changeHandler}
                  error={errors.surveyError}
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
                Price (Enter in rupees)
              </MDTypography>
              <MDBox mb={2} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="price"
                  value={land.price}
                  onChange={changeHandler}
                  error={errors.priceError}
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
              <><MDTypography variant="body2" color="text" mr={5} fontWeight="regular" width="100%">
                Update Land Khata
              </MDTypography>
                <MDBox mb={1} width="70%">
                  <input accept="image/*" multiple type="file" onChange={(e) => setDoc1(e.target.files[0])} />
                </MDBox></>
              <MDBox mt={1} mb={1}></MDBox>
              <><MDTypography variant="body2" color="text" mr={5} fontWeight="regular" width="100%">
                View Present Land Khata
              </MDTypography><MDButton variant="gradient" color="info" onClick={handleOpen}>
                  <VisibilityIcon fontSize="inherit" />
                </MDButton></>
            </MDBox>
          </MDBox>
          <MDBox display="flex" flexDirection="column" mb={3}>
            <MDBox mt={4} mr={7} display="flex" flexDirection="row"
              justifyContent="end">
              <MDButton variant="gradient" color="info" type="submit">
                Update
              </MDButton>
            </MDBox>
          </MDBox>
            
        </MDBox>
      </Card>
    </DashboardLayout>
  );
};

export default EditLand;
