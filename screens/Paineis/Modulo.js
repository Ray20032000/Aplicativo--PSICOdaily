import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, RefreshCw } from "lucide-react-native";

const API = "https://api.psicodaily.tech";
const requests = {
  Agenda: ["/api/consultas/", "consultas"],
  Prontuario: ["/api/consultas/", "consultas"],
  Carteira: ["/api/pagamentos/ganhos", "ganhos"],
  Assinaturas: ["/api/assinaturas/me", "assinatura"],
  Mensagens: ["/api/chat/", "conversas"],
  Artigos: ["/api/artigos/", "artigos"],
  Preferencias: ["/api/usuarios/me/preferencias", "preferencias"],
  Questionario: ["/api/usuarios/me/preferencias", "preferencias"],
  Administracao: ["/api/usuarios/", "usuarios"],
};
const adminTabs = [["Usuários", "/api/usuarios/"], ["Métricas", "/api/admin/metricas"], ["Reembolsos", "/api/admin/reembolsos"], ["Repasses", "/api/admin/repasses"], ["Auditoria", "/api/admin/auditoria"]];
async function lerResposta(response) {
  const text = await response.text();
  if (!text.trim()) return {};
  try { return JSON.parse(text); }
  catch { throw new Error("O servidor retornou uma resposta inválida. Tente novamente."); }
}
function listFrom(value) { if (Array.isArray(value)) return value; if (!value || typeof value !== "object") return []; const list = Object.values(value).find(Array.isArray); return list || (Object.keys(value).length ? [value] : []); }
function labelFrom(item) { if (typeof item !== "object" || item === null) return String(item); return item.nome || item.paciente_nome || item.profissional_nome || item.titulo || item.email || item.status || item.acao || Object.entries(item).slice(0, 3).map(([k,v]) => `${k.replaceAll("_", " ")}: ${typeof v === "object" ? "" : String(v)}`).join(" · "); }

