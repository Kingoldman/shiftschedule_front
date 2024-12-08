import http from './http';
import { isNull } from '@/utils/utils.js';

const getallgroupturn = (page=1,size=5,params) => {

    const path = 'api/groupturn/groupturn';
    params = isNull(params) ? {}:params
    params.page = page;
    params.size = size;

    return http.get(path, params);
}

const retrievegroupturn = (id) => {
    const path = `api/groupturn/groupturn/${id}`;
    return http.get(path);
}

const creategroupturn = (data) => {
    const path = 'api/groupturn/groupturn';
    return http.post(path, data);
}

const updategroupturn = (id, data) => {
    const path = `api/groupturn/groupturn/${id}`;
    return http.put(path, data);
}

const deletegroupturn = (id) => {
    const path = `api/groupturn/groupturn/${id}`;
    return http.delete(path);
}

export default {
    getallgroupturn,
    retrievegroupturn,
    creategroupturn,
    updategroupturn,
    deletegroupturn,
}