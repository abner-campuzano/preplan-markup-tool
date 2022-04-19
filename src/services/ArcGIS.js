import PSPDFKit from "pspdfkit";
const ArcGISHelper = {
    attatchPDFtoAssignment: async function (instance) {


        const arrayBuffer = await instance.exportPDF();
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const formData = new FormData();
        formData.append("multipart", "true");
        formData.append("attachment", blob);
        fetch(
            "https://gis.southmetro.org/arcgis/rest/services/Hosted/assignments_b77065eb42c84954bf9b4897a2b042b1/FeatureServer/0/10443/addAttachment&token=A79jprp3Zmholb_3KuSECmeF8WcV3vtzfCdq0Uhm2TM3PAay_142NqDDOS6uEfpiVctDsPo9LEFB_n2O76bLcEUTAFZnbEhlgn45Q8QBpgMtw_jFxvLijhKRNEIeWZWCbs6YcxTYGNxb9nC-KeH5wyNRLT7oITojcQRMhZekp3pk_6Gw-i333LziMdwdEKhg&f=json", {
            method: "POST",
            body: formData
        }).then(response => response.json());
    }
};

export default ArcGISHelper;