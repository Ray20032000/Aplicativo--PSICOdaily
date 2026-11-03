import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { CalendarDays, BookOpen, Wallet, Users, MessageCircle, FileText, Newspaper, Settings, ShieldCheck, HeartHandshake, ClipboardList, BadgeCheck } from "lucide-react-native";

const API = "https://p01--psicodaily-api--zfhqcbxfx5v8.code.run";
const grupos = {
  PACIENTE: [
    ["Diário de humor", "Acompanhe seus sentimentos e sua evolução", "Diario", BookOpen],
    ["Sessões", "Próximos atendimentos e histórico", "Sessoes", CalendarDays],
    ["Encontrar profissional", "Conheça psicólogos e agende sua consulta", "Profissionais", Users],
    ["Mensagens", "Converse com seu profissional", "Mensagens", MessageCircle],
    ["Artigos", "Conteúdos de saúde emocional", "Artigos", Newspaper],
    ["Questionário inicial", "Conte um pouco sobre o que você procura", "Questionario", ClipboardList],
    ["Preferências", "Ajuste suas preferências de cuidado", "Preferencias", Settings],
  ],
  PSICOLOGO: [
    ["Minha agenda", "Consulte suas sessões e pacientes", "Agenda", CalendarDays],
    ["Prontuários", "Acompanhe os registros dos pacientes", "Prontuario", FileText],
    ["Carteira", "Consulte seus recebimentos", "Carteira", Wallet],
    ["Mensagens", "Converse com seus pacientes", "Mensagens", MessageCircle],
    ["Assinatura", "Gerencie seu plano profissional", "Assinaturas", BadgeCheck],
    ["Artigos", "Conteúdos para sua prática", "Artigos", Newspaper],
  ],
  PSIQUIATRA: null,
  ADMIN: [
    ["Usuários", "Consulte e gerencie contas", "Administracao", Users],
    ["Métricas", "Acompanhe indicadores da plataforma", "Administracao", ShieldCheck],
    ["Financeiro", "Reembolsos e repasses", "Administracao", Wallet],
    ["Auditoria", "Atividade administrativa recente", "Administracao", ClipboardList],
    ["Meu perfil", "Edite seus dados de administrador", "Preferencias", Settings],
  ],
};
grupos.PSIQUIATRA = grupos.PSICOLOGO;

export default function Portal() {
  const navigation = useNavigation();
  const [nome, setNome] = useState("Olá");
  const [tipo, setTipo] = useState("PACIENTE");
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    (async () => {
      try {
        const [raw, token] = await Promise.all([AsyncStorage.getItem("@psicodaily_usuario"), AsyncStorage.getItem("@psicodaily_token")]);
        const usuario = raw ? JSON.parse(raw) : {};
        const papel = String(usuario.tipo_usuario || "PACIENTE").toUpperCase();
        if (ativo) { setNome(usuario.nome || "Olá"); setTipo(papel); }
        const endpoint = papel === "ADMIN" ? "/api/admin/metricas" : "/api/dashboard/";
        const response = await fetch(`${API}${endpoint}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
        const data = await response.json();
        if (response.ok && ativo) setResumo(data);
      } catch { /* O menu continua disponível quando a rede estiver fora. */ }
      finally { if (ativo) setCarregando(false); }
    })();
    return () => { ativo = false; };
  }, []));
  const paginas = grupos[tipo] || grupos.PACIENTE;
  const indicadores = resumo ? Object.entries(resumo).filter(([, value]) => typeof value === "number" || typeof value === "string").slice(0, 3) : [];
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <View style={styles.hero}><Text style={styles.eyebrow}>PSICODAILY · {tipo}</Text><Text style={styles.title}>{nome}, como podemos ajudar?</Text><Text style={styles.subtitle}>Seu espaço de cuidado, acompanhamento e gestão.</Text></View>
    {carregando ? <ActivityIndicator color="#0875C9" style={{ margin: 18 }} /> : null}
    {indicadores.length ? <View style={styles.stats}>{indicadores.map(([label, value]) => <View key={label} style={styles.stat}><Text style={styles.statValue}>{String(value)}</Text><Text style={styles.statLabel}>{label.replaceAll("_", " ")}</Text></View>)}</View> : null}
    <Text style={styles.section}>Acessos</Text>
    {paginas.map(([title, detail, route, Icon]) => <Pressable key={title} onPress={() => { const nativeRoutes = { Mensagens: "Mensagens", Artigos: "Artigos", Questionario: "Questionario", Preferencias: "Preferencias", Prontuario: "Prontuario", Agenda: "AgendaProfissional", Assinaturas: "Assinaturas", Carteira: "Carteira", Diario: "Diario" }; if (nativeRoutes[route]) navigation.navigate(nativeRoutes[route]); else if (route === "Sessoes") navigation.navigate("AppTabs", { screen: "Sessoes" }); else if (route === "Profissionais") navigation.navigate("AppTabs", { screen: "Profissionais" }); else navigation.navigate("Modulo", { title, detail, module: route, adminPath: ({ "Métricas": "/api/admin/metricas", "Financeiro": "/api/admin/reembolsos", "Auditoria": "/api/admin/auditoria" })[title] || "/api/usuarios/" }); }} style={({ pressed }) => [styles.card, pressed && { opacity: .8 }]}><View style={styles.icon}><Icon color="#0875C9" size={21} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardDetail}>{detail}</Text></View><Text style={styles.chevron}>›</Text></Pressable>)}
  </ScrollView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#EAF5FC" }, content: { padding: 18, paddingBottom: 32 }, hero: { backgroundColor: "#0759A8", borderRadius: 20, padding: 22, marginBottom: 20 }, eyebrow: { color: "#BFE4FF", fontSize: 11, fontFamily: "Poppins" }, title: { color: "white", fontSize: 22, fontFamily: "Poppins", marginTop: 8 }, subtitle: { color: "#E3F4FF", fontSize: 13, marginTop: 8, fontFamily: "Poppins" }, section: { color: "#163B63", fontSize: 17, fontFamily: "Poppins", marginBottom: 10 }, card: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 14, padding: 14, marginBottom: 9, gap: 12 }, icon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#E9F5FF", alignItems: "center", justifyContent: "center" }, cardTitle: { color: "#163B63", fontSize: 14, fontFamily: "Poppins" }, cardDetail: { color: "#718096", fontSize: 11, marginTop: 3 }, chevron: { fontSize: 25, color: "#91A2B5" }, stats: { flexDirection: "row", gap: 8, marginBottom: 18 }, stat: { flex: 1, backgroundColor: "white", borderRadius: 12, padding: 13 }, statValue: { fontSize: 18, color: "#0875C9", fontFamily: "Poppins" }, statLabel: { fontSize: 10, color: "#667085", textTransform: "capitalize" } });
