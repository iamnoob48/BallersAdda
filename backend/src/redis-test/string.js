import client from "./client.js";

const init = async () => {
    const string1 = await client.get('user:1');
    console.log(string1);

}
init();
