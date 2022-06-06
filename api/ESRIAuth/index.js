const axios = require('axios').default;

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const formData = new URLSearchParams();
    formData.append("username", "1-GIS-Service@southmetro");
    formData.append("password", "GIS9195Smfr");
    formData.append("client", "referer");
    formData.append("referer", "https://ambitious-sand-0bf74c810.1.azurestaticapps.net");
    formData.append("expiration", "10160")
    formData.append("f", "json");
    try {

        var response =  axios.post("https://gis.southmetro.org/portal/sharing/rest/generateToken",formData);

        // await fetch(
        //     "https://gis.southmetro.org/portal/sharing/rest/generateToken",
        //     {
        //         method: "POST",
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded'
        //         },
        //         body: formData
        //     });
        
        context.log('Response');
        context.log(response);
        
        context.res = {
            body: response
        };

        context.done();
    }
    catch (error) {
        context.log(error);

        context.res = {
            body: error
        };
        context.done();
    }


    // var jsonResponse = await response.json();
    // //token = jsonResponse.token;

    // console.log(jsonResponse);

}