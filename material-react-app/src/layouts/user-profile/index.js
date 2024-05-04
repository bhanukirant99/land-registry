import { useState, useEffect } from "react";

import * as React from 'react';
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import axios from "axios";
import VisibilityIcon from '@mui/icons-material/Visibility';

import CardMedia from '@mui/material/CardMedia';

// For integrating with blockchain backend
import getWeb3 from "getWeb3/getWeb3";
import LandRegistry from "abis/LandRegistry.json";

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

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Overview page components
import Header from "layouts/user-profile/Header";

// import AuthService from "../../services/auth-service";

const UserProfile = () => {
  //for the modal dialog
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [registered, setRegistered] = useState(false);
  const [notification, setNotification] = useState(false);
  const [fileImg, setFileImg] = useState(null);
  const [user, setUser] = useState({
    LandInstance: undefined,
    account: null,
    web3: null,
    verified: "",
    name: "",
    email: "",
    age: "",
    pan: "",
    phone: "",
    filehash: "",
  });

  const [errors, setErrors] = useState({
    nameError: false,
    emailError: false,
    ageError: false,
    panError: false,
    phoneError: false
  });


  useEffect(() => {
    if (notification === true) {
      setTimeout(() => {
        setNotification(false);
      }, 5000);
    }
  }, [notification]);

  useEffect(async () => {
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
      var registered1 = await instance.methods.isRegistered(accounts[0]).call()
      console.log(registered1);
      setRegistered(registered1);
      if (registered1) {
        var data = await instance.methods.getUserDetails(accounts[0]).call();
        console.log(data[3]);
        setUser({
          ...user,
          LandInstance: instance,
          web3: web3,
          account: accounts[0],
          name: data[0],
          email: data[2],
          age: data[1],
          pan: data[4],
          phone: data[5],
          filehash: data[3],
          verified: data[6],
        });
      } else {
        setUser({
          ...user,
          LandInstance: instance,
          web3: web3,
          account: accounts[0],
        });
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  },[]);

  const changeHandler = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const addUser = async (user) => {
    try {
      const formData = new FormData();
      formData.append("file", fileImg);
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
      const ImgHash = `${resFile.data.IpfsHash}`;
      console.log(ImgHash);
      setUser({ ...user, filehash: ImgHash });
      await user.LandInstance.methods.registerUser(user.name, parseInt(user.age), user.email, ImgHash, user.pan, user.phone).send({ from: user.account }).then((res) => {
        console.log("User added successfully");
        setNotification(true);
        window.location.reload(false);
      });
      //Take a look at your Pinata Pinned section, you will see a new file added to you list.   
    } catch (error) {
      console.log(error)
    }
  }

  const submitHandler = async (e) => {
    e.preventDefault();

    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


    var nameErr = false;
    var emailErr = false;
    var ageErr = false;
    var phoneErr = false;
    var panErr = false;

    if (user.name.trim().length === 0) {
      nameErr = true;
    }

    if (user.age.trim().length === 0) {
      ageErr = true;
    }


    if (user.pan.trim().length === 0) {
      panErr = true;
    }

    if (user.phone.trim().length === 0) {
      phoneErr = true;
    }

    if (user.email.trim().length === 0 || !user.email.trim().match(mailFormat)) {
      emailErr = true;
    }

    if (nameErr || emailErr || ageErr || phoneErr || panErr) {
      setErrors({
        nameError: nameErr,
        emailError: emailErr,
        ageError: ageErr,
        phoneError: phoneErr,
        panError: panErr
      });
      return;
    }
    // sendFileToIPFS();
    console.log(user);
      addUser(user);
    //reset user
    setUser({
      ...user,
      name: "",
      email: "",
      walletaddress: "",
      age: "",
      pan: "",
      phone: "",
      filehash: "",
    })
    // reset errors
    setErrors({
      nameError: false,
      emailError: false,
      ageError: false,
      phoneError: false,
      panError: false,
    });
  };

  return (
    <DashboardLayout>
      <MDBox mb={2} />
      <Header name={user.name} verified={user.verified} registered={registered}>
        {notification && (
          <MDAlert color="info" mt="20px">
            <MDTypography variant="body2" color="white">
              Your profile has been updated
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
            {user.filehash ? <><MDTypography id="modal-modal-title" variant="h6" component="h2">
              Preview
            </MDTypography>
                <CardMedia
                  image={`https://ipfs.io/ipfs/${user.filehash}`} component="img"
                  height="700" sx={{objectFit: "contain" }} />
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
          <MDBox display="flex" flexDirection="row" mt={5} mb={3}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              mr={2}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
                Name
              </MDTypography>
              <MDBox mb={2} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="name"
                  value={user.name}
                  onChange={changeHandler}
                  error={errors.nameError}
                  disabled={registered}
                />
                {errors.nameError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    The name can not be null
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
                Wallet Address
              </MDTypography>
              <MDBox mb={1} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="walletaddress"
                  value={user.account ? user.account : ""}
                  disabled={true}
                />
              </MDBox>
            </MDBox>
          </MDBox>
          {/* Age */}
          <MDBox display="flex" flexDirection="row" mt={5} mb={3}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              mr={2}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
                Age
              </MDTypography>
              <MDBox mb={2} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="age"
                  value={user.age}
                  onChange={changeHandler}
                  error={errors.ageError}
                  disabled={registered}
                />
                {errors.ageError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    The age can not be null
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
            {/* Email */}
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              ml={2}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
                Email
              </MDTypography>
              <MDBox mb={1} width="100%">
                <MDInput
                  type="email"
                  fullWidth
                  name="email"
                  value={user.email}
                  onChange={changeHandler}
                  error={errors.emailError}
                  disabled={registered}
                />
                {errors.emailError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    The email must be valid
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          </MDBox>
          <MDBox display="flex" flexDirection="row" mt={5} mb={3}>
            {/* Pan */}
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
              mr={2}
            >
              <MDTypography variant="body2" color="text" ml={1} fontWeight="regular">
                PAN Number
              </MDTypography>
              <MDBox mb={1} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="pan"
                  value={user.pan}
                  onChange={changeHandler}
                  error={errors.panError}
                  disabled={registered}
                />
                {errors.panError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    The pan must be valid
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
                Phone Number
              </MDTypography>
              <MDBox mb={2} width="100%">
                <MDInput
                  type="name"
                  fullWidth
                  name="phone"
                  value={user.phone}
                  onChange={changeHandler}
                  error={errors.phoneError}
                  disabled={registered}
                />
                {errors.phoneError && (
                  <MDTypography variant="caption" color="error" fontWeight="light">
                    The phone number can not be null
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
              ml={2}
              mt={1}
            >
              {!registered && <><MDTypography variant="body2" color="text" mr={5} fontWeight="regular" width="100%">
                Upload Aadhar
              </MDTypography>
                <MDBox mb={1} width="70%">
                  <input accept="image/*" multiple type="file" onChange={(e) => setFileImg(e.target.files[0])} required />
                </MDBox></>}
              {registered && <><MDTypography variant="body2" color="text" mr={5} fontWeight="regular" width="100%">
                View Aadhar Card
              </MDTypography><MDButton variant="gradient" color="info" onClick={handleOpen}>
                  <VisibilityIcon fontSize="inherit" />
                </MDButton></>}
            </MDBox>
          </MDBox>
          <MDBox display="flex" flexDirection="column" mb={3}>
            <MDBox display="flex"
              flexDirection="row"
              justifyContent="end"
              width="100%"
              mr={7}>
              <MDBox mt={4} display="flex">
                {!registered && <MDButton variant="gradient" color="info" type="submit">
                  Submit
                </MDButton>}
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
      </Header>
    </DashboardLayout>
  );
};

export default UserProfile;
