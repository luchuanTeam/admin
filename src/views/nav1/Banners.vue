<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.imgDesc" placeholder="图片描述"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getBanners">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="imgs" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="imgDesc" label="图片描述" sortable>
			</el-table-column>
			<el-table-column prop="imgUrl" label="图片地址" min-width="180" sortable>
			</el-table-column>
			<el-table-column prop="createTime" label="创建时间" :formatter="dateFormat" sortable>
			</el-table-column>
			<el-table-column prop="updateTime" label="更新时间" :formatter="dateFormat" sortable>
			</el-table-column>
			<el-table-column label="缩略图" render="columnRender" width="80">
				<template slot-scope="scope">
					<div class="zoomImage" :style="{'background-image':'url('+scope.row.imgUrl+')'}"></div>
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

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="图片描述" prop="imgDesc">
					<el-input v-model="editForm.imgDesc" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="图片地址">
					<el-input v-model="editForm.imgUrl" :disabled=true></el-input>
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
				<el-form-item label="图片描述" prop="imgDesc">
					<el-input v-model="addForm.imgDesc" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="图片上传">
					<el-upload
							class="upload-demo"
							:action="uploadUrl"
							:on-success="handleSuccess"
							:on-remove="handleRemove"
							limit="1"
							:on-exceed="handleExceed"
							:before-upload="handleBefore"
							list-type="picture">
						<el-button size="small" type="primary">点击上传</el-button>
						<div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
					</el-upload>
				</el-form-item>
				<el-form-item label="图片地址" prop="imgUrl">
					<el-input v-model="addForm.imgUrl" :disabled=true></el-input>
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
	//import NProgress from 'nprogress'
	import { getBannerList, deleteBanner, deleteBanners, editBanner, addBanner, context } from '../../api/api';

	import moment from 'moment/moment';

	export default {
		data() {
			return {
				filters: {
					imgDesc: ''
				},
				imgs: [],
				total: 0,
				page: 1,
				pageSize: 10,
				listLoading: false,
				sels: [],//列表选中列
				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
                    imgDesc: [
						{ required: true, message: '请输入图片描述', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
					imgId: 0,
					imgDesc: '',
					imgUrl: '',
					createTime: ''
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
                    imgDesc: [
                        { required: true, message: '请输入图片描述', trigger: 'blur' }
                    ],
                    imgUrl: [
                        { required: true, message: '图片未上传', trigger: 'blur' }
                    ]
				},
				//新增界面数据
				addForm: {
                    imgDesc: '',
                    imgUrl: ''
				},
				uploadUrl: context + '/banner/fileUpload'
			}
		},
		methods: {
            columnRender (createElement, { column }) {
                return createElement(
                    'div',
                    [
                        createElement('a', ['==' + column.imgUrl + '=='], {
                            attrs: {
                                href: '#test'
                            }
                        })
                    ]
                );
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.getBanners();
            },
			handleCurrentChange(val) {
				this.page = val;
				this.getBanners();
			},
            handleRemove(file, fileList) {
                console.log(file, fileList);
                this.addForm.imgUrl = '';
            },
            handleSuccess(res) {
                this.addForm.imgUrl = res.data;
            },
            handleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
			},
            handleBefore(file){
                if (this.addForm.imgUrl) {
                    this.$message.warning(`只能上传 1 个文件`);
                    return false;
				}
			},
			//获取用户列表
			getBanners() {
				let para = {
                    pageNum: this.page,
                    pageSize: this.pageSize,
					imgDesc: this.filters.imgDesc
				};
				this.listLoading = true;
				//NProgress.start();
                getBannerList(para).then((res) => {
                    let data = res.data.data;
					this.total = data.total;
					this.pageSize = data.pageSize;
					this.imgs = data.list;
					this.listLoading = false;
					//NProgress.done();
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
					//NProgress.start();
                    deleteBanner(row.imgId).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getBanners();
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
                    imgDesc: '',
                    imgUrl: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.editForm);
                            editBanner(para).then((res) => {
								this.editLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
								this.getBanners();
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
							//NProgress.start();
							let para = Object.assign({}, this.addForm);
                            addBanner(para).then((res) => {
								this.addLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
								this.getBanners();
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
				var ids = this.sels.map(item => item.imgId).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
                    deleteBanners(ids).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getBanners();
					});
				}).catch(() => {

				});
			}
		},
		mounted() {
			this.getBanners();
		}
	}

</script>

<style scoped>
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