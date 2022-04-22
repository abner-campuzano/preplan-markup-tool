
const ArcGISHelper = {
    attatchPDFtoAssignment: async function (instance, objectId) {

        console.log("objectId=" + objectId);

        const arrayBuffer = await instance.exportPDF();
        console.log(arrayBuffer);
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        console.log(blob);
        const formData = new FormData();
        formData.append("token", "UhKW5huFWlgSaFDp550RiMI5oCfET5qdrFtC_3ljzgKvFLOqrcVHhsHw1aC3dvHoGTzRe16_m9VBTZ5ILNRdKFBGVPVFl1E2uUFzxwS_eUUio4TONYlup3qiq3maN-RELTZqP4mkC1UpXYb2Ls39xlrtHrekUbS9n3Aj3nIhu0LMMHegy405CQTcCwDRxpX9NsnQCeKwTwVCe66yjmjwZt9b7H54Zwxi6XKCMat48eGQ2aEiwiDyjf134X0tyR0p");
        formData.append("attachment", blob);
        formData.append("f", "json");
        fetch(
            `https://gis.southmetro.org/arcgis/rest/services/Hosted/workforce_9bce7612ad40407881aefb4d6ced6232/FeatureServer/0/${objectId}/addAttachment`,
            {
                method: "POST",
                referrer:"https://ambitious-sand-0bf74c810.1.azurestaticapps.net",
                body: formData
            }).then(response => console.log(response.json()));
    }
};

export default ArcGISHelper;