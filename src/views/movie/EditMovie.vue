<template>
    <section>
        <!--编辑界面-->
        <el-row style="margin: 20px 0;">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="视频名称" prop="mvName">
                    <el-input v-model="editForm.mvName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="视频简介" prop="mvIntro">
                    <el-input type="textarea" v-model="editForm.mvIntro" auto-complete="off"></el-input>
                </el-form-item>

                <el-form-item label="分类路径" prop="classifyName">
                    <el-input v-model="editForm.classifyName" :disabled=true auto-complete="off"></el-input>
                </el-form-item>

                <el-form-item label="修改分类" prop="classifyId">
                    <el-cascader
                            @change="selectChange"
                            :options="classifies"
                            @active-item-change="handleItemChange"
                            :props="props"
                    ></el-cascader>
                </el-form-item>

                <!--是否需要vip-->
                <el-form-item label="视频权限" prop="vipType" >
                    <el-radio-group v-model="editForm.vipType">
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
                            :file-list="fileList"
                            :on-exceed="handleExceed"
                            :before-upload="handleBefore"
                            list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>
                <el-form-item>
                    <el-button @click.native="turnBack">返回</el-button>
                    <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
                </el-form-item>
            </el-form>
        </el-row>
    </section>
</template>

<script>
    import util from '../../common/js/util'
    import { getMovie, editMovie, getClassify, getClassifyById, context } from '../../api/api';

    import moment from 'moment/moment';

    export default {
        data() {
            /*var classifyValidate = (rule, value, callback) => {
                if (value.length == 0) {
                    callback(new Error('请选择视频分类'));
                } else {
                    callback();
                }
            };*/
            var imgValidate = (rule, value, callback) => {
                if (this.editForm.filename == '') {
                    callback(new Error('图片未上传'));
                } else {
                    callback();
                }
            };
            return {
                classifies: [],
                fileList: [],
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
                editLoading: false,
                editFormRules: {
                    mvName: [
                        { required: true, message: '请输入视频名称', trigger: 'blur' }
                    ],
                    mvIntro: [
                        { required: true, message: '请输入视频简介', trigger: 'blur' }
                    ]/*,
                    filename: [
                        { required: true, message: '图片未上传', trigger: 'blur', validator: imgValidate }
                    ],
                    classifyId: [
                        { required: true, message: '请选择视频分类', trigger: 'blur', validator: classifyValidate }
                    ]*/
                },
                //新增界面数据
                editForm: {
                    mvId: this.$route.query.mvId,
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
                this.editForm.filename = '';
                this.editForm.newFilename = '';
            },
            handleSuccess(res) {
                this.editForm.filename = res.data.filename;
                this.editForm.newFilename = res.data.newFilename;
            },
            handleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
            },
            handleBefore(file){
                if (this.editForm.filename) {
                    this.$message.warning(`只能上传 1 个文件`);
                    return false;
                }
            },
            handleItemChange(val) {
                for (var item of this.classifies) {
                    if (item.id == val && item.classify.length == 0) {
                        let param = {
                            parentId: val[0]
                        };
                        getClassifyById(param).then((res) => {
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
                this.editForm.classifyId = val[1];
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
                this.editForm.classifyName = path;
            },
            //新增
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            let para = Object.assign({}, this.editForm);
                            let oldFilename = this.editForm.filename;
                            let newFilename = this.editForm.newFilename;
                            editMovie(oldFilename, newFilename, para).then((res) => {
                                this.editLoading = false;
                                if (res.data.status == 200) {
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['editForm'].resetFields();
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
            let param = {
                type: 1
            };
            getClassify(param).then((res) => {
                this.classifies = res.data;
            });
            getMovie(this.$route.query.mvId).then((res) => {
                if(res.data) {
                    this.editForm.mvName = res.data.mvName;
                    this.editForm.mvIntro = res.data.mvIntro;
                    this.editForm.classifyName = res.data.classifyName;
                    this.editForm.vipType = res.data.vipType;
                }
            });
        }
    }

</script>

<style>

</style>
