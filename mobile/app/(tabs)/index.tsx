import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform, StyleSheet, BackHandler } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
    }),
});

async function sendPushNotification(expoPushToken: string) {
    const message = {
        to: expoPushToken,
        sound: "default",
        title: "Original Title",
        body: "And here is the body!",
        data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
    });
}

function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("app_notify", {
            name: "app_notify",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
            sound: "mixkit.wav",
            audioAttributes: {
                contentType: Notifications.AndroidAudioContentType.SONIFICATION,
                usage: Notifications.AndroidAudioUsage.NOTIFICATION,
            },
        });
        const channels = await Notifications.getNotificationChannelsAsync();
        console.log("Notification Channels:", channels);
    }

    if (Device.isDevice) {
        const settings = await Notifications.getPermissionsAsync();
        let finalStatus = settings.status;
        if (settings.status !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync({
                ios: {
                    allowSound: true,
                    allowAlert: true,
                    allowBadge: true,
                },
            });
            finalStatus = status;
        }
        if (finalStatus !== "granted") {
            handleRegistrationError("Permission not granted to get push token for push notification!");
            return;
        }
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            handleRegistrationError("Project ID not found");
        }
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log(pushTokenString);
            return pushTokenString;
        } catch (e: unknown) {
            handleRegistrationError(`${e}`);
        }
    } else {
        handleRegistrationError("Must use physical device for push notifications");
    }
}

export default function App() {
    const [expoPushToken, setExpoPushToken] = useState("");
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);

    useEffect(() => {
        registerForPushNotificationsAsync()
            .then((token) => setExpoPushToken(token ?? ""))
            .catch((error: any) => setExpoPushToken(`${error}`));

        const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log(response);
        });

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, []);
    const webViewRef = useRef<WebView>(null);
    const [canGoBack, setCanGoBack] = useState(false);

    // Handle back button press
    useEffect(() => {
        const onBackPress = () => {
            if (canGoBack && webViewRef.current) {
                webViewRef.current.goBack();
                return true; // prevent app from exiting
            }
            return false; // allow default back action (exit app)
        };

        const event = BackHandler.addEventListener("hardwareBackPress", onBackPress);

        return () => event.remove();
    }, [canGoBack, expoPushToken]);
    console.log("Expo Push Token:", expoPushToken);

    if (!expoPushToken) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={styles.text}>Loading...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ uri: "http://192.168.1.31:3000" }}
                style={{ flex: 1 }}
                onMessage={(event) => {
                    console.log("Message received from WebView:", event.nativeEvent.data);
                }}
                renderLoading={
                    () => (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <Text style={styles.text}>Loading...</Text>
                        </View>
                    )
                }
                onNavigationStateChange={(navState) => {
                    // You can also check for specific URLs here if needed
                    setCanGoBack(navState.canGoBack);
                    console.log("Navigated to:", navState.url);
                }}
                injectedJavaScriptBeforeContentLoaded={
                    `window.pushToken = "${expoPushToken}"; true;` // Ensure the script evaluates to true
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    text: {
        fontSize: 25,
        fontWeight: "500",
    },
});
