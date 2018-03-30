import axios from 'axios';

let base = '';

//export const context = 'http://localhost/yanda';
export const context = 'http://www.yanda123.com/yanda';

export const requestLogin = params => { return axios.post(`${context}/login`, params).then(res => res.data); };

/**************** 轮播图相关接口 ****************/
export const getBannerList = params => { return axios.get(`${context}/banner/list`, { params: params }); };

export const editBanner = params => { return axios.post(`${context}/banner/update`, params ); };

export const deleteBanner = params => { return axios.post(`${context}/banner/delete/${params}`); };

export const deleteBanners = params => { return axios.post(`${context}/banner/batchDelete/${params}`); };

export const addBanner = (oldFilename, newFilename, params) => { return axios.post(`${context}/banner/add?oldFilename=${oldFilename}&newFilename=${newFilename}`, params ); };

/**************** 视频相关接口 ****************/
export const getMovieList = params => { return axios.get(`${context}/movie/list`, { params: params }); };

export const editMovie = params => { return axios.post(`${context}/movie/update`, params ); };

export const deleteMovie = params => { return axios.post(`${context}/movie/delete/${params}`); };

export const addMovie = (oldFilename, newFilename, params) => { return axios.post(`${context}/movie/add?oldFilename=${oldFilename}&newFilename=${newFilename}`, params ); };

export const getEpisodeList = params => { return axios.get(`${context}/episode/list`, { params: params }); };

export const addEpisode = (filePara, params) => {
    return axios.post(`${context}/episode/add?oldFilename=${filePara.imgFilename}&newFilename=${filePara.imgNewFilename}&mvOldFilename=${filePara.mvFilename}&mvNewFilename=${filePara.mvNewFilename}`, params);
};

export const deleteEpisode = params => { return axios.post(`${context}/episode/delete/${params}`); };

export const deleteEpisodes = params => { return axios.post(`${context}/episode/batchDelete/${params}`); };

export const getClassify = () => { return axios.get(`${context}/movie/getClassify`); };

export const getClassifyById = (id) => { return axios.get(`${context}/movie/getClassify/${id}`); };

/**************** 用户相关接口 ****************/
export const getUserList = params => { return axios.get(`${base}/user/list`, { params: params }); };

export const getUserListPage = params => { return axios.get(`${base}/user/listpage`, { params: params }); };

export const removeUser = params => { return axios.get(`${base}/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return axios.get(`${base}/user/batchremove`, { params: params }); };

export const editUser = params => { return axios.get(`${base}/user/edit`, { params: params }); };

export const addUser = params => { return axios.get(`${base}/user/add`, { params: params }); };