# csc-react-native-sdk

This is a step by step guide to include Conscent.ai package in your app. This package is developed in TypeScript and JavaScript.

## Installation
```npm install csc-react-native-sdk```


## Initialize SDK

In your App.js file include ConscentWebView component in `Stack.Navigator` 

~~~javascript
import { ConscentWebView } from 'csc-react-native-sdk';

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="your_initial_route">
        ...
        <Stack.Screen name="ConscentWebView" component={ConscentWebView}
          options={{
            headerShown: false
          }} />
      </Stack.Navigator>
    </NavigationContainer>

  );
};
~~~

## Initialize the paywall


- yourClientId : Pass your clientId received from Conscent.ai.
- yourContentId : This will be your article or content id for which detail needs to be checked.
- Mode can be set as :
  `STAGING`
  `SANDBOX`
  `LIVE`
- scroll-Y : Pass the scroll depth of your content screen
- userAgent : Pass userAgent of your device
- call removePage() in useFocusEffect
- onTouchListener() : call this method when user do any activity on screen

Define these states on content screen  
~~~javascript
    const [scrollY, setScrollY] = useState(0);
    const paywallRef = useRef(null);
    const [showPaywall, setShowPaywall] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [mode, setMode] = useState('SANDBOX');
~~~

Call Paywall and Pop-Up on top of your content screen 
~~~javascript
import PayWall, { getEventsEnvDetails, pageExist, onTouchListener, PopUp } from 'csc-react-native-sdk';

const userAgent = await DeviceInfo.getUserAgent();

useFocusEffect(
        React.useCallback(() => {
            setShowPaywall(true);
            return () => {
                removePage();
            };
        }, [])
);

async function removePage() {
        const res = await pageExist(getEventsEnvDetails(mode), clientId, contentId, scrollY)
 }

const conscentMessage = async (message) => {
        if (message == 'GoogleLoginClick') {
            googleSignIn();
        }
}

const googleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            const email = userInfo.user.email;

            const data = await genrateTempToken(email, mode);
            
            const tempToken = data?.tempAuthToken;
  
            await autoLoginView(tempToken, clientId, email, phoneNumber, currentStackScreenName, props.navigation, mode); // phoneNumber optional(pass empty string)



        } catch (error) {
            console.log('got error: ', error.message);
        }
}

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

const goBack = () => {
    // Go back to the previous screen
    props?.navigation.goBack();
}

return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                onScroll={(e) => {
                    setScrollY(e.nativeEvent.contentOffset.y)

                    // call this method when user do any activity on screen
                    onTouchListener();
                }}>
                {
                    showContent ?
                        <Text>{ showContent your full content }</Text> : <Text>{ showContent your locked content }</Text>
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
                    currentStackName={'Your_current_stack_name'}
                    navigation={props?.navigation}
                    scrollY={scrollY}
                    goBack={() => {
                        goBack()
                    }} />
            }

            <PopUp
                environment={mode}
                currentStackName={'Your_current_stack_name'}
                navigation={props?.navigation}
                scrollY={scrollY}
            />

        </SafeAreaView >
    )
~~~

## Paywall Listener 
implement onStatusChange method in your component
- METERBANNER : when receiving it then unlock content and show the paywall
- PAYWALL : when receiving it then lock content and show the paywall
- UNLOCK : when receiving it then unlock content and don't show the paywall

## Generate TempToken
Generate token api is a post api which gets email,phone number as a body parameter and generates auto login token 
- username : API Key gets from conscent dashboard
- password : API Secret gets from conscent dashboard
- getEnvDetails : call it to get base url of conscent api
  

~~~javascript
import { getEnvDetails, getLoginChallengeId, getServiceEnvDetails } from 'csc-react-native-sdk';
import base64 from 'react-native-base64'

export const generateTempToken = async (email, mode) => {

    const username = "J1EFAQR-H0N4921-QCXKVNH-6W9ZYY9"; // API Key get from conscent dashboard
    const password = "CFR472795Q42TTQJFV84M37A5G4SJ1EFAQRH0N4921QCXKVNH6W9ZYY9"; //API Secret get from conscent dashboard

    //function for Fetching data from API
    const API_BASE_URL = getEnvDetails(mode);
    const url = `${API_BASE_URL}/client/generate-temp-token`;
    const body = JSON.stringify({
        "email": email
    });
    console.log(body);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: "Basic " + base64.encode(username + ":" + password),
            },
            body: body,
        });
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    } finally {

    }

}
~~~


## Auto login
Auto login use webview to sign in user into ConsCent's system 
### Parameters to pass in autoLoginView
- tempToken : Gets from generateTempToken api
- clientId : Pass your clientId received from Conscent.ai.
- email : Pass user email gets from your google login
- phone : Pass phone number if you are sign in user through phone number
- currentStackScreenName : Pass your current stack screen component name
- navigation : Pass your navigation object for the current screen.
- mode : Pass your environment mode
- Mode can be set as :
  `STAGING`
  `SANDBOX`
  `LIVE`
  
~~~javascript
import { getEnvDetails, getLoginChallengeId, getServiceEnvDetails } from 'csc-react-native-sdk';

export const autoLoginView = async (tempToken, clientId, email, phoneNumber, currentStackScreenName, navigation, mode) => {

    const API_BASE_URL = getEnvDetails(mode);
    const loginChallengeId = await getLoginChallengeId(API_BASE_URL);
    const FRONT_END_BASE_URL = getServiceEnvDetails(mode);
    try {

        const REDIRECT_URL = `${FRONT_END_BASE_URL}/auto-login-user?id=${tempToken}&clientId=${clientId}&phone=${phoneNumber}&email=${email}&loginChallengeId=${loginChallengeId}`


        navigation.navigate('ConscentWebView', {
            REDIRECT_URL: REDIRECT_URL,
            currentStackName: currentStackScreenName,
            mode
        });

        
    } catch (error) {
       console.log(error);
    }

}
~~~

## Logout the User

~~~javascript
import { userLogout, getEnvDetails } from 'csc-react-native-sdk';

    // Call this method to logout from conscent
    userLogout(getEnvDetails(mode))
~~~



