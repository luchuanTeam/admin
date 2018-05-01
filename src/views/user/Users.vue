<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.searchVal" placeholder="用户名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getList">查询</el-button>
				</el-form-item>
				<!--<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>-->
			</el-form>
		</el-col>

		<!--列表-->
		<template>
			<el-table :data="users" highlight-current-row v-loading="loading" style="width: 100%;">
				<el-table-column type="index" width="60">
				</el-table-column>
				<el-table-column prop="userName" label="用户名" sortable>
				</el-table-column>
				<el-table-column prop="nickName" label="昵称" sortable>
				</el-table-column>
				<el-table-column prop="mobile" label="手机号" sortable>
				</el-table-column>
				<el-table-column prop="sex" label="性别" :formatter="sexFormat" sortable>
				</el-table-column>
				<el-table-column prop="status" label="账号状态" :formatter="statusFormat" sortable>
				</el-table-column>
				<el-table-column prop="createTime" label="注册时间" :formatter="dateFormat" sortable>
				</el-table-column>
				<el-table-column prop="updateTime" label="更新时间" :formatter="dateFormat" sortable>
				</el-table-column>
				<el-table-column label="操作" width="240">
					<template scope="scope">
						<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
						<el-button size="small" @click="handleManage(scope.$index, scope.row)">角色管理</el-button>
						<el-button :type="scope.row.status == 1 ? 'danger':'primary'" size="small" @click="handleDel(scope.$index, scope.row)">
							{{ scope.row.status == 1 ? '停用' : '启用' }}
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</template>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange"
						   :page-sizes="[10, 20, 50]" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="昵称" prop="nickName">
					<el-input v-model="editForm.nickName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="性别" prop="sex" >
					<el-radio-group v-model="editForm.sex">
						<el-radio v-for="item in sexType" :label="item.value">{{ item.label }}</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--角色管理界面-->
		<el-dialog title="角色管理" @close="handleRoleClose"  v-model="roleFormVisible" :close-on-click-modal="false">
			<el-form label-width="80px">
				<el-transfer v-model="userRoles" :props="{ key: 'roleId', label: 'cname'}" :data="roles" :titles="['未选择', '已选择']">
				</el-transfer>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="roleFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editRoleSubmit" :loading="editRoleLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>
<script>
    import util from '../../common/js/util';
	import { getUserList, editUser, getRoleList, getUserRoleList, updateUserRole } from '../../api/api';
    import Qs from 'qs';
	export default {
		data() {
			return {
                filters: {
                    searchVal: ''
                },
                total: 0,
                page: 1,
                pageSize: 10,
				loading: false,
				users: [],
                editFormRules: {
                    nickName: [
                        { required: true, message: '请输入昵称', trigger: 'blur' }
                    ],
                    sex: [
                        { required: true, message: '请选择性别', trigger: 'blur' }
                    ]
                },
                editForm: {
                    nickName: '',
					sex: 3
				},
                sexType: [
                    {
                        value: 1,
                        label: '男'
                    },
                    {
                        value: 2,
                        label: '女'
                    },
                    {
                        value: 3,
                        label: '未知'
                    }
                ],
                editLoading: false,
                editFormVisible: false,
                roles: [],
				userId: 0,
                userRoles: [],
                roleFormVisible: false,
                editRoleLoading: false
			}
		},
		methods: {
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editFormVisible = true;
                this.editForm.userId = row.userId;
                this.editForm.nickName = row.nickName;
                this.editForm.sex = row.sex;
            },
			//提交编辑
            editSubmit: function () {
                this.editLoading = true;
                let para = Object.assign({}, this.editForm);
                editUser(para).then((res) => {
                    this.loading = false;
                    if (res.data.status == 200) {
                        this.$message({
                            message: '更新成功',
                            type: 'success'
                        });
                        this.editLoading = false;
                        this.$refs['editForm'].resetFields();
                        this.editFormVisible = false;
                        this.getList();
                    } else {
                        this.$message({
                            message: res.data.message,
                            type: 'error'
                        });
                    }

                });
            },
			// 提交角色
            editRoleSubmit: function () {
                this.editRoleLoading = true;
                let para = {
                    roleIds: this.userRoles.join(",")
				};
                updateUserRole(this.userId, Qs.stringify(para)).then((res) => {
                    this.editRoleLoading = false;
					if (res.data.status == 200) {
                        this.$message({
                            message: '提交成功',
                            type: 'success'
                        });
                        this.roleFormVisible = false;
					} else {
                        this.$message({
                            message: res.data.message,
                            type: 'error'
                        });
					}
				});


			},
            handleSizeChange(val) {
                this.pageSize = val;
                this.getList();
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getList();
            },
            //时间格式化
            dateFormat: function(row, column) {
                var date = row[column.property];
                if (date == undefined) {
                    return "";
                }
                return util.formatDate.format(new Date(date), 'yyyy-MM-dd hh:mm:ss');
            },
			//性别格式化
            sexFormat: function(row, column) {
                var sex = row[column.property];
                if (sex == 1) {
                    return "男";
				} else if (sex == 2) {
                    return "女";
                } else {
                    return "未知";
				}
            },
            //账号状态格式化
            statusFormat: function(row, column) {
                var status = row[column.property];
                return  status == 1 ? '已启用' : '已停用';
            },
            //显示管理界面
            handleManage: function (index, row) {
                this.userId = row.userId;
                this.roleFormVisible = true;
                getRoleList().then((res) => {
                    if (res.data.status == 200) {
                        this.roles = res.data.data;
                    }
                });
                getUserRoleList(row.userId).then((res) => {
                    if (res.data.status == 200) {
                        res.data.data.forEach((item) => {
                            this.userRoles.push(item.roleId);
						});
                    }
                });
            },
            //删除
            handleDel: function (index, row) {
                let tips = row.status == 1 ? '停用' : '启用';
                this.$confirm('确认' + tips + '该用户吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.loading = true;
                    let para = {
                        userId: row.userId,
						status: row.status == 1 ? '0' : '1'
					}
                    editUser(para).then((res) => {
                        this.loading = false;
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
            //显示新增界面
            handleAdd: function () {
                this.$router.push({ path: '/addUser' });
            },
            handleRoleClose: function () {
				this.userRoles = [];
			},
			//获取用户列表
            getList: function () {
				let para = {
                    pageNum: this.page,
                    pageSize: this.pageSize,
                    searchVal: this.filters.searchVal
				};
				this.loading = true;
				getUserList(para).then((res) => {
                    let data = res.data.data;
                    this.total = data.total;
                    this.pageSize = data.pageSize;
					this.users = res.data.data.list;
					this.loading = false;
				});
			}
		},
		mounted() {
			this.getList();
		}
	};

</script>

<style scoped>

</style>