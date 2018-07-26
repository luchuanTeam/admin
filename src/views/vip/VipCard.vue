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
				<el-form-item>
					<el-button type="success" @click="handleBatchAdd">批量生成</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="success" @click="exportExcel">导出</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<template>
			<el-table id="table" :data="vipCards" highlight-current-row @selection-change="selsChange" v-loading="loading" style="width: 100%;">
				<el-table-column type="selection" width="55">
				</el-table-column>
				<el-table-column type="index" width="60">
				</el-table-column>
				<el-table-column prop="cardNum" label="会员卡号" width="160" sortable>
				</el-table-column>
				<el-table-column prop="cardPassword" label="卡密" sortable>
				</el-table-column>
				<el-table-column prop="purchaseDays" label="开通天数" sortable>
				</el-table-column>
				<el-table-column prop="isForever" label="会员期限" sortable>
					<template slot-scope="scope">
						<el-tag type="success" size="medium">{{ scope.row.isForever ? '永久' : '限期' }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="updateTime" label="更新时间" width="180" :formatter="dateFormat" sortable>
				</el-table-column>
				<el-table-column prop="expTime" label="到期时间" width="180" :formatter="dateFormat" sortable>
				</el-table-column>
				<el-table-column prop="nickName" label="持卡人" sortable>
				</el-table-column>

				<el-table-column label="操作" width="240">
					<template scope="scope">
						<el-button size="small" @click="handleEdit(scope.$index, scope.row)">续费</el-button>
						<el-button size="small" :disabled="!!scope.row.userId" @click="handleBind(scope.$index, scope.row)">绑定持卡人</el-button>
						<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">
							删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</template>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange"
						   :page-sizes="[20, 50, 100]" :page-size="pageSize" :total="total" style="float:right;">
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
				<el-form-item label="永久会员">
					<el-radio-group v-model="addForm.isForever">
						<el-radio :label=false>否</el-radio>
						<el-radio :label=true>是</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="开通天数" prop="purchaseDays">
					<el-input-number v-model="addForm.purchaseDays" :min="1" :max="999" label="描述文字"></el-input-number>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>

        <!--批量新增界面-->
        <el-dialog title="批量生成会员卡" v-model="batchAddFormVisible" :close-on-click-modal="false">
            <el-form :model="batchAddForm" label-width="80px" :rules="batchAddFormRules" ref="batchAddForm">
				<el-form-item label="生成个数" prop="count">
					<el-input-number v-model="batchAddForm.count" :min="1" :max="10000" label="描述文字"></el-input-number>
				</el-form-item>
				<el-form-item label="开通天数" prop="purchaseDays">
					<el-input-number v-model="batchAddForm.purchaseDays" :min="1" :max="999" label="描述文字"></el-input-number>
				</el-form-item>
				<el-form-item label="永久会员">
					<el-radio-group v-model="batchAddForm.isForever">
						<el-radio :label=false>否</el-radio>
						<el-radio :label=true>是</el-radio>
					</el-radio-group>
				</el-form-item>

				<el-form-item label="随机密码" prop="random">
					<el-radio-group @change="selectChange" v-model="batchAddForm.random">
						<el-radio label="1">是</el-radio>
						<el-radio label="0">否</el-radio>
					</el-radio-group>
				</el-form-item>

                <el-form-item label="卡密码" prop="cardPassword" v-show="pwVisible">
                    <el-input type="password" v-model="batchAddForm.cardPassword" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="checkPass" v-show="pwVisible">
                    <el-input type="password" v-model="batchAddForm.checkPass" auto-complete="off"></el-input>
                </el-form-item>


            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="batchAddFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="batchAddSubmit" :loading="batchAddLoading">提交</el-button>
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
				<el-form-item label="永久会员">
					<el-radio-group v-model="editForm.isForever">
						<el-radio :label=false>否</el-radio>
						<el-radio :label=true>是</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="续费天数" prop="nickName">
					<el-input-number v-model="editForm.addDays" :min="1" :max="999" label="描述文字"></el-input-number>
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
	import { getVipCardList, deleteVipCard, batchDeleteVipCard, editVipCard, addVipCard, batchAddVipCard, getUserList, bindVipCard, getVipCardNum } from '../../api/api';
    import Qs from 'qs';
    import FileSaver from 'file-saver';
    import XLSX from 'xlsx';

	export default {
		data() {
			return {
                filters: {
                    searchVal: ''
                },
                total: 0,
                page: 1,
                pageSize: 50,
                /**
				 * 列表数据属性
                 */
                vipCards: [],
                loading: false,
                sels: [],//列表选中列
                /**
				 * 新增窗口数据属性
                 */
                addLoading: false,
                addFormVisible: false,
                addForm : {
                    cardNum: '',
                    cardPassword: '',
                    checkPass: '',
                    purchaseDays: 1,
                    userId: '',
                    nickName: '',
					isForever: false
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
                 * 批量新增窗口数据属性
                 */
                pwVisible: false,
                batchAddLoading: false,
                batchAddFormVisible: false,
                batchAddForm : {
                    cardPassword: '',
                    checkPass: '',
                    purchaseDays: 1,
                    isForever: false,
                    count: 1,
                    random: '1'
                },
                batchAddFormRules: {
                    cardPassword: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {validator: (rule, value, callback) => {
                            if (this.batchAddForm.cardPassword.length < 6) {
                                callback(new Error('请输入六位数以上的密码'));
                            } else {
                                callback();
                            }
                        }}
                    ],
                    checkPass: [
                        {required: true, message: '请输入确认密码', trigger: 'blur'},
                        {validator: (rule, value, callback) => {
                            if (value != this.batchAddForm.cardPassword) {
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
                    purchaseDays: 1,
                    expTime: '',
                    addDays: 1,
                    isForever: false
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
					nickName: '',
					purchaseDays: ''
                },
                users: [],
                bindFormRules: {

				}
			}
		},
		methods: {
            /**
			 * 导出excel
             * @returns {any}
             */
            exportExcel () {
                let data = this.sels;
                if (data.length <= 0) {
                    this.$message({
                        message: '请先勾选要导出的数据',
                        type: 'warning'
                    });
                    return false;
				}

                for (let i = 0; i < data.length; i++) {
                    delete data[i].cardId;
                    delete data[i].userId;
                    data[i].isForever = data[i].isForever ? '永久' : '限期';
				}

                var ws = XLSX.utils.json_to_sheet(data, {skipHeader: false});
                var wb = XLSX.utils.book_new(ws);
                XLSX.utils.book_append_sheet(wb, ws, "demo");
                /* generate workbook object from table */
                //var wb = XLSX.utils.table_to_book(document.querySelector('#table'), {display: true})
                /* get binary string as output */
                var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
                try {
                    FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '会员卡列表.xlsx')
                } catch (e) { if (typeof console !== 'undefined') console.log(e, wbout) }
                return wbout
            },

            selectChange(val) {
                if (val == '1') {
                    this.pwVisible = false;
                } else {
                    this.pwVisible = true;
                }
            },
			
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
            handleBatchAdd: function () {
                this.batchAddFormVisible = true;
            },
            handleEdit: function (index, row) {
                this.editForm.cardId = row.cardId;
                this.editForm.cardNum = row.cardNum;
                this.editForm.purchaseDays = row.purchaseDays;
                this.editForm.expTime = row.expTime;
                this.editForm.isForever = row.isForever;
                if (row.userId) {
                    this.editForm.userId = row.userId;
				}
                this.editFormVisible = true;
            },
            handleBind: function (index, row) {
				this.bindForm.cardId = row.cardId;
                this.bindForm.cardNum = row.cardNum;
                this.bindForm.purchaseDays = row.purchaseDays;
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
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                this.$confirm('确认删除这些会员卡吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.loading = true;
                    var ids = this.sels.map(item => item.cardId).toString();
                    batchDeleteVipCard(ids).then((res) => {
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
             * 批量生成会员卡相关方法
             */
            batchAddSubmit: function () {
                this.$refs.batchAddForm.validate((valid) => {
                    if (valid || this.batchAddForm.random == '1') {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.batchAddLoading = true;
                            let para = Object.assign({}, this.batchAddForm);

                            batchAddVipCard(Qs.stringify(para)).then((res) => {
                                this.batchAddLoading = false;
                                if (res.data.status == 200) {
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.batchAddFormVisible = false;
                                    this.$refs['batchAddForm'].resetFields();
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
				let addDays = this.editForm.addDays;

                editVipCard(para, addDays).then((res) => {
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