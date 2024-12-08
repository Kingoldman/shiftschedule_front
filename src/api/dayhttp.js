import http from './http';
import { isNull } from '@/utils/utils.js';
/*
 * 每日详情
 */

const getAllDay = (page = 1, size = 5, params) => {
  const path = 'api/daymanage/whyday';
  params = isNull(params) ? {} : params; // 判断params是否为空
  params.page = page;
  params.size = size;
  return http.get(path, params);
};

const retrieveDay = (id) => {
  const path = `api/daymanage/whyday/${id}`;
  return http.get(path);
};

const createDay = (data) => {
  const path = 'api/daymanage/whyday';
  return http.post(path, data);
};

// 批量创建方法
const batchCreateDays = (data) => {
  const path = 'api/daymanage/whyday/batch_create'; // 确保路径与后端一致
  return http.post(path, data);
};
// 批量更新
const batchUpdateDays = (data) => {
  const path = 'api/daymanage/whyday/batch_update';
  return http.post(path, data);
}


const updateDay = (id, data) => {
  const path = `api/daymanage/whyday/${id}`;
  return http.put(path, data);
};

const deleteDay = (id) => {
  const path = `api/daymanage/whyday/${id}`;
  return http.delete(path);
};


/*
 * 节假日类别
 */
// 获取节假日类别列表

const getAllHolidayTypes = (page = 1, size = 5, params) => {
  const path = 'api/daymanage/holidaytype';
  params = isNull(params) ? {} : params; // 判断params是否为空
  params.page = page;
  params.size = size;
  return http.get(path, params);
};

// retrieve holidaytype by id
const retrieveHolidayType = (id) => {
  const path = `api/daymanage/holidaytype/${id}`;
  return http.get(path);
};

// create holidaytype
const createHolidayType = (data) => {
  const path = 'api/daymanage/holidaytype';
  return http.post(path, data);
};
// update holidaytype
const updateHolidayType = (id, data) => {
  const path = `api/daymanage/holidaytype/${id}`;
  return http.put(path, data);
};
// delete holidaytype
const deleteHolidayType = (id) => {
  const path = `api/daymanage/holidaytype/${id}`;
  return http.delete(path);
};

/////////////////////////////////////////////////////
/*
 * 节假日操作
 **/
// 获取节假日列表

const getAllHolidays = (page = 1, size = 5, params) => {
  const path = 'api/daymanage/holiday';
  params = isNull(params) ? {} : params; // 判断params是否为空
  params.page = page;
  params.size = size;
  return http.get(path, params);
};

// retrieve holiday by id
const retrieveHoliday = (id) => {
  const path = `api/daymanage/holiday/${id}`;
  return http.get(path);
};

// create holiday
const createHoliday = (data) => {
  const path = 'api/daymanage/holiday';
  return http.post(path, data);
};

// update holiday
const updateHoliday = (id, data) => {
  const path = `api/daymanage/holiday/${id}`;
  return http.put(path, data);
};

// delete holiday
const deleteHoliday = (id) => {
  const path = `api/daymanage/holiday/${id}`;
  return http.delete(path);
};

/////////////////////////////////////////////////////////////////////
/*
 * 调休日操作
 **/

// 获取调休日列表

const getAllVacationDays = (page = 1, size = 5, params) => {
  const path = 'api/daymanage/vacationday';
  params = isNull(params) ? {} : params; // 判断params是否为空
  params.page = page;
  params.size = size;
  return http.get(path, params);
};

// retrieve vacationday by id
const retrieveVacationDay = (id) => {
  const path = `api/daymanage/vacationday/${id}`;
  return http.get(path);
};

// create vacationday
const createVacationDay = (data) => {
  const path = 'api/daymanage/vacationday';
  return http.post(path, data);
};
// update vacationday
const updateVacationDay = (id, data) => {
  const path = `api/daymanage/vacationday/${id}`;
  return http.put(path, data);
};
// delete vacationday
const deleteVacationDay = (id) => {
  const path = `api/daymanage/vacationday/${id}`;
  return http.delete(path);
};




export default {
  getAllDay,
  retrieveDay,
  createDay,
  batchCreateDays,
  batchUpdateDays,
  updateDay,
  deleteDay,

  getAllHolidays,
  retrieveHoliday,
  createHoliday,
  updateHoliday,
  deleteHoliday,

  ////////////
  getAllVacationDays,
  retrieveVacationDay,
  createVacationDay,
  updateVacationDay,
  deleteVacationDay,

  /////////////////
  getAllHolidayTypes,
  retrieveHolidayType,
  createHolidayType,
  updateHolidayType,
  deleteHolidayType,
};
