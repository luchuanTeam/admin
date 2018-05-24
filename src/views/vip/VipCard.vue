<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.searchVal" placeholder="会员卡号"></el-input>
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
		<template>
			<el-table :data="vipCards" highlight-current-row v-loading="loading" style="width: 100%;">
				<el-table-column type="index" width="60">
				</el-table-column>
				<el-table-column prop="cardNum" label="会员卡号" sortable>
				</el-table-column>
				<el-table-column prop="cardPassword" label="会员卡密码" sortable>
				</el-table-column>
				<el-table-column prop="purchaseMonths" label="开通月数" sortable>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" :formatter="dateFormat" sortable>
				</el-table-column>
				<el-table-column prop="updateTime" label="更新时间" :formatter="dateFormat" sortable>
				</el-table-column>
				<el-table-column prop="expTime" label="到期时间" :formatter="dateFormat" sortable>
				</el-table-column>
				<el-table-column prop="nickName" label="持卡人" sortable>
				</el-table-column>

				<el-table-column label="操作" width="240">
					<template scope="scope">
						<el-button size="small" @click="handleEdit(scope.$index, scope.row)">续费</el-button>
						<el-button size="small" :disabled="!!scope.row.userId" @click="handleBind(scope.$index, scope.row)">绑定持卡人</el-button>
						<el-button type="danger" :disabled="!!scope.row.userId" size="small" @click="handleDel(scope.$index, scope.row)">
							删除
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

		<!--新增界面-->
		<el-dialog title="新增会员卡" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="会员卡号" prop="cardNum">
					<el-input :disabled=true v-model="addForm.cardNum" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="卡密码" prop="cardPassword">
					<el-input type="password" v-model="addForm.cardPassword" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="确认密码" prop="checkPass">
					<el-input type="password" v-model="addForm.checkPass" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="开通月数" prop="purchaseMonths">
					<el-input-number v-model="addForm.purchaseMonths" :min="1" :max="99" label="描述文字"></el-input-number>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--续费界面-->
		<el-dialog title="续费" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="会员卡号">
					<el-input v-model="editForm.cardNum" :disabled=true></el-input>
				</el-form-item>
				<el-form-item label="到期时间">
					<el-input v-model="editForm.expTime" :disabled=true></el-input>
				</el-form-item>
				<el-form-item label="续费月数" prop="nickName">
					<el-input-number v-model="editForm.addMonth" :min="1" :max="99" label="描述文字"></el-input-number>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--绑定持卡人界面-->
		<el-dialog title="绑定持卡人" v-model="bindFormVisible" :close-on-click-modal="false">
			<el-form :model="bindForm" :rules="bindFormRules" ref="bindForm">
				<el-form-item label="会员卡号">
					<el-input v-model="bindForm.cardNum" :disabled=true></el-input>
				</el-form-item>
				<el-form-item label="绑定用户" prop="userId">
					<el-select
							v-model="bindForm.userId"
							filterable
							remote
							reserve-keyword
							placeholder="请输入关键词"
							@change="handleBindSelect"
							:remote-method="remoteMethod"
							:loading="bindLoading">
						<el-option
								v-for="item in users"
								:key="item.value"
								:label="item.label"
								:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="bindFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="bindSubmit" :loading="bindLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>
