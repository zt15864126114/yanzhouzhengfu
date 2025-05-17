<template>
  <div class="device-container">
    <el-tabs v-model="activeTab">
      <!-- 网络设备 -->
      <el-tab-pane label="网络设备" name="network">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>网络设备列表</span>
              <el-button type="primary" @click="handleAddNetwork">
                <el-icon><Plus /></el-icon>添加设备
              </el-button>
            </div>
          </template>

          <el-table :data="networkList" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="设备名称" />
            <el-table-column prop="ip" label="IP地址" />
            <el-table-column prop="type" label="设备类型" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
                  {{ row.status === 'online' ? '在线' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastCheck" label="最后检查时间" />
            <el-table-column label="操作" width="250">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleConfig(row)">配置</el-button>
                <el-button type="success" size="small" @click="handleMonitor(row)">监控</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 服务器设备 -->
      <el-tab-pane label="服务器设备" name="server">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>服务器设备列表</span>
              <el-button type="primary" @click="handleAddServer">
                <el-icon><Plus /></el-icon>添加服务器
              </el-button>
            </div>
          </template>

          <el-table :data="serverList" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="服务器名称" />
            <el-table-column prop="ip" label="IP地址" />
            <el-table-column prop="cpu" label="CPU使用率">
              <template #default="{ row }">
                <el-progress :percentage="row.cpu" :status="row.cpu > 80 ? 'exception' : ''" />
              </template>
            </el-table-column>
            <el-table-column prop="memory" label="内存使用率">
              <template #default="{ row }">
                <el-progress :percentage="row.memory" :status="row.memory > 80 ? 'exception' : ''" />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'running' ? 'success' : 'danger'">
                  {{ row.status === 'running' ? '运行中' : '已停止' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="300">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleConfig(row)">配置</el-button>
                <el-button type="success" size="small" @click="handleMonitor(row)">监控</el-button>
                <el-button type="warning" size="small" @click="handleRestart(row)">重启</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 存储设备 -->
      <el-tab-pane label="存储设备" name="storage">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>存储设备列表</span>
              <el-button type="primary" @click="handleAddStorage">
                <el-icon><Plus /></el-icon>添加存储
              </el-button>
            </div>
          </template>

          <el-table :data="storageList" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="存储名称" />
            <el-table-column prop="type" label="存储类型" />
            <el-table-column prop="capacity" label="总容量" />
            <el-table-column prop="used" label="已用容量">
              <template #default="{ row }">
                <el-progress :percentage="row.used" :status="row.used > 80 ? 'exception' : ''" />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'normal' ? 'success' : 'danger'">
                  {{ row.status === 'normal' ? '正常' : '异常' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleConfig(row)">配置</el-button>
                <el-button type="success" size="small" @click="handleMonitor(row)">监控</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 设备配置对话框 -->
    <el-dialog
      v-model="configDialogVisible"
      title="设备配置"
      width="600px"
    >
      <el-form
        ref="configFormRef"
        :model="configForm"
        label-width="100px"
      >
        <el-form-item label="设备名称">
          <el-input v-model="configForm.name" />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="configForm.ip" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="configForm.type" placeholder="请选择设备类型">
            <el-option label="交换机" value="switch" />
            <el-option label="路由器" value="router" />
            <el-option label="防火墙" value="firewall" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="configForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="configDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfigSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 设备监控对话框 -->
    <el-dialog
      v-model="monitorDialogVisible"
      title="设备监控"
      width="800px"
    >
      <div class="monitor-container">
        <div class="monitor-header">
          <h3>{{ monitorDevice.name }}</h3>
          <el-tag :type="monitorDevice.status === 'online' ? 'success' : 'danger'">
            {{ monitorDevice.status === 'online' ? '在线' : '离线' }}
          </el-tag>
        </div>
        <div class="monitor-charts">
          <div ref="cpuChartRef" class="chart"></div>
          <div ref="memoryChartRef" class="chart"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 标签页
const activeTab = ref('network')

// 加载状态
const loading = ref(false)

// 网络设备列表
const networkList = ref([
  {
    id: 1,
    name: '核心交换机-01',
    ip: '192.168.1.1',
    type: 'switch',
    status: 'online',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 2,
    name: '核心交换机-02',
    ip: '192.168.1.2',
    type: 'switch',
    status: 'online',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 3,
    name: '边界路由器-01',
    ip: '192.168.1.3',
    type: 'router',
    status: 'online',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 4,
    name: '防火墙-01',
    ip: '192.168.1.4',
    type: 'firewall',
    status: 'online',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 5,
    name: '负载均衡器-01',
    ip: '192.168.1.5',
    type: 'loadbalancer',
    status: 'maintenance',
    lastCheck: '2024-03-15 14:30:00'
  }
])

// 服务器设备列表
const serverList = ref([
  {
    id: 1,
    name: '应用服务器-01',
    ip: '192.168.1.10',
    cpu: 45,
    memory: 60,
    status: 'running',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 2,
    name: '应用服务器-02',
    ip: '192.168.1.11',
    cpu: 52,
    memory: 68,
    status: 'running',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 3,
    name: '数据库服务器-01',
    ip: '192.168.1.12',
    cpu: 75,
    memory: 85,
    status: 'running',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 4,
    name: '数据库服务器-02',
    ip: '192.168.1.13',
    cpu: 68,
    memory: 78,
    status: 'running',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 5,
    name: '缓存服务器-01',
    ip: '192.168.1.14',
    cpu: 35,
    memory: 45,
    status: 'running',
    lastCheck: '2024-03-15 14:30:00'
  }
])

// 存储设备列表
const storageList = ref([
  {
    id: 1,
    name: '主存储-01',
    type: 'SAN',
    capacity: '50TB',
    used: 65,
    status: 'normal',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 2,
    name: '主存储-02',
    type: 'SAN',
    capacity: '50TB',
    used: 58,
    status: 'normal',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 3,
    name: '备份存储-01',
    type: 'NAS',
    capacity: '30TB',
    used: 45,
    status: 'normal',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 4,
    name: '备份存储-02',
    type: 'NAS',
    capacity: '30TB',
    used: 42,
    status: 'normal',
    lastCheck: '2024-03-15 14:30:00'
  },
  {
    id: 5,
    name: '归档存储-01',
    type: 'NAS',
    capacity: '100TB',
    used: 35,
    status: 'normal',
    lastCheck: '2024-03-15 14:30:00'
  }
])

// 配置对话框
const configDialogVisible = ref(false)
const configFormRef = ref()
const configForm = reactive({
  name: '',
  ip: '',
  type: '',
  description: ''
})

// 监控对话框
const monitorDialogVisible = ref(false)
const monitorDevice = ref<any>({})
const cpuChartRef = ref()
const memoryChartRef = ref()

// 新增：当前编辑的设备类型和编辑项
const editType = ref<'network' | 'server' | 'storage'>('network')
const editRowId = ref<number|null>(null)

// 添加网络设备
const handleAddNetwork = () => {
  configDialogVisible.value = true
  configForm.name = ''
  configForm.ip = ''
  configForm.type = 'switch'
  configForm.description = ''
  editType.value = 'network'
  editRowId.value = null
}

// 添加服务器
const handleAddServer = () => {
  configDialogVisible.value = true
  configForm.name = ''
  configForm.ip = ''
  configForm.type = 'server'
  configForm.description = ''
  editType.value = 'server'
  editRowId.value = null
}

// 添加存储设备
const handleAddStorage = () => {
  configDialogVisible.value = true
  configForm.name = ''
  configForm.ip = ''
  configForm.type = 'storage'
  configForm.description = ''
  editType.value = 'storage'
  editRowId.value = null
}

// 配置设备（编辑）
const handleConfig = (row: any) => {
  configDialogVisible.value = true
  Object.assign(configForm, row)
  // 判断类型
  if (serverList.value.some(d => d.id === row.id)) editType.value = 'server'
  else if (storageList.value.some(d => d.id === row.id)) editType.value = 'storage'
  else editType.value = 'network'
  editRowId.value = row.id
}

// 监控设备
const handleMonitor = (row: any) => {
  monitorDialogVisible.value = true
  monitorDevice.value = row
  // 初始化图表
  setTimeout(() => {
    initCharts()
  }, 100)
}

// 重启设备
const handleRestart = (row: any) => {
  ElMessageBox.confirm(
    `确认重启设备"${row.name}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`设备"${row.name}"重启命令已发送`)
  })
}

// 删除设备
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确认删除设备"${row.name}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    if (networkList.value.some(d => d.id === row.id)) {
      const idx = networkList.value.findIndex(d => d.id === row.id)
      if (idx !== -1) networkList.value.splice(idx, 1)
    } else if (serverList.value.some(d => d.id === row.id)) {
      const idx = serverList.value.findIndex(d => d.id === row.id)
      if (idx !== -1) serverList.value.splice(idx, 1)
    } else if (storageList.value.some(d => d.id === row.id)) {
      const idx = storageList.value.findIndex(d => d.id === row.id)
      if (idx !== -1) storageList.value.splice(idx, 1)
    }
    ElMessage.success(`设备"${row.name}"已删除`)
  })
}

// 提交配置（新增或编辑）
const handleConfigSubmit = () => {
  if (editRowId.value) {
    // 编辑
    let list = editType.value === 'network' ? networkList.value : editType.value === 'server' ? serverList.value : storageList.value
    const idx = list.findIndex(d => d.id === editRowId.value)
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...configForm }
    }
    ElMessage.success('配置已保存')
  } else {
    // 新增
    const newId = Date.now()
    if (editType.value === 'network') {
      networkList.value.unshift({
        id: newId,
        name: configForm.name,
        ip: configForm.ip,
        type: configForm.type,
        status: 'online',
        lastCheck: new Date().toLocaleString()
      })
    } else if (editType.value === 'server') {
      serverList.value.unshift({
        id: newId,
        name: configForm.name,
        ip: configForm.ip,
        cpu: 0,
        memory: 0,
        status: 'running',
        lastCheck: new Date().toLocaleString()
      })
    } else if (editType.value === 'storage') {
      storageList.value.unshift({
        id: newId,
        name: configForm.name,
        type: configForm.type,
        capacity: '10TB',
        used: 0,
        status: 'normal',
        lastCheck: new Date().toLocaleString()
      })
    }
    ElMessage.success('添加成功')
  }
  configDialogVisible.value = false
}

// 初始化图表
const initCharts = () => {
  // CPU使用率图表
  const cpuChart = echarts.init(cpuChartRef.value)
  cpuChart.setOption({
    title: {
      text: 'CPU使用率'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
    },
    yAxis: {
      type: 'value',
      max: 100
    },
    series: [{
      data: [30, 40, 35, 50, 45, 60, 55, 45],
      type: 'line',
      smooth: true
    }]
  })

  // 内存使用率图表
  const memoryChart = echarts.init(memoryChartRef.value)
  memoryChart.setOption({
    title: {
      text: '内存使用率'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
    },
    yAxis: {
      type: 'value',
      max: 100
    },
    series: [{
      data: [50, 55, 60, 65, 70, 65, 60, 55],
      type: 'line',
      smooth: true
    }]
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    cpuChart.resize()
    memoryChart.resize()
  })
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.device-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor-container {
  padding: 20px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.monitor-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart {
  height: 300px;
}
</style> 