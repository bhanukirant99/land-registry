import * as React from 'react';
import { useState, useEffect } from "react";

/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

// To fetch data from backend
import getWeb3 from "getWeb3/getWeb3";
import LandRegistry from "abis/LandRegistry.json";

export default function UserViewTable() {

  const [userCount, setUserCount] = useState(0);
  const [details, setdetails] = useState({
    LandInstance: undefined,
    account: null,
    web3: null,
  });

  const [users, setUsers] = useState([]);

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
      const userCount = await instance.methods.userCount().call();
      setUserCount(userCount);
      const acc = await instance.methods.getUsers().call();
      for (var i = 0; i < acc.length; i++) {
        const user = await instance.methods.users(acc[i]).call();
        if (user.verified) {
          setUsers(prevUsers => [...prevUsers, {
            // Sl_no: i + 1,
            Account_Address:acc[i],
            Name: user.name,
            Age: user.age,
            Email: user.email,
            phone_num: user.phone_num,
            Aadhaar_Doc: <u><a href={`https://ipfs.io/ipfs/${user.aadharIpfsHash}`} target="_blank">Aadhar Card</a></u>,
            PAN_Number: user.pan_num,
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
        { Header: "Account Address", accessor: "Account_Address", width: "45%", align: "left" },
        { Header: "Name", accessor: "Name", align: "left" },
        { Header: "Age", accessor: "Age", align: "center" },
        { Header: "Email", accessor: "Email", align: "center" },
        { Header: "Phone Number", accessor: "phone_num", align: "center" },
        { Header: "Aadhaar Document", accessor: "Aadhaar_Doc", align: "left" },
        { Header: "PAN Number", accessor: "PAN_Number", align: "center" },
      ],
  
      rows:users,
    };
  
}



