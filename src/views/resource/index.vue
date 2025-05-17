<template>
  <div class="resource-container">
    <el-row :gutter="20">
      <!-- 资源概览 -->
      <el-col :span="24">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>资源概览</span>
              <el-button type="primary" @click="handleRefresh">
                <el-icon><Refresh /></el-icon>刷新
              </el-button>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-title">CPU总核数</div>
                <div class="item-value">{{ overview.cpu.total }}</div>
                <div class="item-progress">
                  <el-progress
                    :percentage="overview.cpu.used"
                    :format="format"
                    :status="overview.cpu.used > 80 ? 'exception' : ''"
                  />
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-title">内存总量</div>
                <div class="item-value">{{ overview.memory.total }}GB</div>
                <div class="item-progress">
                  <el-progress
                    :percentage="overview.memory.used"
                    :format="format"
                    :status="overview.memory.used > 80 ? 'exception' : ''"
                  />
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-title">存储总量</div>
                <div class="item-value">{{ overview.storage.total }}TB</div>
                <div class="item-progress">
                  <el-progress
                    :percentage="overview.storage.used"
                    :format="format"
                    :status="overview.storage.used > 80 ? 'exception' : ''"
                  />
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-title">虚拟机数量</div>
                <div class="item-value">{{ overview.vm.total }}</div>
                <div class="item-progress">
                  <el-progress
                    :percentage="overview.vm.used"
                    :format="format"
                    :status="overview.vm.used > 80 ? 'exception' : ''"
                  />
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 资源分配 -->
      <el-col :span="24" class="mt-20">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>资源分配</span>
              <el-button type="primary" @click="handleCreateVM">
                <el-icon><Plus /></el-icon>创建虚拟机
              </el-button>
            </div>
          </template>

          <el-table :data="vmList" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="虚拟机名称" />
            <el-table-column prop="cpu" label="CPU">
              <template #default="{ row }">
                {{ row.cpu }}核
              </template>
            </el-table-column>
            <el-table-column prop="memory" label="内存">
              <template #default="{ row }">
                {{ row.memory }}GB
              </template>
            </el-table-column>
            <el-table-column prop="storage" label="存储">
              <template #default="{ row }">
                {{ row.storage }}GB
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'running' ? 'success' : 'danger'">
                  {{ row.status === 'running' ? '运行中' : '已停止' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column label="操作" width="300">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleConfig(row)">配置</el-button>
                <el-button type="success" size="small" @click="handleStart(row)" v-if="row.status !== 'running'">启动</el-button>
                <el-button type="warning" size="small" @click="handleStop(row)" v-if="row.status === 'running'">停止</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建虚拟机对话框 -->
    <el-dialog
      v-model="vmDialogVisible"
      title="创建虚拟机"
      width="600px"
    >
      <el-form
        ref="vmFormRef"
        :model="vmForm"
        :rules="vmRules"
        label-width="100px"
      >
        <el-form-item label="虚拟机名称" prop="name">
          <el-input v-model="vmForm.name" placeholder="请输入虚拟机名称" />
        </el-form-item>
        <el-form-item label="CPU" prop="cpu">
          <el-input-number v-model="vmForm.cpu" :min="1" :max="16" />
        </el-form-item>
        <el-form-item label="内存" prop="memory">
          <el-input-number v-model="vmForm.memory" :min="1" :max="64" />
        </el-form-item>
        <el-form-item label="存储" prop="storage">
          <el-input-number v-model="vmForm.storage" :min="10" :max="1000" />
        </el-form-item>
        <el-form-item label="操作系统" prop="os">
          <el-select v-model="vmForm.os" placeholder="请选择操作系统">
            <el-option label="CentOS 7" value="centos7" />
            <el-option label="Ubuntu 20.04" value="ubuntu20" />
            <el-option label="Windows Server 2019" value="win2019" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="vmDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleVMSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

// 资源概览数据
const overview = reactive({
  cpu: {
    total: 64,
    used: 45
  },
  memory: {
    total: 256,
    used: 60
  },
  storage: {
    total: 50,
    used: 35
  },
  vm: {
    total: 20,
    used: 75
  }
})

// 虚拟机列表
const loading = ref(false)
const vmList = ref([
  {
    id: 1,
    name: 'VM-001',
    cpu: 4,
    memory: 8,
    storage: 100,
    status: 'running',
    createTime: '2024-01-01 12:00:00'
  },
  {
    id: 2,
    name: 'VM-002',
    cpu: 8,
    memory: 16,
    storage: 200,
    status: 'stopped',
    createTime: '2024-01-02 12:00:00'
  }
])

// 创建虚拟机对话框
const vmDialogVisible = ref(false)
const vmFormRef = ref<FormInstance>()
const vmForm = reactive({
  name: '',
  cpu: 2,
  memory: 4,
  storage: 50,
  os: ''
})

// 表单验证规则
const vmRules = {
  name: [
    { required: true, message: '请输入虚拟机名称', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  os: [
    { required: true, message: '请选择操作系统', trigger: 'change' }
  ]
}

// 格式化进度条文本
const format = (percentage: number) => {
  return percentage + '%'
}

// 刷新数据
const handleRefresh = () => {
  loading.value = true
  // 模拟刷新请求
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 1000)
}

// 创建虚拟机
const handleCreateVM = () => {
  vmDialogVisible.value = true
  vmForm.name = ''
  vmForm.cpu = 2
  vmForm.memory = 4
  vmForm.storage = 50
  vmForm.os = ''
}

// 配置虚拟机
const handleConfig = (row: any) => {
  vmDialogVisible.value = true
  Object.assign(vmForm, row)
}

// 启动虚拟机
const handleStart = (row: any) => {
  ElMessageBox.confirm(
    `确认启动虚拟机"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`虚拟机"${row.name}"启动中`)
  })
}

// 停止虚拟机
const handleStop = (row: any) => {
  ElMessageBox.confirm(
    `确认停止虚拟机"${row.name}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`虚拟机"${row.name}"已停止`)
  })
}

// 删除虚拟机
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确认删除虚拟机"${row.name}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`虚拟机"${row.name}"已删除`)
  })
}

// 提交虚拟机表单
const handleVMSubmit = async () => {
  if (!vmFormRef.value) return
  
  await vmFormRef.value.validate((valid) => {
    if (valid) {
      vmDialogVisible.value = false
      ElMessage.success('创建成功')
    }
  })
}
</script>

<style scoped>
.resource-container {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview-item {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.item-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.item-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.item-progress {
  margin-top: 10px;
}
</style> 