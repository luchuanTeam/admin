<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-button type="" v-on:click="handleBack">返回</el-button>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filters.episodeName" placeholder="视频名字"></el-input>
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
        <el-table :data="episodes" stripe highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="episodeName" label="视频名称" sortable>
            </el-table-column>
            <el-table-column prop="episodeIntro" :show-overflow-tooltip=true label="视频简介" sortable>
            </el-table-column>
            <el-table-column prop="episodeNum" label="当前集" width="100" sortable>
            </el-table-column>
            <el-table-column prop="createTime" width="200" label="创建时间" :formatter="dateFormat" sortable>
            </el-table-column>
            <el-table-column prop="updateTime" width="200" label="更新时间" :formatter="dateFormat" sortable>
            </el-table-column>
            <el-table-column label="缩略图" render="columnRender" width="80">
                <template slot-scope="scope" >
                    <div v-html="imgRowRender(scope.row)"></div>
                </template>
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
                           :page-sizes="[10, 20, 50]" :page-size="pageSize" :total="total" style="float:right;">
            </el-pagination>
        </el-col>
    </section>
</template>

<script>
    import util from '../../common/js/util'
    import { getEpisodeList, deleteEpisode, deleteEpisodes, context } from '../../api/api';

    import moment from 'moment/moment';

    export default {
        data() {
            return {
                filters: {
                    episodeName: ''
                },
                episodes: [],
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
            //获取用户列表
            getList() {
                let para = {
                    pageNum: this.page,
                    pageSize: this.pageSize,
                    mvId: this.$route.query.mvId,
                    episodeName: this.filters.episodeName
                };
                this.listLoading = true;

                getEpisodeList(para).then((res) => {
                    let data = res.data.data;
                    this.total = data.total;
                    this.pageSize = data.pageSize;
                    this.episodes = data.list;
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
                    deleteEpisode(row.episodeId).then((res) => {
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
            //显示编辑界面
            handleEdit: function (index, row) {
                this.$router.push({ path: '/editEpisode', query: { episodeId: row.episodeId } });
            },
            //显示新增界面
            handleAdd: function () {
                this.$router.push({ path: '/addEpisode', query: { mvId: this.$route.query.mvId } });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.episodeId).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    deleteEpisodes(ids).then((res) => {
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