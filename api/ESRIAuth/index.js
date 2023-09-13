import axios from 'axios';

export default async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const formData = new URLSearchParams();
    formData.append("username", "1-GIS-Service@southmetro");
    formData.append("password", "GIS9195Smfr");
    formData.append("client", "referer");
    formData.append("referer", "https://ambitious-sand-0bf74c810.1.azurestaticapps.net");
    formData.append("expiration", "10160")
    formData.append("f", "json");
    try {

       const {data} =  await axios.post("https://gis.southmetro.org/portal/sharing/rest/generateToken",formData);

        // await fetch(
        //     "https://gis.southmetro.org/portal/sharing/rest/generateToken",
        //     {
        //         method: "POST",
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded'
        //         },
        //         body: formData
        //     });
        
        context.log(' No done Response');
        context.log(data);        
        context.res = {
            body: data
        };
        
    }
    catch (error) {
        context.log(error);
        context.res = {
            body: error
        };
    }
    // var jsonResponse = await response.json();
    // //token = jsonResponse.token;

    // console.log(jsonResponse);

}