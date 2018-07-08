import Login from './views/Login.vue'
import Register from './views/Register.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Reports from './views/charts/Reports.vue'
import Banners from './views/banner/Banners.vue'
import AddBanner from './views/banner/AddBanner.vue'
import Movies from './views/movie/Movies.vue'
import AddMovie from './views/movie/AddMovie.vue'
import EditMovie from './views/movie/EditMovie.vue'
import Episodes from './views/movie/Episodes.vue'
import AddEpisode from './views/movie/AddEpisode.vue'
import EditEpisode from './views/movie/EditEpisode.vue'
import Users from './views/user/Users.vue'
import Vips from './views/vip/VipCard.vue'
import Products from './views/vip/Products.vue'
import One from './views/classify/OneLevel.vue'
import Two from './views/classify/TwoLevel.vue'


let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/register',
        component: Register,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        iconCls: 'el-icon-picture',
        leaf: true,
        children: [
            { path: '/banners', component: Banners, name: '图片管理' },
            { path: '/addBanner', component: AddBanner, name: '新增图片', hidden: true }
        ]
    },
    {
        path: '/',
        component: Home,
        iconCls: 'el-icon-upload',
        leaf: true,
        children: [
            { path: '/movies', component: Movies, name: '视频管理' },
            { path: '/addMovie', component: AddMovie, name: '添加视频' },
            { path: '/editMovie', component: EditMovie, name: '编辑视频' },
            { path: '/episodes', component: Episodes, name: '视频集' },
            { path: '/addEpisode', component: AddEpisode, name: '添加视频集' },
            { path: '/editEpisode', component: EditEpisode, name: '编辑视频集' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '用户管理',
        iconCls: 'fa fa-user-o',
        leaf: true,
        children: [
            { path: '/users', component: Users, name: '用户列表' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '会员卡管理',
        iconCls: 'fa fa-user-o',
        children: [
            { path: '/vip', component: Vips, name: '会员卡列表' },
            { path: '/product', component: Products, name: '会员卡设置' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '分类管理',
        iconCls: 'fa fa-th-large',
        leaf: true,
        children: [
            { path: '/oneLev', component: One, name: '一级分类列表' },
            { path: '/twoLev', component: Two, name: '二级分类列表' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '统计报表',
        iconCls: 'fa fa-bar-chart',
        children: [
            { path: '/echarts', component: Reports, name: '视频报表' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;