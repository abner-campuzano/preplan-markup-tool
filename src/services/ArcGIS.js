const ArcGISHelper = {

    getToken: async function () {
        const { response } = await fetch(`/api/ESRIAuth`);
        console.log("token");
        console.log(response);

        window.confirm("Hello");

        let token = "";
        return token;
    },

    attatchPDFtoAssignment: async function (instance, objectId, preplanId) {

        console.log("objectId=" + objectId);

        const arrayBuffer = await instance.exportPDF();
        console.log(arrayBuffer);
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        console.log(blob);
        const formData = new FormData();
        formData.append("token", await this.getToken());
        formData.append("attachment", blob, preplanId + "(reviewed).pdf");
        formData.append("multipart", true);
        formData.append("f", "json");
        return await fetch(
            `https://gis.southmetro.org/arcgis/rest/services/Hosted/workforce_9bce7612ad40407881aefb4d6ced6232/FeatureServer/0/${objectId}/addAttachment`,
            {
                method: "POST",
                //referrerPolicy: "same-origin",
                body: formData
            });
    }
};

export default ArcGISHelper;