<script>
    import util from '../../common/js/util';
	import { getVipCardList, deleteVipCard, editVipCard, addVipCard, getUserList, bindVipCard, getVipCardNum } from '../../api/api';
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
                /**
				 * 列表数据属性
                 */
                vipCards: [],
                loading: false,
                /**
				 * 新增窗口数据属性
                 */
                addLoading: false,
                addFormVisible: false,
                addForm : {
                    cardNum: '',
                    cardPassword: '',
                    checkPass: '',
                    purchaseMonths: 1,
                    userId: '',
                    nickName: ''
                },
                addFormRules: {
                    cardPassword: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ],
                    checkPass: [
                        {required: true, message: '请输入确认密码', trigger: 'blur'},
                        {validator: (rule, value, callback) => {
                            if (value != this.addForm.cardPassword) {
                                callback(new Error('两次输入密码不一致'));
                            } else {
                                callback();
                            }
                        }}
                    ]
                },
				/**
				 * 续费窗口数据属性
				 */
                editLoading: false,
                editFormVisible: false,
                editForm : {
                    cardId: '',
                    cardNum: '',
                    purchaseMonths: 1,
                    expTime: '',
                    addMonth: 1
                },
                editFormRules: {

                },
                /**
				 * 绑定窗口数据属性
                 */
                bindLoading: false,
                bindFormVisible: false,
                bindForm : {
                    cardId: '',
					cardNum: '',
                    userId: '',
					nickName: ''
                },
                users: [],
                bindFormRules: {

				}
			}
		},
		methods: {
            /**
			 * table相关方法
             */
            //时间格式化
            dateFormat: function(row, column) {
                var date = row[column.property];
                if (date == undefined) {
                    return "";
                }
                return util.formatDate.format(new Date(date), 'yyyy-MM-dd hh:mm:ss');
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.getList();
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getList();
            },
            getList: function () {
                let para = {
                    pageNum: this.page,
                    pageSize: this.pageSize,
                    searchVal: this.filters.searchVal
                };
                this.loading = true;
                getVipCardList(para).then((res) => {
                    let data = res.data.data;
                    this.total = data.total;
                    this.pageSize = data.pageSize;
                    this.vipCards = res.data.data.list;
                    this.loading = false;
                });
            },
            handleAdd: function () {
                getVipCardNum().then((res) => {
					let cardNum = res.data;
					this.addForm.cardNum = cardNum;
                    this.addFormVisible = true;
                });
            },
            handleEdit: function (index, row) {
                this.editForm.cardId = row.cardId;
                this.editForm.cardNum = row.cardNum;
                this.editForm.purchaseMonths = row.purchaseMonths;
                this.editForm.expTime = row.expTime;
                this.editFormVisible = true;
            },
            handleBind: function (index, row) {
				this.bindForm.cardId = row.cardId;
                this.bindForm.cardNum = row.cardNum;
                this.bindFormVisible = true;
            },
            handleDel: function (index, row) {
                this.$confirm('确认删除该会员卡吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.loading = true;
                    deleteVipCard(row.cardId).then((res) => {
                        this.loading = false;
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
			/**
			 * 新增会员卡相关方法
			 */
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            let para = Object.assign({}, this.addForm);

                            addVipCard(para).then((res) => {
                                this.addLoading = false;
                                if (res.data.status == 200) {
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.addFormVisible = false;
                                    this.$refs['addForm'].resetFields();
                                    this.getList();
                                } else {
                                    this.$message({
                                        message: res.data.message,
                                        type: 'error'
                                    });
                                }
                            });
                        });
                    }
                });
            },

            /**
			 * 续费会员卡相关方法
             */
            editSubmit: function () {
                this.editLoading = true;
                let para = Object.assign({}, this.editForm);
				let addMonth = this.editForm.addMonth;

                editVipCard(para, addMonth).then((res) => {
                    this.editLoading = false;
                    if (res.data.status == 200) {
                        this.$message({
                            message: '续费成功',
                            type: 'success'
                        });
                        this.editFormVisible = false;
                        this.$refs['editForm'].resetFields();
                        this.getList();
                    } else {
                        this.$message({
                            message: res.data.message,
                            type: 'error'
                        });
                    }

                });
            },

            /**
			 * 绑定持卡人相关方法
             */
            bindSubmit: function () {
                this.bindLoading = true;
                let para = Object.assign({}, this.bindForm);

                bindVipCard(para).then((res) => {
                    this.bindLoading = false;
					if (res.data.status == 200) {
                        this.$message({
                            message: '提交成功',
                            type: 'success'
                        });
                        this.bindFormVisible = false;
                        this.$refs['bindForm'].resetFields();
                        this.getList();
					} else {
                        this.$message({
                            message: res.data.message,
                            type: 'error'
                        });
					}
				});
			},
            remoteMethod(query) {
                if (query !== '') {
                    this.bindLoading = true;
                    let para = {
                        pageSize: 1000,
                        pageNum: 1,
                        searchVal: query
                    };
                    getUserList(para).then((res) => {
                        this.bindLoading = false;
                        let data = res.data.data.list;
                        if (data) {
                            this.users = data.map((item) => {
                                return { value: item.userId, label: item.nickName };
                            });
                        }
                    });
                } else {
                    this.users = [];
                }
            },
            handleBindSelect: function(val) {
				this.users.map((item) => {
                    if (item.value == val) {
                        this.bindForm.nickName = item.label;
					}
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