import { getEnvDetails, getLoginChallengeId, getServiceEnvDetails } from 'csc-react-native-sdk';
import base64 from 'react-native-base64'

export const generateTempToken = async (email, mode) => {
    // let base64 = require("base-64"); // install it before use from npm i base-64

    const username = "J1EFAQR-H0N4921-QCXKVNH-6W9ZYY9";
    const password = "CFR472795Q42TTQJFV84M37A5G4SJ1EFAQRH0N4921QCXKVNH6W9ZYY9";

    //function for Fetching data from API
    const API_BASE_URL = getEnvDetails(mode);
    const url = `${API_BASE_URL}/client/generate-temp-token`;
    const raw = JSON.stringify({
        "email": email
    });
    console.log(raw);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: "Basic " + base64.encode(username + ":" + password),
            },
            body: raw,
        });
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    } finally {

    }

}

export const autoLoginView = async (tempToken, clientId, email, phoneNumber, currentStackName, navigation, mode) => {

    const API_BASE_URL = getEnvDetails(mode);
    const loginChallengeId = await getLoginChallengeId(API_BASE_URL);
    const FRONT_END_BASE_URL = getServiceEnvDetails(mode);
    try {

        const REDIRECT_URL = `${FRONT_END_BASE_URL}/auto-login-user?id=${tempToken}&clientId=${clientId}&phone=${phoneNumber}&email=${email}&loginChallengeId=${loginChallengeId}`


        navigation.navigate('ConscentWebView', {
            REDIRECT_URL: REDIRECT_URL,
            currentStackName: currentStackName,
            mode
        });

        // return REDIRECT_URL;
    } catch (error) {
        // if (Conscent._app_mode == AppMode.DEBUG) {
        //     console.warn(error);
        // }
    }

}
