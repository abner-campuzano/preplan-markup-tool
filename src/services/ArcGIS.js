
const ArcGISHelper = {
    attatchPDFtoAssignment: async function (instance) {


        const arrayBuffer = await instance.exportPDF();
        console.log(arrayBuffer);
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        console.log(blob);
        const formData = new FormData();
        formData.append("attachment", blob);
        fetch(
            "https://gis.southmetro.org/arcgis/rest/services/Hosted/assignments_b77065eb42c84954bf9b4897a2b042b1/FeatureServer/0/10443/addAttachment?multipart=true&filename=test.pdf&token=VR-2ox-RBiMunH8s7muYUB3BUa8cUB9jWaXmdMp8LorEKVQD4jL0Jqa2O2AmcNTeq8eKNc5L42On9erA0PClE2k24mq0GyeH32W0XloF9flQ44tRAz6sAmtiBL5gBSWuG2NNVXQrCKWXYTZxEIhyg3i3wpBBtabIErdEr4PmFYYIUzNF2doiKIRzXp947MwMDOsEkCumd7YOaNdIa_u0yA..&f=json",
            {
                method: "POST",
                body: formData
            }).then(response => console.log(response.json()));
    }
};

export default ArcGISHelper;