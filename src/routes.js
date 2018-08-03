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
import NJ from './views/classify/NianJi.vue'
import Zhang from './views/classify/Zhang.vue'
import Jie from './views/classify/Jie.vue'
import DY from './views/classify/Danyuan.vue'
import QZQM from './views/classify/QZQM.vue'
import Paper from './views/paper/Paper.vue'
import Courseware from './views/paper/Courseware.vue'
import Questions from './views/question/Questions.vue'
import AddQuestion from './views/question/AddQuestion.vue'
import EditQuestion from './views/question/editQuestion.vue'


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
        name: '文件管理',
        iconCls: 'fa fa-file-word-o',
        children: [
            { path: '/paper', component: Paper, name: '试题管理' },
            { path: '/courseware', component: Courseware, name: '课件管理' }
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
        children: [
            { path: '/oneLev', component: One, name: '视频分类' },
            { path: '/nj', component: NJ, name: '年级分类' },
            { path: '/zhang', hidden: true, component: Zhang, name: '章分类' },
            { path: '/dy', hidden: true, component: DY, name: '单元分类' },
            { path: '/qzqm', hidden: true, component: QZQM, name: '期中期末分类' },
            { path: '/twoLev', hidden: true, component: Two, name: '视频子分类' },
            { path: '/jie', hidden: true, component: Jie, name: '节分类' }
        ]
    },
    {
        path: '/',
        component: Home,
        iconCls: 'el-icon-upload',
        leaf: true,
        children: [
            { path: '/questions', component: Questions, name: '题目管理' },
            { path: '/addQuestion', component: AddQuestion, name: '添加题目' },
            { path: '/editQuestion', component: EditQuestion, name: '编辑题目' }
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