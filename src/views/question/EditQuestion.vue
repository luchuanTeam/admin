<template>
    <section>
        <!--编辑界面-->
        <el-row style="margin: 20px 0;">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="题目名称" prop="questionName">
                    <el-input v-model="editForm.questionName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="题目内容" prop="questionContent">
                    <el-input type="textarea" v-model="editForm.questionContent" auto-complete="off"></el-input>
                </el-form-item>

                <el-form-item label="题目模块" prop="module">
                    <el-radio-group @change="radioSelectChange" v-model="editForm.module">
                        <el-radio :label=1>章节练习</el-radio>
                        <el-radio :label=2>专业知识练习</el-radio>
                        <el-radio :label=3>单元测试</el-radio>
                        <el-radio :label=4>期中期末</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="分类" prop="classifyName">
                    <el-input v-model="editForm.classifyName" auto-complete="off" :disabled=true></el-input>
                </el-form-item>
                <!--分类-->
                <!--<el-form-item label="分类" prop="classifyId">-->
                    <!--<el-cascader-->
                            <!--@change="selectChange"-->
                            <!--:options="classifies"-->
                            <!--@active-item-change="handleItemChange"-->
                            <!--:props="props"-->
                    <!--&gt;</el-cascader>-->
                <!--</el-form-item>-->

                <el-form-item label="题目类型" prop="questionType">
                    <el-radio-group v-model="editForm.questionType">
                        <el-radio :label=1 >选择题</el-radio>
                        <el-radio :label=2 >判断题</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="选项个数" prop="answerNum">
                    <el-input-number v-model="editForm.answerNum" :min="2" :max="4" label="答案选项个数"></el-input-number>
                </el-form-item>

                <el-form-item label="答案选项" prop="answer">
                    <el-select v-model="editForm.answer" placeholder="请选择">
                        <el-option value="answerA" label="A"></el-option>
                        <el-option value="answerB" label="B"></el-option>
                        <el-option value="answerC" label="C"></el-option>
                        <el-option value="answerD" label="D"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="选项A" prop="answerA">
                    <el-input v-model="editForm.answerA" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="选项B" prop="answerB">
                    <el-input v-model="editForm.answerB" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="选项C" prop="answerC">
                    <el-input v-model="editForm.answerC" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="选项D" prop="answerD">
                    <el-input v-model="editForm.answerD" auto-complete="off"></el-input>
                </el-form-item>
                <!--是否需要vip-->
                <el-form-item label="会员权限" prop="vipType">
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
                <!--音频上传-->
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
                        <el-button style="margin-left: 10px;" size="small" type="success" @click="mvSubmitUpload">
                            上传到服务器
                        </el-button>
                        <div slot="tip" class="el-upload__tip">只能上传mp4文件，且不超过50MB</div>
                    </el-upload>
                </el-form-item>
                <!--解题视频-->
                <el-form-item label="解题视频" prop="episodeId">
                    <el-select
                            v-model="editForm.episodeId"
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
                    <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
                </el-form-item>
            </el-form>
        </el-row>
    </section>
</template>

<script>
    import util from '../../common/js/util'
    import qs from 'qs'
    import {getTreeByType, getAllEpisodeList, editQuestion, getQuestion, context} from '../../api/api';

    import moment from 'moment/moment';
    import ElOption from "../../../node_modules/element-ui/packages/select/src/option.vue";

    export default {
        components: {ElOption},
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
                classifies: [],
                props: {
                    value: 'id',
                    children: 'classify'
                },
                vipType: [
                    {
                        value: 1,
                        label: 'vip会员'
                    },
                    {
                        value: 0,
                        label: '普通会员'
                    }
                ],
                editLoading: false,
                editFormRules: {
                    questionName: [
                        {required: true, message: '请输入题目名称', trigger: 'blur'}
                    ],
                    questionContent: [
                        {required: true, message: '请输入题目内容', trigger: 'blur'}
                    ],
                    answerA: [
                        {required: true, message: '请输入答案A内容', trigger: 'blur'}
                    ],
                    answerB: [
                        {required: true, message: '请输入答案B内容', trigger: 'blur'}
                    ]
                },
                //新增界面数据
                editForm: {
                },
                imgFilename: '',
                imgNewFilename: '',
                mvFilename: '',
                mvNewFilename: '',
                imgUploadUrl: context + '/attach/doImgUpload',
                mvUploadUrl: context + '/attach/doVideoUpload',
                downloadUrl: context + '/attach/readFile',
                movies: [],
                loading: false
            }
        },
        methods: {
            turnBack() {
                this.$router.back();
            },

            radioSelectChange(val) {
                let type = 3;
                if (val == 1 || val == 2) {
                    type = 3;
                } else if (val == 3) {
                    type = 5;
                } else if (val == 4) {
                    type = 6;
                }
                this.getList(type);
            },
            //分类选择
            selectChange(val) {
                var path = '';
                this.editForm.classifyId = val.join("/");

                let arr = this.classifies;

                for (let i = 0; i < val.length; i++) {
                    for (var item of arr) {
                        if (item.id === val[i]) {
                            path += "/" + item.label;
                            arr = item.classify;
                            break;
                        }
                    }
                }

                this.editForm.classifyName = path.substring(1);
                console.log(path)
            },

            handleItemChange(val) {

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
            imgHandleBefore(file) {
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
                            editQuestion(filePara, para).then((res) => {
                                this.editLoading = false;
                                if (res.data.status == 200) {
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['editForm'].resetFields();
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
            filterClassifies: function (arr) {
                for (var item of arr) {
                    if (item.classify.length > 0) {
                        this.filterClassifies(item.classify);
                    } else {
                        delete item.classify;
                    }
                }
            },
            getList: function(type) {
                let para = {
                    type: type
                };
                getTreeByType(para).then((res) => {
                    let arr = res.data;
                    this.filterClassifies(arr);
                    this.classifies = arr;
                })
            },
            remoteMethod(query) {
                if (query !== '') {
                    this.loading = true;
                    let para = {
                        pageSize: 20,
                        pageNum: 1,
                        searchVal: query
                    };
                    getAllEpisodeList(para).then((res) => {
                        this.loading = false;
                        let data = res.data.data.list;
                        if (data) {
                            this.movies = data.map((item, index) => {
                                return { value: item.episodeId, label: item.episodeName };
                            });
                        }
                    });
                } else {
                    this.movies = [];
                }
            },
        },
        mounted() {
            getQuestion(this.$route.query.questionId).then((res) => {
                if(res.data.status == 200) {
                    this.editForm = res.data.data;
                }
            });
            this.getList(3);
        }
    }

</script>

<style>

</style>
