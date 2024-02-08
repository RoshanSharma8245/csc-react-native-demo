import React, { useEffect, useState, useRef } from 'react';

import { Alert, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

//PACKAGES
import { useFocusEffect } from '@react-navigation/native';
import PayWall, { getEventsEnvDetails, pageExist, onTouchListener, PopUp } from 'csc-react-native-sdk';
import DeviceInfo from "react-native-device-info";
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { autoLoginView, generateTempToken } from './api';


GoogleSignin.configure({
    webClientId: '784024490654-r5htgk5oletn228deq8fh6s85hsdn0pg.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
    offlineAccess: true,
    forceCodeForRefreshToken: true,
})

export default function ContentScreen(props) {

    const [scrollY, setScrollY] = useState(0)
    const paywallRef = useRef(null)
    const [userAgent, setUserAgent] = useState('')
    const [showPaywall, setShowPaywall] = useState(true)
    const [showContent, setShowContent] = useState(false);


    const { contentId, clientId, mode } = props?.route?.params

    const text = ['Where does it come from?\n\nContrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.']
    const premiumContent = ['Content Unlock \n Read premium content'];
    useEffect(() => {
        getUserAgent()
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            setShowPaywall(true);
            return () => {

                removePage()
            };
        }, [])
    );

    async function removePage() {
        const res = await pageExist(getEventsEnvDetails(mode), clientId, contentId, scrollY)
        console.log('Respones====>', JSON.stringify(res))
    }

    async function getUserAgent() {
        let newUserAgent = await DeviceInfo.getUserAgent();
        console.log('newUserAgent  ', newUserAgent);
        setUserAgent(newUserAgent)
    }

    const conscentMessage = async (message) => {
        if (message == 'GoogleLoginClick') {
            await GoogleSignin.signOut()
            signIn()
        }
    }

    const goBack = () => {
        props.navigation.goBack()
    }

    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            const email = userInfo.user.email;

            console.log(email);

            const data = await generateTempToken(email, mode);
            console.log(data);
            const tempToken = data?.tempAuthToken;

            await autoLoginView(tempToken, clientId, email, "", "ContentScreen", props.navigation, mode);



        } catch (error) {
            console.log('got error: ', error.message);
            setShowPaywall(true);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
            } else {
                // some other error happened
            }
        }
    };

    async function onStatusChange(result) {
        if (result?.successMessage == 'METERBANNER') {
            setShowPaywall(true);
            setShowContent(true);
        }
        else if (result?.successMessage == 'PAYWALL') {
            setShowPaywall(true);
            setShowContent(false);
        }
        else if (result?.successMessage == 'UNLOCK') {
            setShowPaywall(false);
            setShowContent(true);
        }
    }


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                onScroll={(e) => {
                    setScrollY(e.nativeEvent.contentOffset.y)
                    onTouchListener();
                }}>
                {
                    showContent ?
                        <Text>{premiumContent[0] + "\n\n" + text[0] + "\n\n" + text[0] + "\n\n" + text[0] + "\n\n" + text[0] + "\n\n" + text[0] + "\n\n" + text[0] + "\n\n" + text[0] + "\n\n" + text[0] + "\n\n" + text[0] + "\n\n" + text[0]}</Text> : <Text>{text[0] + "\n\n" + text[0] + "\n\n" + text[0]}</Text>
                }
            </ScrollView>
            {userAgent && showPaywall &&
                <PayWall
                    ref={paywallRef}
                    clientId={clientId}
                    contentId={contentId}
                    environment={mode}
                    userAgent={userAgent}
                    conscentMessage={conscentMessage}
                    onPaywallStatus={(result) => {
                        onStatusChange(result)
                    }}
                    onErrorMessage={(error) => {
                        console.log('Error', error)
                    }}
                    navigation={props?.navigation}
                    currentStackName={'ContentScreen'}
                    scrollY={scrollY}
                    goBack={() => {
                        goBack()
                    }} />
            }

            <PopUp
                environment={mode}
                currentStackName={'Content'}
                navigation={props?.navigation}
                scrollY={scrollY}
            />

        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});