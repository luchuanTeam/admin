<template>
    <section>
        <!--新增界面-->
        <el-row style="margin: 20px 0;">
        <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
            <el-form-item label="图片描述" prop="bannerDesc">
                <el-input v-model="addForm.bannerDesc" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="图片性质" prop="type" >
                <el-radio-group @change="selectChange" v-model="addForm.type">
                    <el-radio v-for="item in bannerType" :label="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="图片上传" prop="filename">
                <el-upload
                        class="upload-demo"
                        ref="upload"
                        :action="uploadUrl"
                        :on-success="handleSuccess"
                        :on-remove="handleRemove"
                        limit="1"
                        :on-exceed="handleExceed"
                        :before-upload="handleBefore"
                        list-type="picture">
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                </el-upload>
            </el-form-item>
            <el-form-item label="关联电影" prop="mvId" v-show="movieVisible">
                <el-select
                        v-model="addForm.mvId"
                        filterable
                        remote
                        reserve-keyword
                        placeholder="请输入关键词"
                        :remote-method="remoteMethod"
                        :loading="loading">
                    <el-option
                            v-for="item in movies"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button @click.native="turnBack">返回</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </el-form-item>
        </el-form>
        </el-row>
    </section>
</template>

<script>
    import util from '../../common/js/util'
    import { addBanner, getMovieList, context } from '../../api/api';

    import moment from 'moment/moment';

    export default {
        data() {
            var imgValidate = (rule, value, callback) => {
                if (this.addForm.filename == '') {
                    callback(new Error('图片未上传'));
                } else {
                    callback();
                }
            };
            return {
                bannerType: [
                    {
                        value: '10',
                        label: '视频'
                    },
                    {
                        value: '20',
                        label: '广告'
                    },
                    {
                        value: '30',
                        label: '其他'
                    }
                ],
                movieVisible: true,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    bannerDesc: [
                        { required: true, message: '请输入轮播图描述', trigger: 'blur' }
                    ],
                    filename: [
                        { required: true, message: '图片未上传', trigger: 'blur', validator: imgValidate }
                    ],
                    type: [
                        { required: true, message: '请选择图片性质', trigger: 'blur' }
                    ]
                },
                //新增界面数据
                addForm: {
                    bannerDesc: '',
                    type: '10',
                    filename: '',
                    newFilename: '',
                    mvId: ''
                },
                loading: false,
                movies: [],
                uploadUrl: context + '/attach/doImgUpload',
                downloadUrl: context + '/attach/readFile'
            }
        },
        methods: {
            turnBack() {
                this.$router.back();
            },
            selectChange(val) {
                if (val != 10) {
                    this.movieVisible = false;
                    this.addForm.mvId = '';
                } else {
                    this.movieVisible = true;
                }
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.getBanners();
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getBanners();
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
                this.addForm.filename = '';
            },
            handleSuccess(res) {
                this.addForm.filename = res.data.filename;
                this.addForm.newFilename = res.data.newFilename;
            },
            handleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
            },
            handleBefore(file){
                if (this.addForm.filename) {
                    this.$message.warning(`只能上传 1 个文件`);
                    return false;
                }
            },
            typeFormat: function (row, column) {
                var type = row[column.property];
                var name = "未知";
                this.bannerType.forEach((item, index) => {
                    if (item.value == type) {
                        name = item.label;
                    }
                });
                return name;
            },
            remoteMethod(query) {
                if (query !== '') {
                    this.loading = true;
                    let para = {
                        pageSize: 1000,
                        pageNum: 1,
                        mvName: query
                    };
                    getMovieList(para).then((res) => {
                        this.loading = false;
                        let data = res.data.data.list;
                        if (data) {
                            this.movies = data.map((item, index) => {
                                return { value: item.mvId, label: item.mvName };
                            });
                        }
                    });
                } else {
                    this.movies = [];
                }
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            let para = Object.assign({}, this.addForm);
                            let oldFilename = this.addForm.filename;
                            let newFilename = this.addForm.newFilename;
                            addBanner(oldFilename, newFilename, para).then((res) => {
                                this.addLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['addForm'].resetFields();
                                this.$refs.upload.clearFiles();
                            });
                        });
                    }
                });
            },
        },
        mounted() {

        }
    }

</script>

<style>
    .zoomImage{
        width:100%;
        height:0;
        padding-bottom: 100%;
        overflow:hidden;
        border-radius: 2px;
        background-position: center center;
        background-repeat: no-repeat;
        -webkit-background-size:cover;
        -moz-background-size:cover;
        background-size:cover;
    }
</style>