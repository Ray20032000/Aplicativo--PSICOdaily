import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Search, CalendarDays, User, House, ClipboardList, Wallet } from "lucide-react-native";
import TelaInicial from "./screens/TelaInicial";
import Login from "./screens/Login";
import Cadastro from "./screens/Cadastro";
import EsqueciSenha from "./screens/EsqueciSenha";
import AlterarSenha from "./screens/AlterarSenha";
import AtivarConta from "./screens/AtivarConta";
import Marketplace from "./screens/Marketplace";
import DescricaoPsicologo from "./screens/DescricaoPsicologo";
import Pagamento from "./screens/Pagamento";
import Sessoes from "./screens/Sessoes";
import Perfil from "./screens/Perfil";
import Dashboard from "./screens/Dashboard";
import Notas from "./screens/Notas";
import Diario from "./screens/Diario";
import Portal from "./screens/Paineis/Portal";
import Modulo from "./screens/Paineis/Modulo";
import Mensagens from "./screens/Mensagens";
import Artigos from "./screens/Artigos";
import Questionario from "./screens/Questionario";
import Institucional from "./screens/Institucional";
import Preferencias from "./screens/Preferencias";
import CadastroProfissional from "./screens/CadastroProfissional";
import Prontuario from "./screens/Prontuario";
import AgendaProfissional from "./screens/AgendaProfissional";
import Assinaturas from "./screens/Assinaturas";
import Carteira from "./screens/Carteira";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  const [tipo, setTipo] = useState("PACIENTE");
  useEffect(() => { AsyncStorage.getItem("@psicodaily_tipo_usuario").then((role) => role && setTipo(role.toUpperCase())).catch(() => {}); }, []);
  const profissional = ["PSICOLOGO", "PSIQUIATRA"].includes(tipo);
  return <Tab.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarStyle: { height: 65, paddingBottom: 6, paddingTop: 5, backgroundColor: "#0759A8" },
    tabBarActiveTintColor: "#FFFFFF", tabBarInactiveTintColor: "#BFE4FF",
    tabBarLabelStyle: { fontFamily: "Poppins", fontSize: 9 },
    tabBarIcon: ({ color, size }) => {
      if (route.name === "Profissionais") return <Search color={color} size={size} />;
      if (["Sessoes", "Agenda"].includes(route.name)) return <CalendarDays color={color} size={size} />;
      if (route.name === "Perfil") return <User color={color} size={size} />;
      if (route.name === "Carteira") return <Wallet color={color} size={size} />;
      if (route.name === "DiarioLista") return <ClipboardList color={color} size={size} />;
      return <House color={color} size={size} />;
    },
  })}>
    {tipo === "PACIENTE" ? <>
      <Tab.Screen name="Profissionais" component={Marketplace} />
      <Tab.Screen name="Sessoes" component={Sessoes} options={{ title: "Sessoes" }} />
      <Tab.Screen name="Perfil" component={Perfil} />
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="DiarioLista" component={Notas} options={{ title: "Diario" }} />
    </> : profissional ? <>
      <Tab.Screen name="Agenda" component={AgendaProfissional} />
      <Tab.Screen name="Carteira" component={Carteira} />
      <Tab.Screen name="Dashboard" component={Portal} />
      <Tab.Screen name="Perfil" component={Perfil} />
    </> : <>
      <Tab.Screen name="Dashboard" component={Portal} />
      <Tab.Screen name="Perfil" component={Perfil} />
    </>}
  </Tab.Navigator>;
}

export default function App() {
  const [fontsLoaded] = useFonts({ Poppins: require("./assets/fonts/Poppins/Poppins-Regular.ttf"), ReenieBeanie: require("./assets/fonts/Reenie_Beanie/ReenieBeanie-Regular.ttf") });
  if (!fontsLoaded) return null;
  return <NavigationContainer><Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TelaInicial" component={TelaInicial} />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Cadastro" component={Cadastro} />
    <Stack.Screen name="CadastroProfissional" component={CadastroProfissional} />
    <Stack.Screen name="EsqueciSenha" component={EsqueciSenha} />
    <Stack.Screen name="AlterarSenha" component={AlterarSenha} />
    <Stack.Screen name="AtivarConta" component={AtivarConta} />
    <Stack.Screen name="AppTabs" component={AppTabs} />
    <Stack.Screen name="Portal" component={Portal} />
    <Stack.Screen name="Modulo" component={Modulo} />
    <Stack.Screen name="Mensagens" component={Mensagens} />
    <Stack.Screen name="Artigos" component={Artigos} />
    <Stack.Screen name="Questionario" component={Questionario} />
    <Stack.Screen name="Preferencias" component={Preferencias} />
    <Stack.Screen name="Prontuario" component={Prontuario} />
    <Stack.Screen name="AgendaProfissional" component={AgendaProfissional} />
    <Stack.Screen name="Assinaturas" component={Assinaturas} />
    <Stack.Screen name="Carteira" component={Carteira} />
    <Stack.Screen name="Institucional" component={Institucional} />
    <Stack.Screen name="DescricaoPsicologo" component={DescricaoPsicologo} />
    <Stack.Screen name="Pagamento" component={Pagamento} />
    <Stack.Screen name="Diario" component={Diario} />
  </Stack.Navigator></NavigationContainer>;
}
