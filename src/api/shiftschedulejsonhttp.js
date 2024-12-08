import http from './http';
import {isNull} from '@/utils/utils.js';


const getshiftschedulejsons = (page = 1, size = 5, params) => {
    const path = 'api/shiftschedulejson/shiftschedulejson';
    params = isNull(params) ? {} : params; // 判断params是否为空
    params.page = page;
    params.size = size;
    return http.get(path, params);
};


const retrieveshiftschedulejson = (id) => {
    const path = `api/shiftschedulejson/shiftschedulejson/${id}`;
    return http.get(path);
};


const createshiftschedulejson = (data) => {
    const path = 'api/shiftschedulejson/shiftschedulejson';
    return http.post(path, data);
};


const updateshiftschedulejson = (id, data) => {
    const path = `api/shiftschedulejson/shiftschedulejson/${id}`;
    return http.put(path, data);
};


const deleteshiftschedulejson = (id) => {
    const path = `api/shiftschedulejson/shiftschedulejson/${id}`;
    return http.delete(path);
};


export default {
    getshiftschedulejsons,
    createshiftschedulejson,
    retrieveshiftschedulejson,
    updateshiftschedulejson,
    deleteshiftschedulejson,
}