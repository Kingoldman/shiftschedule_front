import http from './http';
import { isNull } from '@/utils/utils.js';

/*
 * 部门操作
 **/
// 获取部门列表
const getAllDepartments = (page = 1, size = 5, params) => {
  const path = 'api/staff/department';
  params = isNull(params) ? {} : params; // 判断params是否为空
  params.page = page;
  params.size = size;
  return http.get(path, params);
};

// retrieve department by id
const retrievedepartment = (id) => {
  const path = `api/staff/department/${id}`;
  return http.get(path);
};

// create department
const createDepartment = (data) => {
  const path = 'api/staff/department';
  return http.post(path, data);
};

// update department
const updateDepartment = (id, data) => {
  const path = `api/staff/department/${id}`;
  return http.put(path, data);
};

// delete department
const deleteDepartment = (id) => {
  const path = `api/staff/department/${id}`;
  return http.delete(path);
};
/////////////////////////////////////////////////////////////////////
/*
 * 人员操作
 **/

// 获取员工列表

const getAllStaff = (page = 1, size = 5, params) => {
  const path = 'api/staff/users';
  params = isNull(params) ? {} : params; // 判断params是否为空
  params.page = page;
  params.size = size;
  return http.get(path, params);
};

// retrieve staff by id
const retrieveStaff = (id) => {
  const path = `api/staff/users/${id}`;
  return http.get(path);
};
// create staff
const createStaff = (data) => {
  const path = 'api/staff/users';
  return http.post(path, data);
};
// update staff
const updateStaff = (id, data) => {
  const path = `api/staff/users/${id}`;
  return http.put(path, data);
};
// delete staff
const deleteStaff = (id) => {
  const path = `api/staff/users/${id}`;
  return http.delete(path);
};
/////////////////////////////////////////////////////////////////////

/*
 * 组操作
 **/

// 获取组列表

const getgroupbackups = (page = 1, size = 5, params) => {
  const path = 'api/staff/shiftgroupbackup';
  params = isNull(params) ? {} : params; // 判断params是否为空
  params.page = page;
  params.size = size;
  return http.get(path, params);
};

// retrieve group by id
const retrievegroupbackup = (id) => {
  const path = `api/staff/shiftgroupbackup/${id}`;
  return http.get(path);
};

// create group
const creategroupbackup = (data) => {
  const path = 'api/staff/shiftgroupbackup';
  return http.post(path, data);
};
// update group
const updategroupbackup = (id, data) => {
  const path = `api/staff/shiftgroupbackup/${id}`;
  return http.put(path, data);
};
// delete group
const deletegroupbackup = (id) => {
  const path = `api/staff/shiftgroupbackup/${id}`;
  return http.delete(path);
};
/////////////////////////////////////////////////////////////////////
const getAllGroups = (page = 1, size = 5, params) => {
  const path = 'api/staff/shiftgroup';
  params = isNull(params) ? {} : params; // 判断params是否为空
  params.page = page;
  params.size = size;
  return http.get(path, params);
};

// retrieve group by id
const retrieveGroup = (id) => {
  const path = `api/staff/shiftgroup/${id}`;
  return http.get(path);
};

// create group
const createGroup = (data) => {
  const path = 'api/staff/shiftgroup';
  return http.post(path, data);
};
// update group
const updateGroup = (id, data) => {
  const path = `api/staff/shiftgroup/${id}`;
  return http.put(path, data);
};
// delete group
const deleteGroup = (id) => {
  const path = `api/staff/shiftgroup/${id}`;
  return http.delete(path);
};

/////////////////////////////////////////////////////////////////////

export default {
  getAllDepartments,
  retrievedepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,

  ///////////
  getAllStaff,
  retrieveStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  ///////////
  getAllGroups,
  retrieveGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  ////////////
  getgroupbackups,
  retrievegroupbackup,
  creategroupbackup,
  updategroupbackup,
  deletegroupbackup,
};
