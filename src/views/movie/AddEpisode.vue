<template>
    <section>
        <!--新增界面-->
        <el-row style="margin: 20px 0;">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="视频名称" prop="episodeName">
                    <el-input v-model="addForm.episodeName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="视频简介" prop="episodeIntro">
                    <el-input type="textarea" v-model="addForm.episodeIntro" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="视频集数" prop="episodeNum">
                    <el-input v-model="addForm.episodeNum" auto-complete="off"></el-input>
                </el-form-item>
                <!--图片上传-->
                <el-form-item label="图片上传" prop="imgFilename">
                    <el-upload
                            class="upload-demo"
                            ref="upload2"
                            :action="imgUploadUrl"
                            :on-success="imgHandleSuccess"
                            :on-remove="imgHandleRemove"
                            limit="1"
                            :on-exceed="imgHandleExceed"
                            :before-upload="imgHandleBefore"
                            list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>
                <!--视频类型-->
                <el-form-item label="视频类型" prop="type" >
                    <el-radio-group v-model="addForm.type">
                        <el-radio v-for="item in mvType" :label="item.value">{{ item.label }}</el-radio>
                    </el-radio-group>
                </el-form-item>

                <!--是否需要vip-->
                <el-form-item label="视频权限" prop="vipType" >
                    <el-radio-group v-model="addForm.vipType">
                        <el-radio v-for="item in vipType" :label="item.value">{{ item.label }}</el-radio>
                    </el-radio-group>
                </el-form-item>

                <!--视频上传-->
                <el-form-item label="视频上传" prop="mvFilename">
                    <el-upload
                            class="upload-demo"
                            ref="upload"
                            :action="mvUploadUrl"
                            :on-preview="mvHandlePreview"
                            :on-remove="mvHandleRemove"
                            :on-success="mvHandleSuccess"
                            :auto-upload="false">
                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                        <el-button style="margin-left: 10px;" size="small" type="success" @click="mvSubmitUpload">上传到服务器</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传mp4/mp3文件，且不超过50MB</div>
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
    import qs from 'qs'
    import { addEpisode, getMovie, context } from '../../api/api';

    import moment from 'moment/moment';

    export default {
        data() {
            var checkImg = (rule, value, callback) => {
                if (this.imgFilename == '') {
                    callback(new Error('图片未上传'));
                }
                callback();
            };
            var checkVideo = (rule, value, callback) => {
                if (this.mvFilename == '') {
                    callback(new Error('视频未上传'));
                }
                callback();
            };
            return {
                mvType: [
                    {
                        value: 1,
                        label: '视频'
                    },
                    {
                        value: 2,
                        label: '音频'
                    }
                ],
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
                addLoading: false,
                addFormRules: {
                    episodeName: [
                        { required: true, message: '请输入视频名称', trigger: 'blur' }
                    ],
                    episodeCount: [
                        { required: true, message: '请输入视频当前集数', trigger: 'blur' }
                    ],
                    imgFilename: [
                        { required: true, trigger: 'blur', validator: checkImg }
                    ],
                    mvFilename: [
                        { required: true, trigger: 'blur', validator: checkVideo }
                    ]
                },
                //新增界面数据
                addForm: {
                    episodeName: '',
                    episodeIntro: '',
                    episodeNum: '',
                    mvId: this.$route.query.mvId,
                    type: 1,
                    vipType: 0
                },
                imgFilename: '',
                imgNewFilename: '',
                mvFilename: '',
                mvNewFilename: '',
                loading: false,
                imgUploadUrl: context + '/attach/doImgUpload',
                mvUploadUrl: context + '/attach/doVideoUpload',
                downloadUrl: context + '/attach/readFile'
            }
        },
        methods: {
            turnBack() {
                this.$router.back();
            },
            imgHandleRemove(file, fileList) {
                console.log(file, fileList);
                this.imgFilename = '';
                this.imgNewFilename = '';
            },
            imgHandleSuccess(res, file) {
                if (res.status == 200) {
                    this.imgFilename = res.data.filename;
                    this.imgNewFilename = res.data.newFilename;
                } else {
                    this.$message({
                        message: res.message || '提交失败',
                        type: 'error'
                    });
                }

            },
            imgHandleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
            },
            imgHandleBefore(file){
                if (this.imgFilename) {
                    this.$message.warning(`只能上传 1 个文件`);
                    return false;
                }
            },
            mvSubmitUpload() {
                this.$refs.upload.submit();
            },
            mvHandleSuccess(res, file) {
                if (res.status == 200) {
                    this.mvFilename = res.data.filename;
                    this.mvNewFilename = res.data.newFilename;
                } else {
                    this.$message({
                        message: res.message || '提交失败',
                        type: 'error'
                    });
                }
            },
            mvHandleRemove(file, fileList) {
                console.log(file, fileList);
            },
            mvHandlePreview(file) {
                console.log(file);
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            let para = Object.assign({}, this.addForm);
                            let filePara = {
                                imgFilename: this.imgFilename,
                                imgNewFilename: this.imgNewFilename,
                                mvFilename: this.mvFilename,
                                mvNewFilename: this.mvNewFilename
                            };
                            addEpisode(filePara, para).then((res) => {
                                this.addLoading = false;
                                if (res.data.status == 200) {
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['addForm'].resetFields();
                                    this.$refs.upload2.clearFiles();
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
            },
        },
        mounted() {
            getMovie(this.$route.query.mvId).then((res) => {
                if(res.data) {
                    this.addForm.episodeNum = res.data.episodeCount + 1;
                }
            });
        }
    }

</script>

<style>

</style>
