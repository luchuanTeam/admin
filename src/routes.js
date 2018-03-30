import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import echarts from './views/charts/echarts.vue'
import Banners from './views/banner/Banners.vue'
import AddBanner from './views/banner/AddBanner.vue'
import Movies from './views/movie/Movies.vue'
import AddMovie from './views/movie/AddMovie.vue'
import Episodes from './views/movie/Episodes.vue'
import AddEpisode from './views/movie/AddEpisode.vue'


let routes = [
    {
        path: '/login',
        component: Login,
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
            { path: '/episodes', component: Episodes, name: '视频集' },
            { path: '/addEpisode', component: AddEpisode, name: '添加视频集' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '统计报表',
        iconCls: 'fa fa-bar-chart',
        children: [
            { path: '/echarts', component: echarts, name: '视频报表' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;