import axios from 'axios';
export const context = process.env.BASE_API;

// create an axios instance
const request = axios.create({
    baseURL: process.env.BASE_API, // api的base_url
    timeout: 6000*5 // request timeout
});

export const requestLogin = params => { return request.post(`/user/login`, params).then(res => res.data); };

export const requestRegister = params => { return request.post(`/user/register`, params).then(res => res.data); };

/**************** 轮播图相关接口 ****************/
export const getBannerList = params => { return request.get(`/banner/list`, { params: params }); };

export const editBanner = params => { return request.post(`/banner/update`, params ); };

export const deleteBanner = params => { return request.post(`/banner/delete/${params}`); };

export const deleteBanners = params => { return request.post(`/banner/batchDelete/${params}`); };

export const addBanner = (oldFilename, newFilename, params) => { return request.post(`/banner/add?oldFilename=${oldFilename}&newFilename=${newFilename}`, params ); };

/**************** 视频相关接口 ****************/
export const getMovieList = params => { return request.get(`/movie/list`, { params: params }); };

export const editMovie = (oldFilename, newFilename, params) => { return request.post(`/movie/update?oldFilename=${oldFilename}&newFilename=${newFilename}`, params ); };

export const getMovie = params => { return request.get(`/movie/${params}`); };

export const deleteMovie = params => { return request.post(`/movie/delete/${params}`); };

export const addMovie = (oldFilename, newFilename, params) => { return request.post(`/movie/add?oldFilename=${oldFilename}&newFilename=${newFilename}`, params ); };

export const pubMovie = params => { return request.post(`/movie/pub`, params); };

/**************** 视频集相关接口 ****************/
export const getEpisodeList = params => { return request.get(`/episode/list`, { params: params }); };

export const getEpisode = params => { return request.get(`/episode/getEpisode`, { params: params }); };

export const getEpisodeById = params => { return request.get(`/episode/${params}`); };

export const addEpisode = (filePara, params) => {
    return request.post(`/episode/add?oldFilename=${filePara.imgFilename}&newFilename=${filePara.imgNewFilename}&mvOldFilename=${filePara.mvFilename}&mvNewFilename=${filePara.mvNewFilename}`, params);
};

export const editEpisode = (filePara, params) => {
    return request.post(`/episode/update?oldFilename=${filePara.imgFilename}&newFilename=${filePara.imgNewFilename}&mvOldFilename=${filePara.mvFilename}&mvNewFilename=${filePara.mvNewFilename}`, params)
};

export const deleteEpisode = params => { return request.post(`/episode/delete/${params}`); };

export const deleteEpisodes = params => { return request.post(`/episode/batchDelete/${params}`); };

/**************** 分类相关接口 ****************/
export const getClassify = () => { return request.get(`/movie/getClassify`); };

export const getClassifyById = (id) => { return request.get(`/movie/getClassify/${id}`); };

export const getOneClassifyList = params => { return request.get(`/classify/list`, { params: params }); };

export const getTwoClassifyById = params => { return request.get(`/classify/getClassifyById`, { params: params }); };

export const editClassify = params => { return request.post(`/classify/update`, params ); };

export const addClassify = params => { return request.post(`/classify/add`, params); };

export const deleteClassify = params => { return request.post(`/classify/delete/${params}`); };

export const deleteClassifies = params => { return request.post(`/classify/batchDelete/${params}`); };

/**************** 用户相关接口 ****************/
export const getUserList = params => { return request.get(`/user/list`, { params: params }); };

export const removeUser = params => { return request.get(`/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return request.get(`/user/batchremove`, { params: params }); };

export const editUser = params => { return request.post(`/user/update`, params ); };

export const addUser = params => { return request.get(`/user/add`, { params: params }); };

export const getRoleList = () => { return request.get(`/role/list`); };

export const getUserRoleList = (id) => { return request.get(`/role/user/${id}`); };

export const updateUserRole = (userId, roleIds) => { return request.post(`/role/user/update/${userId}`, roleIds); };


/**************** 统计报表相关接口 ****************/
export const getClassifyMvCount = () => { return request.get(`/report/classifyMvCount`); };

/**************** 会员卡相关接口 ****************/
export const getVipCardList = params => { return request.get(`/vip/list`, { params: params }); };

export const deleteVipCard = params => { return request.post(`/vip/delete/${params}`); };

export const batchDeleteVipCard = params => { return request.post(`/vip/batchDelete/${params}`); };

export const editVipCard = (params, addDays) => { return request.post(`/vip/update?addDays=${addDays}`, params ); };

export const addVipCard = params => { return request.post(`/vip/add`, params); };

export const batchAddVipCard = params => { return request.post(`/vip/batchAdd`, params); };

export const bindVipCard = params => { return request.post(`/vip/bind`, params ); };

export const getVipCardNum = () => { return request.get(`/vip/getVipCardNum` ); };

export const getProductList = () => { return request.get(`/product/list`); };

export const upsertProduct = params => { return request.post(`/product/upsert`, params); };

export const deleteProduct = params => { return request.post(`/product/delete/${params}`); };

/**************** 试题相关接口 ****************/
export const getPaperList = params => { return request.get(`/paper/list`, { params: params }); };

export const editPaper = params => { return request.post(`/paper/update`, params ); };

export const deletePaper = params => { return request.post(`/paper/delete/${params}`); };

export const addPaper = (oldFilename, newFilename, params) => { return request.post(`/paper/add?oldFilename=${oldFilename}&newFilename=${newFilename}`, params ); };