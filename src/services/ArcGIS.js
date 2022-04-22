
const ArcGISHelper = {
    attatchPDFtoAssignment: async function (instance) {


        const arrayBuffer = await instance.exportPDF();
        console.log(arrayBuffer);
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        console.log(blob);
        const formData = new FormData();
        formData.append("token", "UhKW5huFWlgSaFDp550RiMI5oCfET5qdrFtC_3ljzgKvFLOqrcVHhsHw1aC3dvHoGTzRe16_m9VBTZ5ILNRdKFBGVPVFl1E2uUFzxwS_eUUio4TONYlup3qiq3maN-RELTZqP4mkC1UpXYb2Ls39xlrtHrekUbS9n3Aj3nIhu0LMMHegy405CQTcCwDRxpX9NsnQCeKwTwVCe66yjmjwZt9b7H54Zwxi6XKCMat48eGQ2aEiwiDyjf134X0tyR0p");
        formData.append("attachment", blob);
        fetch(
            "https://gis.southmetro.org/arcgis/rest/services/Hosted/assignments_b77065eb42c84954bf9b4897a2b042b1/FeatureServer/0/10443/addAttachment?f=json",
            {
                method: "POST",
                body: formData
            }).then(response => console.log(response.json()));
    }
};

export default ArcGISHelper;