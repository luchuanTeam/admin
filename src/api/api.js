import axios from 'axios';

let base = '';

export const context = 'http://localhost/yanda';
//export const context = 'http://www.yanda123.com/yanda';

export const requestLogin = params => { return axios.post(`${context}/login`, params).then(res => res.data); };

export const getBannerList = params => { return axios.get(`${context}/banner/list`, { params: params }); };

export const editBanner = params => { return axios.post(`${context}/banner/update`, params ); };

export const deleteBanner = params => { return axios.post(`${context}/banner/delete/${params}`); };

export const deleteBanners = params => { return axios.post(`${context}/banner/batchDelete/${params}`); };

export const addBanner = (oldFilename, newFilename, params) => { return axios.post(`${context}/banner/add?oldFilename=${oldFilename}&newFilename=${newFilename}`, params ); };

export const getUserList = params => { return axios.get(`${base}/user/list`, { params: params }); };

export const getUserListPage = params => { return axios.get(`${base}/user/listpage`, { params: params }); };

export const removeUser = params => { return axios.get(`${base}/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return axios.get(`${base}/user/batchremove`, { params: params }); };

export const editUser = params => { return axios.get(`${base}/user/edit`, { params: params }); };

export const addUser = params => { return axios.get(`${base}/user/add`, { params: params }); };