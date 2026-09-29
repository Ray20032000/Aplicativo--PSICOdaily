import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import {
    Search,
    CalendarDays,
    User,
    House,
    ClipboardList
} from "lucide-react-native";

import TelaInicial from "./screens/TelaInicial";
import Login from "./screens/Login";
import Cadastro from "./screens/Cadastro";
import EsqueciSenha from "./screens/EsqueciSenha";
import AlterarSenha from "./screens/AlterarSenha";
import AtivarConta from "./screens/AtivarConta";


import Profissionais from "./screens/Profissionais";
import Sessoes from "./screens/Sessoes";
import Perfil from "./screens/Perfil";
import Dashboard from "./screens/Dashboard";
import Diario from "./screens/Diario";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();




function AppTabs() {
    return (
        <Tab.Navigator

            screenOptions={({ route }) => ({

                headerShown: false,

                tabBarStyle: {
                    height: 65,
                    paddingBottom: 6,
                    paddingTop: 5,
                    backgroundColor: "#8B8B8B",
                },

                tabBarActiveTintColor: "#FFFFFF",
                tabBarInactiveTintColor: "#FFFFFF",

                tabBarLabelStyle: {
                    fontFamily: "Poppins",
                    fontSize: 9,
                },

                tabBarIcon: ({ color, size }) => {

                    if (route.name === "Profissionais") {
                        return (
                            <Search
                                color={color}
                                size={size}
                            />
                        );
                    }

                    if (route.name === "Sessões") {
                        return (
                            <CalendarDays
                                color={color}
                                size={size}
                            />
                        );
                    }

                    if (route.name === "Perfil") {
                        return (
                            <User
                                color={color}
                                size={size}
                            />
                        );
                    }

                    if (route.name === "Dashboard") {
                        return (
                            <House
                                color={color}
                                size={size}
                            />
                        );
                    }

                    if (route.name === "Diário") {
                        return (
                            <ClipboardList
                                color={color}
                                size={size}
                            />
                        );
                    }

                },

            })}

        >

            <Tab.Screen
                name="Profissionais"
                component={Profissionais}
            />

            <Tab.Screen
                name="Sessões"
                component={Sessoes}
            />

            <Tab.Screen
                name="Perfil"
                component={Perfil}
            />

            <Tab.Screen
                name="Dashboard"
                component={Dashboard}
            />

            <Tab.Screen
                name="Diário"
                component={Diario}
            />

        </Tab.Navigator>
    );
}


export default function App() {

    const [fontsLoaded] = useFonts({
        Poppins: require("./assets/fonts/Poppins/Poppins-Regular.ttf"),
        ReenieBeanie: require("./assets/fonts/Reenie_Beanie/ReenieBeanie-Regular.ttf"),
    });

    if (!fontsLoaded) {
        return null;
    }

    return (

        <NavigationContainer>

            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >

                <Stack.Screen
                    name="TelaInicial"
                    component={TelaInicial}
                />

                <Stack.Screen
                    name="Login"
                    component={Login}
                />

                <Stack.Screen
                    name="Cadastro"
                    component={Cadastro}
                />

                <Stack.Screen
                    name="EsqueciSenha"
                    component={EsqueciSenha}
                />

                <Stack.Screen
                    name="AlterarSenha"
                    component={AlterarSenha}
                />

                <Stack.Screen
                    name="AtivarConta"
                    component={AtivarConta}
                />




                <Stack.Screen
                    name="AppTabs"
                    component={AppTabs}
                />

            </Stack.Navigator>

        </NavigationContainer>

    );
}