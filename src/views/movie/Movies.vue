<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.mvName" placeholder="视频名称"></el-input>
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
        <el-table :data="movies" stripe highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="mvName" label="视频名称" sortable>
            </el-table-column>
            <el-table-column prop="mvIntro" show-overflow-tooltip="true" label="视频简介" sortable>
            </el-table-column>
            <el-table-column prop="updateTime" width="200" label="更新时间" :formatter="dateFormat" sortable>
            </el-table-column>
            <el-table-column prop="classifyName" label="分类" sortable>
                <template slot-scope="scope">
                    <el-tag type="success" size="medium">{{ scope.row.classifyName }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="episodeCount" label="视频集数" sortable>
            </el-table-column>
            <el-table-column label="缩略图" render="columnRender" width="80">
                <template slot-scope="scope" >
                    <div v-html="imgRowRender(scope.row)"></div>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="280">
                <template scope="scope">
                    <el-button :type="scope.row.isPublic ? 'danger':'primary'" size="small" @click="handlePub(scope.$index, scope.row)">
                        {{ scope.row.isPublic ? '撤销发布' : '发布' }}
                    </el-button>
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button size="small" @click="handleManage(scope.$index, scope.row)">管理</el-button>
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
    </section>
</template>

<script>
    import util from '../../common/js/util'
    import { getMovieList, deleteMovie, deleteMovies, pubMovie, context } from '../../api/api';
    import moment from 'moment/moment';
    import Qs from 'qs';

    export default {
        data() {
            return {
                filters: {
                    mvName: ''
                },
                movies: [],
                total: 0,
                page: 1,
                pageSize: 10,
                listLoading: false,
                sels: [],//列表选中列
                uploadUrl: context + '/attach/doImgUpload',
                downloadUrl: context + '/attach/readFile'
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
            //获取用户列表
            getList() {
                let para = {
                    pageNum: this.page,
                    pageSize: this.pageSize,
                    mvName: this.filters.mvName
                };
                this.listLoading = true;

                getMovieList(para).then((res) => {
                    let data = res.data.data;
                    this.total = data.total;
                    this.pageSize = data.pageSize;
                    this.movies = data.list;
                    this.listLoading = false;
                });
            },
            imgRowRender: function (row) {
                var id = row.imgAppendixId;
                var url = this.downloadUrl + "?id=" + id + "&size=80";
                return "<div class=\"zoomImage\" style=\"background-image:url("+ url +");\"></div>";
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
                    deleteMovie(row.mvId).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getList();
                    });
                }).catch(() => {

                });
            },
            //显示管理界面
            handleManage: function (index, row) {
                this.$router.push({ path: '/episodes', query: { mvId: row.mvId } });
            },
            //发布管理
            handlePub: function (index, row) {
                let tips = row.isPublic ? '撤销发布' : '发布';
                this.$confirm('确认' + tips + '该视频吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    let para = {
                        mvId: row.mvId,
                        isPublic: row.isPublic ? 0 : 1
                    };
                    pubMovie(Qs.stringify(para)).then((res) => {
                        this.listLoading = false;
                        if (res.data.status == 200) {
                            this.$message({
                                message: tips+ '成功',
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
            //显示编辑界面
            handleEdit: function (index, row) {
                this.$router.push({ path: '/editMovie', query: { mvId: row.mvId } });
            },
            //显示新增界面
            handleAdd: function () {
                this.$router.push({ path: '/addMovie' });
            },
            selsChange: function (sels) {
                this.sels = sels;
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