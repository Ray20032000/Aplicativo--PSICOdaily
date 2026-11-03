import { useNavigation, useRoute } from "@react-navigation/native";
import {
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    LockKeyhole,
    QrCode,
    UserRound,
} from "lucide-react-native";

function moeda(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero)
        ? numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "R$ 160,00";
}

function urlImagemQr(pagamento) {
    const qr = pagamento.qr_code_base64 || pagamento.qrCodeBase64 || pagamento.qr_code_url || pagamento.qrCodeUrl;
    if (!qr) return null;
    if (qr.startsWith("data:image/")) return qr;
    if (/^https?:\/\//i.test(qr)) return qr;
    return `data:image/png;base64,${qr}`;
}

function formatarData(dataConsulta) {
    if (!dataConsulta) return "Data não informada";
    const data = new Date(`${dataConsulta}T12:00:00`);
    return Number.isNaN(data.getTime())
        ? String(dataConsulta)
        : data.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function Pagamento() {
    const navigation = useNavigation();
    const route = useRoute();
    const {
        psicologo = {},
        dataConsulta,
        horarioConsulta,
        valorConsulta = 160,
        pagamento = {},
    } = route.params || {};

    const nome = psicologo.nome || psicologo.nome_completo || "Psicólogo";
    const foto = psicologo.foto_perfil || psicologo.foto || psicologo.imagem || psicologo.imagem_perfil;
    const imagemQr = urlImagemQr(pagamento);
    const pixCopiaECola = pagamento.pix_copia_e_cola || pagamento.pixCopiaECola || pagamento.qr_code_text;
    const valorExibicao = pagamento.valor || pagamento.amount || valorConsulta;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
                <Pressable onPress={() => navigation.goBack()} style={styles.voltar} accessibilityRole="button">
                    <ArrowLeft color="#52718A" size={18} />
                    <Text style={styles.textoVoltar}>Voltar</Text>
                </Pressable>

                <View style={styles.seloSeguro}>
                    <LockKeyhole color="#7E88E6" size={11} />
                    <Text style={styles.textoSelo}>Pagamento 100% seguro</Text>
                </View>
                <Text style={styles.titulo}>Finalize o pagamento</Text>
                <Text style={styles.subtitulo}>Confira os detalhes do seu agendamento e realize o pagamento via Pix.</Text>

                <View style={styles.cartaoConsulta}>
                    <Text style={styles.rotuloCartao}>Informações da consulta</Text>
                    <View style={styles.perfilPsicologo}>
                        {foto ? (
                            <Image source={{ uri: foto }} style={styles.foto} />
                        ) : (
                            <View style={styles.fotoFallback}><UserRound color="#6A7D8E" size={26} /></View>
                        )}
                        <View style={styles.dadosPsicologo}>
                            <Text style={styles.nomePsicologo}>{nome}</Text>
                            <Text style={styles.tipoPsicologo}>{psicologo.especialidade || psicologo.abordagem || "Psicólogo clínico"}</Text>
                            <Text style={styles.avaliacoes}>☆ {psicologo.nota || psicologo.avaliacao || "5"} · {psicologo.total_avaliacoes || 0} avaliações</Text>
                        </View>
                    </View>

                    <View style={styles.linhaInfo}>
                        <CalendarDays color="#5B9DDB" size={14} />
                        <Text style={styles.textoInfo}>{formatarData(dataConsulta)}</Text>
                    </View>
                    <View style={styles.linhaInfo}>
                        <Clock3 color="#5B9DDB" size={14} />
                        <Text style={styles.textoInfo}>{horarioConsulta || "Horário não informado"}</Text>
                    </View>
                    <View style={styles.linhaValor}>
                        <Text style={styles.textoInfo}>Valor da consulta</Text>
                        <Text style={styles.preco}>{moeda(valorExibicao)}</Text>
                    </View>
                </View>

                <View style={styles.cartaoPagamento}>
                    <Text style={styles.tituloPix}>Pagamento via Pix</Text>
                    <Text style={styles.descricaoPix}>Escaneie o QR Code abaixo e faça o pagamento de forma segura.</Text>
                    <Text style={styles.valorAPagar}>Valor a pagar: <Text style={styles.valorGrande}>{moeda(valorExibicao)}</Text></Text>

                    <View style={styles.qrContainer}>
                        {imagemQr ? (
                            <Image source={{ uri: imagemQr }} style={styles.imagemQr} resizeMode="contain" />
                        ) : (
                            <View style={styles.qrIndisponivel}>
                                <QrCode color="#8A95A3" size={44} />
                                <Text style={styles.textoQrIndisponivel}>QR Code Pix ainda não disponível</Text>
                            </View>
                        )}
                        {imagemQr ? <Text style={styles.marcaPix}>◆ pix</Text> : null}
                    </View>

                    {pixCopiaECola ? (
                        <View style={styles.codigoPixContainer}>
                            <Text style={styles.rotuloCodigo}>Ou copie o código Pix abaixo</Text>
                            <Text selectable style={styles.codigoPix}>{pixCopiaECola}</Text>
                            <Text style={styles.instrucaoCodigo}>Toque e segure o código para copiá-lo.</Text>
                        </View>
                    ) : null}

                    <View style={[styles.statusPagamento, imagemQr && styles.statusAguardando]}>
                        {imagemQr ? <Clock3 color="#2075EF" size={17} /> : <CheckCircle2 color="#8793A0" size={17} />}
                        <Text style={[styles.textoStatus, imagemQr && styles.textoStatusAguardando]}>
                            {imagemQr ? "Aguardando pagamento" : "Aguardando dados do Pix"}
                        </Text>
                    </View>
                    {!imagemQr ? (
                        <Text style={styles.avisoPix}>O QR Code será exibido quando o serviço de pagamento fornecer os dados Pix desta consulta.</Text>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E1F3FF" },
    conteudo: { flexGrow: 1, alignItems: "center", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 24 },
    voltar: { width: "100%", maxWidth: 520, flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 5 },
    textoVoltar: { color: "#52718A", fontFamily: "Poppins", fontSize: 10 },
    seloSeguro: { height: 21, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: "#B5BDF2", borderRadius: 12, backgroundColor: "#F5F5FF", marginTop: 3 },
    textoSelo: { color: "#757DDA", fontFamily: "Poppins", fontSize: 8 },
    titulo: { color: "#222A38", fontFamily: "Poppins", fontSize: 16, marginTop: 5 },
    subtitulo: { maxWidth: 300, color: "#697586", fontFamily: "Poppins", fontSize: 8, lineHeight: 12, textAlign: "center", marginTop: 2, marginBottom: 8 },
    cartaoConsulta: { width: "100%", maxWidth: 520, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FFFFFF", borderRadius: 14, elevation: 3 },
    rotuloCartao: { color: "#334155", fontFamily: "Poppins", fontSize: 9, marginBottom: 7 },
    perfilPsicologo: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#EDF0F3" },
    foto: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#E7EDF2" },
    fotoFallback: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#E7EDF2" },
    dadosPsicologo: { flex: 1 },
    nomePsicologo: { color: "#293342", fontFamily: "Poppins", fontSize: 10 },
    tipoPsicologo: { color: "#7A8492", fontFamily: "Poppins", fontSize: 7 },
    avaliacoes: { color: "#777F8D", fontFamily: "Poppins", fontSize: 7 },
    linhaInfo: { minHeight: 23, flexDirection: "row", alignItems: "center", gap: 7, borderBottomWidth: 1, borderBottomColor: "#F0F2F5" },
    textoInfo: { flex: 1, color: "#485466", fontFamily: "Poppins", fontSize: 8 },
    linhaValor: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 7 },
    preco: { color: "#202938", fontFamily: "Poppins", fontSize: 12 },
    cartaoPagamento: { width: "100%", maxWidth: 520, marginTop: 9, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: "#FFFFFF", borderRadius: 14, elevation: 3 },
    tituloPix: { color: "#1F2937", fontFamily: "Poppins", fontSize: 11 },
    descricaoPix: { color: "#667085", fontFamily: "Poppins", fontSize: 8, lineHeight: 12, marginTop: 1 },
    valorAPagar: { color: "#374151", fontFamily: "Poppins", fontSize: 8, marginTop: 11 },
    valorGrande: { color: "#111827", fontFamily: "Poppins", fontSize: 15 },
    qrContainer: { width: 142, height: 142, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 2, borderWidth: 1, borderColor: "#D7DCE2", borderRadius: 13, backgroundColor: "#FFFFFF", elevation: 2 },
    imagemQr: { width: 124, height: 124 },
    qrIndisponivel: { alignItems: "center", gap: 7, paddingHorizontal: 12 },
    textoQrIndisponivel: { color: "#818B98", fontFamily: "Poppins", fontSize: 8, textAlign: "center" },
    marcaPix: { position: "absolute", bottom: 3, color: "#27B4A0", fontFamily: "Poppins", fontSize: 8, backgroundColor: "#FFFFFF", paddingHorizontal: 4 },
    codigoPixContainer: { marginTop: 10 },
    rotuloCodigo: { color: "#334155", fontFamily: "Poppins", fontSize: 8 },
    codigoPix: { color: "#748094", fontFamily: "Poppins", fontSize: 7, marginTop: 3, padding: 6, backgroundColor: "#F2F4F6", borderRadius: 5 },
    instrucaoCodigo: { color: "#858B96", fontFamily: "Poppins", fontSize: 7, marginTop: 2 },
    statusPagamento: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 12, borderWidth: 1, borderColor: "#CBD2DA", borderRadius: 8, backgroundColor: "#F5F7F9" },
    statusAguardando: { borderColor: "#3188F1", backgroundColor: "#EAF3FF" },
    textoStatus: { color: "#718096", fontFamily: "Poppins", fontSize: 9 },
    textoStatusAguardando: { color: "#1263CE" },
    avisoPix: { color: "#7D8794", fontFamily: "Poppins", fontSize: 8, lineHeight: 12, textAlign: "center", marginTop: 7 },
});
