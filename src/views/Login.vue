<template>
    <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="0px"
             class="demo-ruleForm login-container">
        <h3 class="title">系统登录</h3>
        <el-form-item prop="account">
            <el-input type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="账号"></el-input>
        </el-form-item>
        <el-form-item prop="checkPass">
            <el-input type="password" v-model="ruleForm2.checkPass" auto-complete="off" placeholder="密码"></el-input>
        </el-form-item>
        <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
        <el-form-item style="width:100%;">
            <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit2" :loading="logining">登录
            </el-button>
            <!--<el-button @click.native.prevent="handleReset2">重置</el-button>-->
        </el-form-item>
        <a class="register" href="#/register">没有账号？去注册</a>
    </el-form>
</template>

<style>
    .register {

    }

</style>

<script>
    import {requestLogin} from '../api/api';
    import Qs from 'qs';
    //import NProgress from 'nprogress'
    export default {
        data() {
            return {
                logining: false,
                ruleForm2: {
                    account: '',
                    checkPass: ''
                },
                rules2: {
                    account: [
                        {required: true, message: '请输入账号', trigger: 'blur'},
                        //{ validator: validaePass }
                    ],
                    checkPass: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        //{ validator: validaePass2 }
                    ]
                },
                checked: true
            };
        },
        methods: {
            handleReset2() {
                this.$refs.ruleForm2.resetFields();
            },
            handleSubmit2(ev) {
                var _this = this;
                this.$refs.ruleForm2.validate((valid) => {
                    if (valid) {
                        //_this.$router.replace('/table');
                        this.logining = true;
                        //NProgress.start();
                        let userName = this.ruleForm2.account;
                        let password = this.ruleForm2.checkPass;
                        if (this.checked) {
                            this.setCookie(userName, password, 30);
                        } else {
                            this.clearCookie();
                        }
                        var loginParams = {userName: userName, password: password};
                        requestLogin(Qs.stringify(loginParams)).then(res => {
                            this.logining = false;
                            //NProgress.done();
                            let {status, message, data} = res;
                            if (status !== 200) {
                                this.$message({
                                    message: message,
                                    type: 'error'
                                });
                            } else {
                                let user = {}, roles = [], isAdmin = false;
                                user = data.userInfo;
                                roles = user.role;
                                if (user.status != 1) {
                                    this.$message({
                                        message: '该账号已经被停用',
                                        type: 'error'
                                    });
                                } else {
                                    if (user.role) {
                                        for (let role of roles) {
                                            if (role.ename == 'admin') {
                                                isAdmin = true;

                                            }
                                        }
                                    }
                                    if (isAdmin) {
                                        sessionStorage.setItem('user', JSON.stringify(user));
                                        this.$router.push({path: '/banners'});
                                    } else {
                                        this.$message({
                                            message: '该用户不是管理员，没有权限进入后台',
                                            type: 'error'
                                        });
                                    }
                                }

                            }
                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            //设置cookie
            setCookie(c_name, c_pwd, exdays) {
                var exdate = new Date();//获取时间
                exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays);//保存的天数
                //字符串拼接cookie
                window.document.cookie = "userName" + "=" + c_name + ";path=/;expires=" + exdate.toGMTString();
                window.document.cookie = "password" + "=" + c_pwd + ";path=/;expires=" + exdate.toGMTString();
            },
            //读取cookie
            getCookie: function () {
                if (document.cookie.length > 0) {
                    var arr = document.cookie.split('; ');//这里显示的格式需要切割一下自己可输出看下
                    for (var i = 0; i < arr.length; i++) {
                        var arr2 = arr[i].split('=');//再次切割
                        //判断查找相对应的值
                        if (arr2[0] == 'userName') {
                            this.ruleForm2.account = arr2[1];//保存到保存数据的地方
                        } else if (arr2[0] == 'password') {
                            this.ruleForm2.checkPass = arr2[1];
                        }
                    }
                }
            },
            //清除cookie
            clearCookie: function () {
                this.setCookie("", "", -1);//修改2值都为空，天数为负1天就好了
            }
        },
        mounted() {
            this.getCookie();
        }
    }

</script>

<style lang="scss" scoped>
    .login-container {
        /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
        -webkit-border-radius: 5px;
        border-radius: 5px;
        -moz-border-radius: 5px;
        background-clip: padding-box;
        margin: 180px auto;
        width: 350px;
        padding: 35px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
        .title {
            margin: 0px auto 40px auto;
            text-align: center;
            color: #505458;
        }
        .remember {
            margin: 0px 0px 35px 0px;
        }
    }
</style>