<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.searchVal" placeholder="题目名称/内容"></el-input>
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
        <el-table :data="questions" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="questionName" label="题目名称" sortable>
            </el-table-column>
            <el-table-column prop="questionContent" label="题目内容" :show-overflow-tooltip=true sortable>
            </el-table-column>
            <el-table-column prop="questionType" label="题目类型" :formatter="typeFormat" sortable>
            </el-table-column>
            <el-table-column prop="module" label="所属模块" :formatter="moduleFormat" sortable>
            </el-table-column>
            <el-table-column prop="classifyName" label="分类" width="200" sortable>
                <template slot-scope="scope">
                    <el-tag type="success" size="medium">{{ scope.row.classifyName }}</el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="updateTime" label="更新时间" width="180" :formatter="dateFormat" sortable>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange"
                           :page-sizes="[20, 50, 100]" :page-size="pageSize" :total="total" style="float:right;">
            </el-pagination>
        </el-col>
    </section>
</template>

<script>
    import util from '../../common/js/util'
    import { getQuestionList, deleteQuestion, deleteQuestions } from '../../api/api';

    import moment from 'moment/moment';

    export default {
        data() {
            return {
                filters: {
                    searchVal: ''
                },
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
                questions: [],
                total: 0,
                page: 1,
                pageSize: 10,
                listLoading: false,
                sels: []//列表选中列
            }
        },
        methods: {
            handleSizeChange(val) {
                this.pageSize = val;
                this.getList();
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getList();
            },
            //模块格式化
            moduleFormat: function(row, column) {
                var value = row[column.property];
                if (value == 1) {
                    return '章节练习';
                } else if (value == 2) {
                    return '专业知识练习';
                } else if (value == 3) {
                    return '单元测试';
                } else if (value == 4) {
                    return '期中期末';
                }
            },
            //获取用户列表
            getList() {
                let para = {
                    pageNum: this.page,
                    pageSize: this.pageSize,
                    searchVal: this.filters.searchVal
                };
                this.listLoading = true;

                getQuestionList(para).then((res) => {
                    let data = res.data.data;
                    this.total = data.total;
                    this.pageSize = data.pageSize;
                    this.questions = data.list;
                    this.listLoading = false;
                });
            },
            //时间格式化
            dateFormat: function(row, column) {
                var date = row[column.property];
                if (date == undefined) {
                    return "";
                }
                return util.formatDate.format(new Date(date), 'yyyy-MM-dd hh:mm:ss');
            },
            //类型格式化
            typeFormat: function(row, column) {
                var value = row[column.property];
                if (value == 1)
                    return '选择题';
                return '判断题';
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    deleteQuestion(row.questionId).then((res) => {
                        this.listLoading = false;

                        if (res.data.status == 200) {
                            this.$message({
                                message: '提交成功',
                                type: 'success'
                            });
                            this.getList();
                        } else {
                            this.$message({
                                message: res.data.message || '删除失败',
                                type: 'error'
                            });
                        }

                    });
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.$router.push({ path: '/editQuestion', query: {questionId: row.questionId}});
            },
            //显示新增界面
            handleAdd: function () {
                this.$router.push({ path: '/addQuestion'});
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.questionId).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    deleteQuestions(ids).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getList();
                    });
                }).catch(() => {

                });
            }
        },
        mounted() {
            this.getList();
        }
    }

</script>
