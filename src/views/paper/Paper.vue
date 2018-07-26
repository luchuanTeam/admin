<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.searchVal" placeholder="试题名称/描述"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getpapers">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="papers" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="paperName" label="试题名称" sortable>
			</el-table-column>
			<el-table-column prop="paperDesc" label="试题描述" sortable>
			</el-table-column>
			<el-table-column prop="createTime" label="创建时间" :formatter="dateFormat" sortable>
			</el-table-column>
			<el-table-column prop="updateTime" label="更新时间" :formatter="dateFormat" sortable>
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
			<!--<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>-->
			<el-pagination layout="sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange"
				   :page-sizes="[10, 20, 50]" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="试题名称" prop="paperName">
					<el-input v-model="editForm.paperName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="试题描述" prop="paperDesc">
					<el-input type="textarea" v-model="editForm.paperDesc" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="创建时间">
					<el-input v-model="editForm.createTime" :disabled=true></el-input>
				</el-form-item>
				<el-form-item label="上次更新时间">
					<el-input v-model="editForm.updateTime" :disabled=true></el-input>
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
				<el-form-item label="试题名称" prop="paperName">
					<el-input v-model="addForm.paperName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="试题描述" prop="paperDesc">
					<el-input type="textarea" v-model="addForm.paperDesc" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="附件上传">
					<el-upload
							class="upload-demo"
							:action="uploadUrl"
							:on-success="handleSuccess"
							:on-remove="handleRemove"
							:limit=1
							:on-exceed="handleExceed"
							:before-upload="handleBefore">
						<el-button size="small" type="primary">点击上传</el-button>
						<div slot="tip" class="el-upload__tip">只能上传doc、pdf文件，且不超过500kb</div>
					</el-upload>
				</el-form-item>
				<el-form-item label="附件地址" prop="filename">
					<el-input v-model="addForm.filename" :disabled=true></el-input>
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
	import { getPaperList, deletePaper, deletepapers, editPaper, addPaper, context } from '../../api/api';

	import moment from 'moment/moment';

	export default {
		data() {
			return {
				filters: {
					searchVal: ''
				},
				papers: [],
				total: 0,
				page: 1,
				pageSize: 10,
				listLoading: false,
				sels: [],//列表选中列
				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
                    PaperDesc: []
				},
				//编辑界面数据
				editForm: {
					paperId: 0,
					paperName: '',
                    paperDesc: ''
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
                    filename: [
                        { required: true, message: '图片未上传', trigger: 'blur' }
                    ]
				},
				//新增界面数据
				addForm: {
				    paperName: '',
                    paperDesc: '',
                    filename: '',
                    newFilename: ''
				},
				uploadUrl: context + '/attach/doUpload',
				downloadUrl: context + '/attach/readFile'
			}
		},
		methods: {
            handleSizeChange(val) {
                this.pageSize = val;
                this.getpapers();
            },
			handleCurrentChange(val) {
				this.page = val;
				this.getpapers();
			},
            handleRemove(file, fileList) {
                console.log(file, fileList);
                this.addForm.filename = '';
            },
            handleSuccess(res) {
                if (res.status == 200) {
                    this.addForm.filename = res.data.filename;
                    this.addForm.newFilename = res.data.newFilename;
				} else {
                    this.$message({
                        message: res.message,
                        type: 'error'
                    });
				}

            },
            handleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
			},
            handleBefore(file){
//                if (file.type.indexOf("msword") <= -1
//					&& file.type.indexOf("pdf") <= -1
//					&& file.type.indexOf("document") <= -1) {
//                    this.$message.warning(`只能上传doc/docx/pdf类型的文件`);
//                    return false;
//				}
                if (this.addForm.filename) {
                    this.$message.warning(`只能上传 1 个文件`);
                    return false;
				}
			},
			//获取用户列表
			getpapers() {
				let para = {
                    pageNum: this.page,
                    pageSize: this.pageSize,
                    searchVal: this.filters.searchVal,
                    paperType: 1
				};
				this.listLoading = true;

                getPaperList(para).then((res) => {
                    let data = res.data.data;
					this.total = data.total;
					this.pageSize = data.pageSize;
					this.papers = data.list;
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
        	//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
                    deletePaper(row.id).then((res) => {
						this.listLoading = false;

                        if (res.data.status == 200) {
                            this.$message({
                                message: '提交成功',
                                type: 'success'
                            });
                            this.getpapers();
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
				this.editFormVisible = true;
                row.createTime = util.formatDate.format(new Date(row.createTime), 'yyyy-MM-dd hh:mm:ss');
                row.updateTime = util.formatDate.format(new Date(row.updateTime), 'yyyy-MM-dd hh:mm:ss');
				this.editForm = Object.assign({}, row);
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
                    paperName: '',
                    paperDesc: '',
                    filename: '',
                    newFilename: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							let para = Object.assign({}, this.editForm);
                            editPaper(para).then((res) => {

								this.editLoading = false;

                                if (res.data.status == 200) {
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['editForm'].resetFields();
                                    this.editFormVisible = false;
                                    this.getpapers();
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
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							let para = Object.assign({}, this.addForm);
							let oldfilename = this.addForm.filename;
							let newFilename = this.addForm.newFilename;
                            addPaper(oldfilename, newFilename, para).then((res) => {

								this.addLoading = false;

                                if (res.data.status == 200) {
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['addForm'].resetFields();
                                    this.addFormVisible = false;
                                    this.getpapers();
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
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.PaperId).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
                    deletepapers(ids).then((res) => {
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getpapers();
					});
				}).catch(() => {

				});
			}
		},
		mounted() {
			this.getpapers();
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