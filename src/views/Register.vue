<template>
    <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="0px"
             class="demo-ruleForm login-container">
        <h3 class="title">注册用户</h3>
        <el-form-item prop="account">
            <el-input type="text" v-model="ruleForm2.userName" auto-complete="off" placeholder="账号"></el-input>
        </el-form-item>
        <el-form-item prop="mobile">
            <el-input type="mobile" v-model="ruleForm2.mobile" auto-complete="off" placeholder="手机号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
            <el-input type="password" v-model="ruleForm2.password" auto-complete="off" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item prop="checkPass">
            <el-input type="password" v-model="ruleForm2.checkPass" auto-complete="off" placeholder="确认密码"></el-input>
        </el-form-item>
        <el-form-item style="width:100%;">
            <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit2" :loading="logining">注册
            </el-button>
        </el-form-item>
        <a class="register" href="#/login">已有账号？去登录</a>
    </el-form>
</template>

<script>
    import {requestRegister} from '../api/api';
    import Qs from 'qs';
    //import NProgress from 'nprogress'
    export default {
        data() {
            return {
                logining: false,
                ruleForm2: {
                    userName: '',
                    password: '',
                    mobile: '',
                    checkPass: ''
                },
                rules2: {
                    userName: [
                        {required: true, message: '请输入账号', trigger: 'blur'}
                    ],
                    mobile: [
                        {required: true, message: '请输入手机号', trigger: 'blur'},
                        {
                            validator: (rule, value, callback) => {
                                if (/^1[34578]\d{9}$/.test(value) == false) {
                                    callback(new Error("请输入正确的手机号"));
                                } else {
                                    callback();
                                }
                            }, trigger: 'blur'
                        }
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ],
                    checkPass: [
                        {required: true, message: '请输入确认密码', trigger: 'blur'},
                        {validator: (rule, value, callback) => {
                            if (value != this.ruleForm2.password) {
                                callback(new Error('两次输入密码不一致'));
                            } else {
                                callback();
                            }
                        }}
                    ]
                }
            };
        },
        methods: {
            handleSubmit2(ev) {
                this.$refs.ruleForm2.validate((valid) => {
                    if (valid) {
                        this.logining = true;
                        var loginParams = {
                            userName: this.ruleForm2.userName,
                            password: this.ruleForm2.password,
                            mobile: this.ruleForm2.mobile
                        };
                        requestRegister(Qs.stringify(loginParams)).then(res => {
                            this.logining = false;
                            let {status, message, data} = res;
                            if (status !== 200) {
                                this.$message({
                                    message: message,
                                    type: 'error'
                                });
                            } else {
                                this.$alert('注册成功', '注册', {
                                    confirmButtonText: '确定',
                                    callback: action => {
                                        this.$router.push({path: '/login'});
                                    }
                                });
                            }
                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            }
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