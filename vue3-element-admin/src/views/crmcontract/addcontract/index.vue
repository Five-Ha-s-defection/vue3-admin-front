<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="110px"
    class="add-contract-form"
    size="small"
  >
    <div class="form-main">
      <!-- 左侧：合同基本信息 -->
      <div class="form-left">
        <div class="form-title">添加合同</div>
        <el-form-item label="所属客户" prop="customerId">
          <el-tag v-if="form.customerName" type="success">{{ form.customerName }}</el-tag>
          <el-tag v-else type="info">未选择客户</el-tag>
          <el-button
            type="primary"
            size="small"
            style="margin-left: 8px"
            @click="openCustomerDialog"
          >
            选择客户
          </el-button>
        </el-form-item>
        <el-form-item label="选择商机" prop="opportunityId">
          <el-select v-model="form.opportunityId" placeholder="请选择商机" style="width: 100%">
            <el-option
              v-for="item in opportunityList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择负责人" style="width: 100%">
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合同金额" prop="amount">
          <el-input v-model="form.amount" type="number" placeholder="请输入合同金额" />
        </el-form-item>
        <el-form-item label="签订日期" prop="signDate">
          <el-date-picker
            v-model="form.signDate"
            type="date"
            placeholder="选择签订日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="合同名称" prop="contractName">
          <el-input v-model="form.contractName" placeholder="请输入合同名称" />
        </el-form-item>
        <el-form-item label="截止日期" prop="expirationDate">
          <el-date-picker
            v-model="form.expirationDate"
            type="date"
            placeholder="选择截止日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="经销商" prop="dealer">
          <el-input v-model="form.dealer" placeholder="请输入经销商" />
        </el-form-item>
        <el-form-item label="合同条款" prop="contractTerms">
          <!-- 富文本编辑器可用第三方组件 -->
          <el-input
            v-model="form.contractTerms"
            type="textarea"
            :rows="4"
            placeholder="请输入合同条款"
          />
        </el-form-item>
        <el-form-item label="审核人" prop="auditorId">
          <el-select v-model="form.auditorId" placeholder="请选择审核人" style="width: 100%">
            <el-option
              v-for="item in auditorList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合同扫描件">
          <el-upload
            class="upload-demo"
            action="#"
            :file-list="form.scanFile"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :limit="1"
            list-type="picture-card"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="上传附件">
          <el-upload
            class="upload-demo"
            action="#"
            :file-list="form.attachments"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            multiple
            list-type="text"
          >
            <el-button size="small" type="primary">上传附件</el-button>
          </el-upload>
        </el-form-item>
      </div>
      <!-- 右侧：产品和应收款 -->
      <div class="form-right">
        <div class="form-title">添加产品</div>
        <el-button type="primary" size="small" style="margin-bottom: 8px" @click="addProduct">
          添加产品
        </el-button>
        <el-table :data="form.products" style="width: 100%; margin-bottom: 16px">
          <el-table-column prop="name" label="产品名称" />
          <el-table-column prop="category" label="产品分类" />
          <el-table-column prop="price" label="价格" />
          <el-table-column prop="salePrice" label="售价" />
          <el-table-column prop="quantity" label="数量" />
          <el-table-column prop="total" label="合计" />
        </el-table>
        <div style="text-align: right; margin-bottom: 16px">
          合计：
          <span style="color: #409eff">{{ totalAmount }}</span>
        </div>
        <div class="form-title">添加应收款</div>
        <el-form-item label="应收款编号" prop="receivableNo">
          <el-input v-model="form.receivableNo" />
        </el-form-item>
        <el-form-item label="应收款金额" prop="receivableAmount">
          <el-input v-model="form.receivableAmount" type="number" placeholder="请输入应收款金额" />
        </el-form-item>
        <el-form-item label="应收款时间" prop="receivableDate">
          <el-date-picker
            v-model="form.receivableDate"
            type="date"
            placeholder="选择应收款时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.addReceivableRule">增加应收款规则</el-checkbox>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </div>
    </div>
    <div class="form-footer">
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
// 其它需要的组件和API

const formRef = ref();
const form = reactive({
  customerId: "",
  opportunityId: "",
  userId: "",
  amount: null,
  signDate: "",
  contractName: "",
  expirationDate: "",
  dealer: "",
  contractTerms: "",
  auditorId: "",
  scanFile: [],
  attachments: [],
  products: [],
  receivables: [],
  // 其它字段
});

const rules = {
  customerId: [{ required: true, message: "请选择客户", trigger: "change" }],
  userId: [{ required: true, message: "请选择负责人", trigger: "change" }],
  // 其它校验规则
};

const handleSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    // 调用API提交
    // await ContractAPI.addContract(form)
    ElMessage.success("提交成功");
  });
};
</script>

<style scoped>
.add-contract-form {
  padding: 20px;
  background: #f5f8fd;
}
.form-main {
  display: flex;
  gap: 24px;
}
.form-left,
.form-right {
  flex: 1;
  background: #fff;
  padding: 24px 20px 10px 20px;
  border-radius: 6px;
  min-width: 380px;
}
.form-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 18px;
  color: #409eff;
  border-bottom: 2px solid #f5f5f5;
  padding-bottom: 6px;
}
.form-footer {
  text-align: right;
  margin-top: 24px;
  background: #fff;
  padding: 16px 20px;
  border-radius: 0 0 6px 6px;
}
</style>
