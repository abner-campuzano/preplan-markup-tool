const ArcGISHelper = {

    getToken: async function () {
        const data = await fetch("/api/ESRIAuth");         
        const dataJson = await data.json();
        let token = dataJson.token;
        return token;
    },

    attatchPDFtoAssignment: async function (instance, objectId, preplanId) {

        const arrayBuffer = await instance.exportPDF();
        console.log(arrayBuffer);
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        console.log(blob);
        const formData = new FormData();
        const date = new Date();
        const fileName = `${preplanId}_${date.getDate()}_${date.getDay()}_${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.pdf`;
        formData.append("token", await this.getToken());
        formData.append("attachment", blob, fileName);
        formData.append("multipart", true);
        formData.append("f", "json");
        return await fetch(
            `https://gis.southmetro.org/arcgis/rest/services/Hosted/workforce_9bce7612ad40407881aefb4d6ced6232/FeatureServer/0/${objectId}/addAttachment`,
            {
                method: "POST",
                body: formData
            });
    }
};

export default ArcGISHelper;