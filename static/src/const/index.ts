const config = require('./server.json');
const debugConfig = require('./server.debug.json');


interface ConfigType {
    DEBUG: boolean,
    authUrl: string,
    provinceUrl: string,
    changeUrl: string,
}


const isDebug = process.env.NODE_ENV !== 'production';
let result = {
    DEBUG: isDebug
};


if (isDebug) {
    result = {...result, ...debugConfig};
} else {
    result = {...result, ...config};
}
export default {...result} as ConfigType;