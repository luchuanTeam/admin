import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav2/Table.vue'
import Banners from './views/banner/Banners.vue'
import Form from './views/nav2/Form.vue'
import user from './views/nav2/user.vue'
import Page4 from './views/nav2/Page4.vue'
import Page5 from './views/nav2/Page5.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
import AddBanner from './views/banner/AddBanner.vue'

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
    //{ path: '/main', component: Main },
    {
        path: '/',
        component: Home,
        name: 'Banner管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            //{ path: '/main', component: Main, name: '主页', hidden: true },
            { path: '/banners', component: Banners, name: '图片列表' },
            {
                path: '/addBanner',
                component: AddBanner,
                name: '新增',
                hidden: true
            }
            //{ path: '/form', component: Form, name: '表单' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '用户管理',
        iconCls: 'fa fa-id-card-o',
        leaf: true,//只有一个节点
        children: [
            { path: '/user', component: user, name: '用户列表' }
        ]
    },
    // {
    //     path: '/',
    //     component: Home,
    //     name: '',
    //     iconCls: 'fa fa-address-card',
    //     leaf: true,//只有一个节点
    //     children: [
    //         { path: '/page6', component: Page6, name: '导航三' }
    //     ]
    // },
    {
        path: '/',
        component: Home,
        name: 'Charts',
        iconCls: 'fa fa-bar-chart',
        children: [
            { path: '/echarts', component: echarts, name: 'echarts' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;