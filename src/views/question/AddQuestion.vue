<template>
    <section>
        <!--新增界面-->
        <el-row style="margin: 20px 0;">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="题目名称" prop="questionName">
                    <el-input v-model="addForm.questionName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="题目内容" prop="questionContent">
                    <el-input type="textarea" v-model="addForm.questionContent" auto-complete="off"></el-input>
                </el-form-item>

                <el-form-item label="题目模块" prop="module">
                    <el-radio-group @change="radioSelectChange" v-model="addForm.module">
                        <el-radio :label=1>专题练习</el-radio>
                        <el-radio :label=2>知识巩固</el-radio>
                        <el-radio :label=3>历年真题</el-radio>
                        <el-radio :label=4>仿真练习</el-radio>
                    </el-radio-group>
                </el-form-item>

                <!--分类-->
                <el-form-item label="分类" prop="classifyId">
                    <el-cascader
                            @change="selectChange"
                            :options="classifies"
                            @active-item-change="handleItemChange"
                            :props="props"
                    ></el-cascader>
                </el-form-item>

                <el-form-item label="题目类型" prop="questionType">
                    <el-radio-group v-model="addForm.questionType">
                        <el-radio :label=1>选择题</el-radio>
                        <el-radio :label=2>判断题</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="选项个数" prop="answerNum">
                    <el-input-number v-model="addForm.answerNum" :min="2" :max="4" label="答案选项个数"></el-input-number>
                </el-form-item>

                <el-form-item label="答案选项" prop="answer">
                    <el-select v-model="addForm.answer" placeholder="请选择">
                        <el-option value="A" label="A"></el-option>
                        <el-option value="B" label="B"></el-option>
                        <el-option value="C" label="C"></el-option>
                        <el-option value="D" label="D"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="选项A" prop="answerA">
                    <el-input v-model="addForm.answerA" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="选项B" prop="answerB">
                    <el-input v-model="addForm.answerB" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="选项C" prop="answerC">
                    <el-input v-model="addForm.answerC" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="选项D" prop="answerD">
                    <el-input v-model="addForm.answerD" auto-complete="off"></el-input>
                </el-form-item>
                <!--是否需要vip-->
                <el-form-item label="会员权限" prop="vipType">
                    <el-radio-group v-model="addForm.vipType">
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
                            v-model="addForm.episodeId"
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
    import qs from 'qs'
    import {getTreeByType, getAllEpisodeList, addQuestion, context, ClsTypeEnum} from '../../api/api';

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
                addLoading: false,
                addFormRules: {
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
//                    imgFilename: [
//                        {required: true, trigger: 'blur', validator: checkImg}
//                    ],
//                    mvFilename: [
//                        {required: true, trigger: 'blur', validator: checkVideo}
//                    ]
                },
                //新增界面数据
                addForm: {
                    questionName: '',
                    questionContent: '',
                    module: 1,
                    classifyId: '',
                    classifyName: '',
                    questionType: 1,
                    answerNum: '2',
                    answer: '',
                    answerA: '',
                    answerB: '',
                    answerC: '',
                    answerD: '',
                    vipType: 1,
                    episodeId: ''
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
                let type = '';
                if (val == 1) {
                    type = ClsTypeEnum.ZTLXZ;
                } else if (val == 2) {
                    type = ClsTypeEnum.ZSGGZ;
                } else if (val == 3) {
                    type = ClsTypeEnum.LNZT;
                } else if (val == 4) {
                    type = ClsTypeEnum.FZLX;
                }
                this.getList(type);
            },
            //分类选择
            selectChange(val) {
                var path = '';
                this.addForm.classifyId = val.join("/");

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

                this.addForm.classifyName = path.substring(1);
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
                            addQuestion(filePara, para).then((res) => {
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
            this.getList(ClsTypeEnum.ZTLXZ);
        }
    }

</script>

<style>

</style>
