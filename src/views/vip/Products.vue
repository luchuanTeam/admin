<template>
    <section>
        <el-row>
            <el-col :span="24" class="toolbar" style="">
                <el-button type="primary" @click="handleAdd">新增</el-button>
            </el-col>
        </el-row>


        <!--列表-->
        <template>
            <el-row>
                <el-col :span="5" v-for="item, index in products" style="margin: 0 50px 20px 0;">
                    <el-card :body-style="{ padding: '0px' }">
                        <img src="http://www.yanda123.com/app/vipcard.png" class="image">
                        <div style="padding: 14px;">
                            <span>{{item.name}}</span>
                            <div v-html="timeUnitFormat(item)"></div>
                            <div>原价：{{item.oldPrice}}元</div>
                            <div>现价：{{item.currentPrice}}元</div>
                            <div class="bottom clearfix">
                                <time class="time">{{item.createTime}}</time>
                                <el-button type="text" class="button" @click="handleDel(item.id)">删除</el-button>
                                <el-button type="text" class="button" @click="handleEdit(item)" style="margin-right: 10px">编辑</el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </template>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="计数单位" prop="timeUnit">
                    <el-radio-group v-model="addForm.timeUnit">
                        <el-radio v-for="item in timeType" :label="item.value">{{ item.label }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="数量" prop="timeNum">
                    <el-input type="number" v-model="addForm.timeNum" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="原价" prop="oldPrice">
                    <el-input type="number" v-model="addForm.oldPrice" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="现价" prop="currentPrice">
                    <el-input type="number" v-model="addForm.currentPrice" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="排序号" prop="productOrder">
                    <el-input type="number" v-model="addForm.productOrder" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="计数单位" prop="timeUnit">
                    <el-radio-group v-model="editForm.timeUnit">
                        <el-radio v-for="item in timeType" :label="item.value">{{ item.label }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="数量" prop="timeNum">
                    <el-input type="number" v-model="editForm.timeNum"></el-input>
                </el-form-item>
                <el-form-item label="原价" prop="oldPrice">
                    <el-input type="number" v-model="editForm.oldPrice"></el-input>
                </el-form-item>
                <el-form-item label="现价" prop="currentPrice">
                    <el-input type="number" v-model="editForm.currentPrice"></el-input>
                </el-form-item>
                <el-form-item label="排序号" prop="productOrder">
                    <el-input type="number" v-model="editForm.productOrder"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

    </section>
</template>
<script>
    import util from '../../common/js/util';
    import { getProductList, upsertProduct, deleteProduct } from '../../api/api';
    import Qs from 'qs';
    import ElRow from "element-ui/packages/row/src/row";
    export default {
        components: {ElRow},
        data() {
            return {
                /**
                 * 列表数据属性
                 */
                products: [],
                timeType: [
                    {value: 1, label: '年'},
                    {value: 2, label: '月'},
                    {value: 3, label: '天'},
                    {value: 4, label: '永久'}
                ],
                loading: false,
                /**
                 * 新增窗口数据属性
                 */
                addLoading: false,
                addFormVisible: false,
                addForm: {
                    name: '',
                    timeUnit: '',
                    timeNum: '',
                    oldPrice: '',
                    currentPrice: '',
                    productOrder: '',
                    product: 'vipCard'
                },
                addFormRules: {

                },
                /**
                 * 编辑属性
                 */
                editLoading: false,
                editFormVisible: false,
                editForm : {

                },
                editFormRules: {

                },
            }
        },
        methods: {
            /**
             * table相关方法
             */
            //时间格式化
            dateFormat: function(date) {
                if (date == undefined) {
                    return "";
                }
                return util.formatDate.format(new Date(date), 'yyyy-MM-dd hh:mm:ss');
            },
            //计算方式格式化
            timeUnitFormat: function (item) {
              for (let i = 0; i < this.timeType.length; i++) {
                  if (item.timeUnit == this.timeType[i].value) {
                      if (item.timeUnit == 4)
                          return '时长：' + '永久';
                      return '时长：' + item.timeNum + this.timeType[i].label;
                  }
              }
            },
            getList: function () {

                this.loading = true;
                getProductList().then((res) => {
                    this.products = res.data.data;
                    this.loading = false;
                });
            },
            handleAdd: function () {
                this.addFormVisible = true;

            },
            handleEdit: function (row) {
                this.editForm = row;
                this.editFormVisible = true;
            },
            handleDel: function (id) {
                this.$confirm('确认删除该商品吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.loading = true;
                    deleteProduct(id).then((res) => {
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

                            upsertProduct(para).then((res) => {
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
             * 编辑
             */
            editSubmit: function () {
                this.editLoading = true;
                let para = Object.assign({}, this.editForm);

                upsertProduct(para).then((res) => {
                    this.editLoading = false;
                    if (res.data.status == 200) {
                        this.$message({
                            message: '更新成功',
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
            }
        },
        mounted() {
            this.getList();
        }
    };

</script>

<style scoped>
    .time {
        font-size: 13px;
        color: #999;
    }

    .bottom {
        margin-top: 13px;
        line-height: 12px;
    }

    .button {
        padding: 0;
        float: right;
    }

    .image {
        width: 100%;
        display: block;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }
</style>