const ArcGISHelper = {

    getToken: async function () {
        var token = "";

        const formData = new URLSearchParams();
        formData.append("username", "abner.campuzano@southmetro");
        formData.append("password", "Campuzano33911933");
        formData.append("client", "referer");
        formData.append("referer", "https://ambitious-sand-0bf74c810.1.azurestaticapps.net");
        formData.append("expiration", "10160")
        formData.append("f", "json");
        var response = await fetch(
            `https://gis.southmetro.org/portal/sharing/rest/generateToken`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

        var jsonResponse = await response.json();

        token = jsonResponse.token;

        console.log("Token: ", token);

        return token;
    },

    attatchPDFtoAssignment: async function (instance, objectId) {

        console.log("objectId=" + objectId);

        const arrayBuffer = await instance.exportPDF();
        console.log(arrayBuffer);
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        console.log(blob);
        const formData = new FormData();
        formData.append("token", await this.getToken());
        formData.append("attachment", blob);
        formData.append("multipart", true);
        formData.append("f", "json");
        fetch(
            `https://gis.southmetro.org/arcgis/rest/services/Hosted/workforce_9bce7612ad40407881aefb4d6ced6232/FeatureServer/0/${objectId}/addAttachment`,
            {
                method: "POST",
                referrerPolicy: "same-origin",
                body: formData
            }).then(response => console.log(response.json()));
    }
};

export default ArcGISHelper;