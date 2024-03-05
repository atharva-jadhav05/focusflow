import { gapi } from "gapi-script";
import React, { useEffect } from "react";
import { useLocation } from 'react-router-dom';
import StudySiteLandingPage from "./tempDash";;
import axios from 'axios';


const Dashboard = () => {
    // when navigate function in login.jsx sends data, it adds it to the /dashboard page's location data
    // so now we get data by using location
    
    
    
    const location = useLocation();
    const { state } = location;
    const [ profile, setProfile ] = useState([]);


    // state variable gets data in the format
    // tokenResponse: {
    //     clientId: "356377434224-gv1sfl0pk97qbiu2v2ub0fmsh8mh3plj.apps.googleusercontent.com"
    //     credential: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImVkODA2ZjE4NDJiNTg4MDU0YjE4YjY2OWRkMWEwOWE0ZjM2N2FmYzQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNTYzNzc0MzQyMjQtZ3Yxc2ZsMHBrOTdxYml1MnYydWIwZm1zaDhtaDNwbGouYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNTYzNzc0MzQyMjQtZ3Yxc2ZsMHBrOTdxYml1MnYydWIwZm1zaDhtaDNwbGouYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTczMzI1MTUxNjc1MzcxNzE3MTMiLCJlbWFpbCI6ImF0aGFydmFqYWRoYXY1OTFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5iZiI6MTcwODIxMDU2MywibmFtZSI6IkF0aGFydmEgSmFkaGF2IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0lPQUR0QkpaQU9NSzc1R3NFWnllQzRUeWRhWDE2U3dBclZZYnY3YXh4WHlBPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkF0aGFydmEiLCJmYW1pbHlfbmFtZSI6IkphZGhhdiIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNzA4MjEwODYzLCJleHAiOjE3MDgyMTQ0NjMsImp0aSI6IjQ1MDI1MGZmMTY3M2IxZDM3MGE5MTMwZWRmZWJiMjRhNTgwZWU3NzYifQ.gSswX2X5ARKc-pCsIBWgA3tsRJsMtzE4aGSZhFYsQdP3nk_kM-x7zbWXHfohuhSzdzZQ21gdaIxQkd0L6rZbQT9wcm6VX5Eo0YeNTxUrHEAXFLylbxjKcPEvGnh7Xc2RpjGKrOH3X9LsjGb7aBClu42AM1FVw2GqSPVisCvday9HZcPTgXcT_hBj0828ojhp_i2MBNKDin-9Ba_ZusHDt25fq4U3P_DdedaOEC4T118ZK99WvQLUKEEdFDnRImVc0EC2rXIbZbK0h1FZH7Tw2HQpOe6OPG1HpUkHrCq2LHT0rYU865cIJnIXPCmDXhTMeH7icS2w3QftiFsZc-l6DA"
    //     select_by: "btn"
    // } 

    // so we get the credential attribute from state cha tokenresponse chya aatun
    // if there, else assign null value to it
    
    const user = state?.res || null;

/**
 * Now use this access token to access google APIs and get data
 * for now, only print data on page or in console
 * check if data is coming
 * then we will do pudhcha
 * GOT IT?
 */

    useEffect(()=>{
        // function start() {
        //     gapi.client.init({
        //         apiKey: "AIzaSyArRkSGzgX3RQME6a0sCBMJBfLDSkX-IaM",
        //         client_id: "356377434224-gv1sfl0pk97qbiu2v2ub0fmsh8mh3plj.apps.googleusercontent.com",
        //         scope: "https://www.googleapis.com/auth/drive",
        //     })
        // };

        // gapi.load('client:auth2', start);

        console.log("Hello World")

        axios
                    .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: 'application/json'
                        }
                    })
                    .then((res) => {
                        setProfile(res.data);
                        console.log(res.data);
                        
                    })
                    .catch((err) => console.log(err));
            }, 
            [user]




        // var accessToken = gapi.auth.getToken().access_token;

        // fetch('https://www.googleapis.com/drive/v3/about', {
        //     method: "GET",
        //     headers: new Headers({'Authorization': 'Bearer ' + access_token})
        // }).then( (res) => {
        //     console.log(res);
        // }).then( function(val) {
        //     console.log(val);
        // });

    );


    return (
        <>
{/*         <h2>Getting access token here</h2>             */}
        <StudySiteLandingPage/>

            
        </>
    )
}

export default Dashboard;
