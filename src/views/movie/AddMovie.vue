<template>
    <section>
        <!--新增界面-->
        <el-row style="margin: 20px 0;">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="视频名称" prop="mvName">
                    <el-input v-model="addForm.mvName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="视频简介" prop="mvIntro">
                    <el-input type="textarea" v-model="addForm.mvIntro" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="分类" prop="classifyId">
                    <el-cascader
                            @change="selectChange"
                            :options="classifies"
                            @active-item-change="handleItemChange"
                            :props="props"
                    ></el-cascader>
                </el-form-item>

                <!--是否需要vip-->
                <el-form-item label="视频权限" prop="vipType" >
                    <el-radio-group v-model="addForm.vipType">
                        <el-radio v-for="item in vipType" :label="item.value">{{ item.label }}</el-radio>
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
    import { addMovie, getClassify, getClassifyById, context } from '../../api/api';

    import moment from 'moment/moment';

    export default {
        data() {
            var classifyValidate = (rule, value, callback) => {
                if (value.length == 0) {
                    callback(new Error('请选择视频分类'));
                } else {
                    callback();
                }
            };
            var imgValidate = (rule, value, callback) => {
                if (this.addForm.filename == '') {
                    callback(new Error('图片未上传'));
                } else {
                    callback();
                }
            };
            return {
                classifies: [],
                vipType: [
                    {
                        value: 0,
                        label: '普通会员'
                    },
                    {
                        value: 1,
                        label: 'vip会员'
                    }
                ],
                props: {
                    value: 'id',
                    children: 'classify'
                },
                addLoading: false,
                addFormRules: {
                    mvName: [
                        { required: true, message: '请输入视频名称', trigger: 'blur' }
                    ],
                    mvIntro: [
                        { required: true, message: '请输入视频简介', trigger: 'blur' }
                    ],
                    filename: [
                        { required: true, message: '图片未上传', trigger: 'blur', validator: imgValidate }
                    ],
                    classifyId: [
                        { required: true, message: '请选择视频分类', trigger: 'blur', validator: classifyValidate }
                    ]
                },
                //新增界面数据
                addForm: {
                    mvName: '',
                    mvIntro: '',
                    classifyId: '',
                    classifyName: '',
                    filename: '',
                    newFilename: '',
                    vipType: 0
                },
                loading: false,
                uploadUrl: context + '/attach/doImgUpload',
                downloadUrl: context + '/attach/readFile'
            }
        },
        methods: {
            turnBack() {
                this.$router.back();
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
                this.addForm.filename = '';
                this.addForm.newFilename = '';
            },
            handleSuccess(res) {

                if (res.status == 200) {
                    this.addForm.filename = res.data.filename;
                    this.addForm.newFilename = res.data.newFilename;
                } else {
                    this.$message({
                        message: res.message || '提交失败',
                        type: 'error'
                    });
                }

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
            handleItemChange(val) {
                for (var item of this.classifies) {
                    if (item.id == val && item.classify.length == 0) {
                        getClassifyById(val).then((res) => {
                            item.classify = res.data;
                            for (var item2 of item.classify) {
                                delete item2.classify;
                            }
                        });
                        break;
                    }
                }
            },
            selectChange(val) {
                var path = '';
                this.addForm.classifyId = val[1];
                for (var item of this.classifies) {
                    if (item.id === val[0]) {
                        path = item.label;
                        for (var child of item.classify) {
                            if (child.id === val[1]) {
                                path += '/' + child.label;
                                break;
                            }
                        }
                        break;
                    }

                }
                this.addForm.classifyName = path;
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
                            addMovie(oldFilename, newFilename, para).then((res) => {
                                this.addLoading = false;
                                if (res.data.status == 200) {
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['addForm'].resetFields();
                                    this.$refs.upload.clearFiles();
                                    this.turnBack();
                                } else {
                                    this.$message({
                                        message: res.data.message || '提交失败',
                                        type: 'error'
                                    });
                                }
                            });
                        });
                    }
                });
            }
        },
        mounted() {
            getClassify().then((res) => {
                this.classifies = res.data;
            })
        }
    }

</script>

<style>

</style>
