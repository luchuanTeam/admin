<template>
    <section>
        <!--新增界面-->
        <el-row style="margin: 20px 0;">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="视频名称" prop="episodeName">
                    <el-input v-model="editForm.episodeName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="视频简介" prop="episodeIntro">
                    <el-input v-model="editForm.episodeIntro" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="视频集数" prop="episodeNum">
                    <el-input v-model="editForm.episodeNum" auto-complete="off"></el-input>
                </el-form-item>

                <!--是否需要vip-->
                <el-form-item label="视频权限" prop="vipType" >
                    <el-radio-group v-model="editForm.vipType">
                        <el-radio v-for="item in vipType" :label="item.value">{{ item.label }}</el-radio>
                    </el-radio-group>
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
                        <div slot="tip" class="el-upload__tip">只能上传mp4文件，且不超过50MB</div>
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
    import { getEpisodeById, editEpisode, context } from '../../api/api';

    import moment from 'moment/moment';

    export default {
        data() {
            return {
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
                    episodeName: [
                        { required: true, message: '请输入视频名称', trigger: 'blur' }
                    ],
                    episodeIntro: [
                        { required: true, message: '请输入视频简介', trigger: 'blur' }
                    ]
                },
                //新增界面数据
                editForm: {
                    episodeId: this.$route.query.episodeId,
                    episodeName: '',
                    episodeIntro: '',
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
            imgHandleSuccess(res) {
                this.imgFilename = res.data.filename;
                this.imgNewFilename = res.data.newFilename;
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
            mvHandleSuccess(res) {
                this.mvFilename = res.data.filename;
                this.mvNewFilename = res.data.newFilename;
            },
            mvHandleRemove(file, fileList) {
                console.log(file, fileList);
            },
            mvHandlePreview(file) {
                console.log(file);
            },
            //新增
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            let para = Object.assign({}, this.editForm);
                            let filePara = {
                                imgFilename: this.imgFilename,
                                imgNewFilename: this.imgNewFilename,
                                mvFilename: this.mvFilename,
                                mvNewFilename: this.mvNewFilename
                            };
                            editEpisode(filePara, para).then((res) => {
                                this.editLoading = false;
                                if (res.data.status == 200) {
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['editForm'].resetFields();
                                    this.$refs.upload.clearFiles();
                                    this.$refs.upload2.clearFiles();
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
            getEpisodeById(this.$route.query.episodeId).then((res) => {
                if(res.data) {
                    this.editForm.episodeName = res.data.episodeName;
                    this.editForm.episodeIntro = res.data.episodeIntro;
                    this.editForm.episodeNum = res.data.episodeNum;
                    this.editForm.vipType = res.data.vipType;
                }
            });
        }
    }

</script>

<style>

</style>
