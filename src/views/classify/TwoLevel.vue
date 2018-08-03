<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-button type="" v-on:click="handleBack">返回</el-button>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filters.classifyName" placeholder="分类名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getList">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="classifies" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="classifyName" label="分类名称" sortable>
            </el-table-column>
            <el-table-column prop="classifyDesc" label="分类描述" sortable>
            </el-table-column>
            <el-table-column prop="classifyOrder" label="排序号" sortable>
            </el-table-column>
            <el-table-column label="父级分类" render="columnRender">
                <template slot-scope="scope" >
                    <div v-html="parentName"></div>
                </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" :formatter="dateFormat" sortable>
            </el-table-column>
            <el-table-column label="操作" width="280">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" :disabled="scope.row.episodeCount > 0" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-pagination layout="sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange"
                           :page-sizes="[10, 20, 50]" :page-size="pageSize" :total="total" style="float:right;">
            </el-pagination>
        </el-col>


        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="名称" prop="classifyName">
                    <el-input v-model="editForm.classifyName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="classifyDesc">
                    <el-input v-model="editForm.classifyDesc" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="图标地址" prop="iconUrl">
                    <el-input v-model="editForm.iconUrl" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="排序号" prop="classifyOrder">
                    <el-input v-model="editForm.classifyOrder" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="名称" prop="classifyName">
                    <el-input v-model="addForm.classifyName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="classifyDesc">
                    <el-input v-model="addForm.classifyDesc" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="图标地址" prop="iconUrl">
                    <el-input v-model="addForm.iconUrl" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="排序号" prop="classifyOrder">
                    <el-input v-model="addForm.classifyOrder" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>

    </section>
</template>

<script>
    import util from '../../common/js/util'
    import { getTwoClassifyById,editClassify,addClassify,deleteClassify,deleteClassifies } from '../../api/api';
    import moment from 'moment/moment';
    import Qs from 'qs';

    export default {
        data() {
            return {
                filters: {
                    classifyName: ''
                },
                classifies: [],
                parentName: this.$route.query.classifyName,
                total: 0,
                page: 1,
                pageSize: 10,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    classifyName: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ]
                },
                //编辑界面数据
                editForm: {
                    classifyId: '',
                    classifyName: '',
                    classifyDesc: '',
                    classifyOrder: '',
                    iconUrl: ''
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    classifyName: [
                        { required: true, message: '请输入分类名称', trigger: 'blur' }
                    ],
                    classifyDesc: [
                        { required: true, message: '请输入分类描述', trigger: 'blur' }
                    ]
                },
                //新增界面数据
                addForm: {
                    classifyName: '',
                    classifyDesc: '',
                    classifyOrder: '',
                    iconUrl: '',
                    parentId: this.$route.query.classifyId
                }
            }
        },
        methods: {
            handleBack() {
                this.$router.back();
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.getList();
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getList();
            },
            //获取分类列表
            getList() {
                let para = {
                    pageNum: this.page,
                    pageSize: this.pageSize,
                    classifyName: this.filters.classifyName,
                    parentId: this.$route.query.classifyId,
                    classifyType: 1
                };
                this.listLoading = true;

                getTwoClassifyById(para).then((res) => {
                    let data = res.data.data;
                    this.total = data.total;
                    this.pageSize = data.pageSize;
                    this.classifies = data.list;
                    this.listLoading = false;
                });
            },
            imgRowRender: function (row) {
                return "<div class=\"zoomImage\" style=\"background-image:url("+ row.iconUrl +");\"></div>";
            },
            //时间格式化
            dateFormat: function(row, column) {
                var date = row[column.property];
                if (date == undefined) {
                    return "";
                }
                return util.formatDate.format(new Date(date), 'yyyy-MM-dd hh:mm:ss');
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    deleteClassify(row.classifyId).then((res) => {
                        this.listLoading = false;

                        if (res.data.status == 200) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getList();
                        } else {
                            this.$message({
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    });
                }).catch(() => {

                });
            },
            //显示管理界面
            handleManage: function (index, row) {
                this.$router.push({ path: '/twoLev', query: { classifyId: row.classifyId } });
            },

            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm.classifyId = row.classifyId;
                this.editForm.classifyName = row.classifyName;
                this.editForm.classifyDesc = row.classifyDesc;
                this.editForm.classifyOrder = row.classifyOrder;
                this.editForm.iconUrl = row.iconUrl;
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.$refs['addForm'].resetFields();
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            let para = Object.assign({}, this.editForm);
                            editClassify(para).then((res) => {

                                this.editLoading = false;
                                if (res.data.status == 200) {

                                    this.editFormVisible = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['editForm'].resetFields();
                                    this.getList();
                                } else {
                                    this.$message({
                                        message: res.data.message,
                                        type: 'success'
                                    });
                                }

                            });
                        });
                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            let para = Object.assign({}, this.addForm);
                            addClassify(para).then((res) => {

                                this.addLoading = false;
                                if (res.data.status == 200) {

                                    this.addFormVisible = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['addForm'].resetFields();
                                    this.getList();
                                } else {
                                    this.$message({
                                        message: res.data.message,
                                        type: 'success'
                                    });
                                }

                            });
                        });
                    }
                });
            }
        },
        mounted() {
            this.getList();
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