export default function Modulo() {
  const navigation = useNavigation(); const route = useRoute();
  const { title = "Área Psicodaily", detail = "", module = "" } = route.params || {};
  const [data, setData] = useState(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [adminPath, setAdminPath] = useState(route.params?.adminPath || adminTabs[0][1]);
  useEffect(() => { if (route.params?.adminPath) setAdminPath(route.params.adminPath); }, [route.params?.adminPath]);
  const load = useCallback(async (pathOverride) => {
    setLoading(true); setError("");
    try { const token = await AsyncStorage.getItem("@psicodaily_token"); const path = pathOverride || requests[module]?.[0] || "/api/dashboard/";
      const response = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      const payload = await lerResposta(response); if (!response.ok) throw new Error(payload.error || payload.message || "Não foi possível carregar esta área."); setData(payload);
    } catch (e) { setError(e.message || "Não foi possível conectar à plataforma."); setData(null); } finally { setLoading(false); }
  }, [module]);
  useFocusEffect(useCallback(() => { load(module === "Administracao" ? adminPath : undefined); }, [load, module, adminPath]));
  const isAdmin = module === "Administracao";
  const rows = data ? listFrom(data) : [];
  const executarAdmin = (item) => {
    const reembolso = adminPath.includes("reembolsos");
    const id = item?.[reembolso ? "reembolso_id" : "repasse_id"];
    if (!id || item.status !== "PENDENTE") return;
    Alert.alert("Confirmar baixa manual", "Use esta ação apenas se o pagamento já foi realizado fora do Psicodaily.", [
      { text: "Voltar", style: "cancel" },
      { text: "Marcar como pago", onPress: async () => {
        setBusy(true);
        try {
          const token = await AsyncStorage.getItem("@psicodaily_token");
          const endpoint = `/api/admin/${reembolso ? "reembolsos" : "repasses"}/${id}/pagar`;
          const response = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ manual: true }) });
          const payload = await lerResposta(response);
          if (!response.ok) throw new Error(payload.error || "Não foi possível atualizar o pagamento.");
          await load(adminPath);
        } catch (e) { Alert.alert("Ação não concluída", e.message); }
        finally { setBusy(false); }
      } },
    ]);
  };
  const fecharRepasses = () => Alert.alert("Gerar repasses", "Criar repasses pendentes para os pagamentos elegíveis?", [
    { text: "Cancelar", style: "cancel" },
    { text: "Gerar", onPress: async () => {
      setBusy(true);
      try { const token = await AsyncStorage.getItem("@psicodaily_token"); const response = await fetch(`${API}/api/admin/repasses`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); const payload = await lerResposta(response); if (!response.ok) throw new Error(payload.error || "Não foi possível gerar os repasses."); await load(adminPath); }
      catch (e) { Alert.alert("Repasses", e.message); }
      finally { setBusy(false); }
    } },
  ]);
  return <View style={styles.page}>
    <View style={styles.header}><Pressable onPress={() => navigation.goBack()} style={styles.back}><ArrowLeft color="#315B7A" size={20} /></Pressable><View style={{ flex: 1 }}><Text style={styles.title}>{title}</Text><Text style={styles.detail}>{detail}</Text></View><Pressable onPress={() => load(isAdmin ? adminPath : undefined)}><RefreshCw color="#0875C9" size={19} /></Pressable></View>
    {isAdmin ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>{adminTabs.map(([label, path]) => <Pressable key={path} onPress={() => setAdminPath(path)} style={[styles.tab, adminPath === path && styles.tabActive]}><Text style={[styles.tabText, adminPath === path && styles.tabTextActive]}>{label}</Text></Pressable>)}</ScrollView> : null}
    {loading ? <View style={styles.state}><ActivityIndicator color="#0875C9" size="large" /><Text style={styles.muted}>Carregando...</Text></View> : error ? <Pressable onPress={() => load(isAdmin ? adminPath : undefined)} style={styles.state}><Text style={styles.error}>{error}</Text><Text style={styles.muted}>Toque para tentar novamente</Text></Pressable> : <ScrollView contentContainerStyle={styles.body}>
      {module === "Administracao" && adminPath.includes("usuarios") ? <View style={styles.searchHint}><Text style={styles.rowTitle}>Contas da plataforma</Text><Text style={styles.rowSub}>A listagem é protegida para administradores.</Text></View> : null}
      {isAdmin && adminPath.endsWith("/repasses") ? <Pressable disabled={busy} onPress={fecharRepasses} style={styles.adminAction}><Text style={styles.adminActionText}>{busy ? "Processando..." : "Gerar repasses pendentes"}</Text></Pressable> : null}
      {rows.length ? rows.slice(0, 60).map((item, index) => <View key={String(item.id || item.id_usuario || item.id_consulta || item.sessao_id || item.repasse_id || item.reembolso_id || index)} style={styles.row}><View style={styles.dot} /><View style={{ flex: 1 }}><Text style={styles.rowTitle}>{labelFrom(item) || `${title} ${index + 1}`}</Text><Text style={styles.rowSub}>{Object.entries(item || {}).filter(([key, value]) => !["nome", "paciente_nome", "profissional_nome", "titulo"].includes(key) && (typeof value === "string" || typeof value === "number")).slice(0, 2).map(([k,v]) => `${k.replaceAll("_", " ")}: ${v}`).join(" · ")}</Text>{isAdmin && ["PENDENTE"].includes(item.status) && (adminPath.includes("reembolsos") || adminPath.includes("repasses")) ? <Pressable disabled={busy} onPress={() => executarAdmin(item)} style={styles.rowAction}><Text style={styles.rowActionText}>Marcar pago fora da plataforma</Text></Pressable> : null}</View></View>) : <View style={styles.empty}><Text style={styles.emptyTitle}>{error ? "" : "Tudo em dia"}</Text><Text style={styles.muted}>{error ? "" : "Ainda não há informações para exibir nesta seção."}</Text></View>}
    </ScrollView>}
  </View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#EAF5FC" }, header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "white" }, back: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#EFF7FC", alignItems: "center", justifyContent: "center" }, title: { color: "#143B61", fontSize: 18, fontFamily: "Poppins" }, detail: { color: "#718096", fontSize: 11, marginTop: 2 }, body: { padding: 15, paddingBottom: 30 }, row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: "white", borderRadius: 13, marginBottom: 8 }, dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#62A9DF" }, rowTitle: { color: "#163B63", fontFamily: "Poppins", fontSize: 13 }, rowSub: { color: "#718096", fontSize: 10, marginTop: 4 }, state: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 }, muted: { color: "#718096", fontSize: 12, textAlign: "center" }, error: { color: "#B42318", fontSize: 13, textAlign: "center" }, empty: { padding: 30, alignItems: "center" }, emptyTitle: { color: "#163B63", fontSize: 16, fontFamily: "Poppins", marginBottom: 6 }, tabs: { padding: 12, gap: 8 }, tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18, backgroundColor: "white" }, tabActive: { backgroundColor: "#0875C9" }, tabText: { color: "#516579", fontSize: 11 }, tabTextActive: { color: "white" }, searchHint: { backgroundColor: "white", padding: 14, borderRadius: 12, marginBottom: 10 }, adminAction: { backgroundColor: "#0759A8", padding: 12, alignItems: "center", borderRadius: 11, marginBottom: 11 }, adminActionText: { color: "white", fontFamily: "Poppins", fontSize: 12 }, rowAction: { backgroundColor: "#EAF5FC", padding: 8, borderRadius: 8, marginTop: 9, alignSelf: "flex-start" }, rowActionText: { color: "#0759A8", fontSize: 10, fontFamily: "Poppins" } });
