import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

/**
 *
 err.response.data = {
    "days": [
    {
      "date": [
        "日期已存在"
      ]
    },
    {
      "date": [
        "日期已存在"
      ]
    },
    {
      "date": [
        "日期已存在"
      ]
    }
  ],
  "start_date": [
    "开始时间已存在"
  ]
}
 递归处理，重复的value只保留一次
['日期已存在', '开始时间已存在']
*/

const recursive_err_response_data = (obj) => {
  const uniqueValues = new Set();

  const traverse = (value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => traverse(item));
    } else if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach((item) => traverse(item));
    } else {
      uniqueValues.add(value);
    }
  };

  traverse(obj);

  return Array.from(uniqueValues);
};

class Http {
  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      timeout: 6000,
    });

    this.instance.interceptors.request.use((config) => {
      const authStore = useAuthStore();
      const token = authStore.token;

      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    });
  }

  get(url, params) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.instance.get(url, { params });

        resolve(result.data);
      } catch (err) {
        // console.log('err:', err);
        if (err.response === null || err.response === undefined) {
          reject('网络错误');
        } else {
          let detail = err.response.data;
          let res = '';
          if (detail !== null && typeof detail === 'string') {
            // 这里一大堆错误信息。。。。
            res = err.message;
          } else if (detail !== null && typeof detail === 'object') {
            res = recursive_err_response_data(detail);
          } else {
            console.log('get http error');
          }
          reject(res);
        }
      }
    });
  }

  post(url, data) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.instance.post(url, data);
        resolve(result.data);
      } catch (err) {
        // console.log('err:', err);
        if (err.response === null || err.response === undefined) {
          reject('网络错误');
        } else {
          let detail = err.response.data;
          let res = '';
          if (detail !== null && typeof detail === 'string') {
            // 这里一大堆错误信息。。。。
            res = err.message;
          } else if (detail !== null && typeof detail === 'object') {
            res = recursive_err_response_data(detail);
          } else {
            console.log('get http error');
          }
          reject(res);
        }
      }
    });
  }

  put(url, data) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.instance.put(url, data);

        resolve(result.data);
      } catch (err) {
        // console.log('err:', err);
        if (err.response === null || err.response === undefined) {
          reject('网络错误');
        } else {
          let detail = err.response.data;
          let res = '';
          if (detail !== null && typeof detail === 'string') {
            // 这里一大堆错误信息。。。。
            res = err.message;
          } else if (detail !== null && typeof detail === 'object') {
            res = recursive_err_response_data(detail);
          } else {
            console.log('get http error');
          }
          reject(res);
        }
      }
    });
  }

  delete(url) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.instance.delete(url);

        resolve(result); // 服务端只返回了状态码
      } catch (err) {
        // console.log('err:', err);
        if (err.response === null || err.response === undefined) {
          reject('网络错误');
        } else {
          let detail = err.response.data;
          let res = '';
          if (detail !== null && typeof detail === 'string') {
            // 这里一大堆错误信息。。。。
            res = err.message;
          } else if (detail !== null && typeof detail === 'object') {
            res = recursive_err_response_data(detail);
          } else {
            console.log('get http error');
          }
          reject(res);
        }
      }
    });
  }
}

const http = new Http();
export default http;
