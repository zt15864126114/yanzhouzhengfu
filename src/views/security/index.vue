<template>
  <div class="security-container">
    <!-- 顶部统计卡片 -->
    <div class="security-stats">
      <el-card class="stat-card danger" shadow="hover">
        <div class="stat-title">高危事件</div>
        <div class="stat-value">{{ stat.high }}</div>
      </el-card>
      <el-card class="stat-card warning" shadow="hover">
        <div class="stat-title">中危事件</div>
        <div class="stat-value">{{ stat.mid }}</div>
      </el-card>
      <el-card class="stat-card info" shadow="hover">
        <div class="stat-title">低危事件</div>
        <div class="stat-value">{{ stat.low }}</div>
      </el-card>
      <el-card class="stat-card success" shadow="hover">
        <div class="stat-title">已处理</div>
        <div class="stat-value">{{ stat.done }}</div>
      </el-card>
      <el-card class="stat-card processing" shadow="hover">
        <div class="stat-title">处理中</div>
        <div class="stat-value">{{ stat.processing }}</div>
      </el-card>
      <el-card class="stat-card wait" shadow="hover">
        <div class="stat-title">待处理</div>
        <div class="stat-value">{{ stat.wait }}</div>
      </el-card>
    </div>
    <!-- 趋势图 -->
    <el-card class="trend-card" shadow="hover">
      <div class="trend-title">近7天安全事件趋势</div>
      <div ref="trendChartRef" class="trend-chart"></div>
    </el-card>
    <!-- 分组列表 -->
    <div class="group-list">
      <div v-for="group in groupedList" :key="group.level" class="event-group">
        <div class="group-title" :class="group.level">
          <el-icon v-if="group.level==='高危'" color="#F56C6C"><WarningFilled /></el-icon>
          <el-icon v-else-if="group.level==='中危'" color="#E6A23C"><Warning /></el-icon>
          <el-icon v-else color="#409EFF"><InfoFilled /></el-icon>
          {{ group.level }}事件（{{ group.list.length }}）
          <span v-if="group.level==='高危'" class="group-alert">请优先处置高危事件！</span>
        </div>
        <el-table :data="group.list" border style="width: 100%" :row-class-name="row => 'event-row-' + group.level">
          <el-table-column prop="eventName" label="事件名称" min-width="140" />
          <el-table-column prop="handler" label="处理人" min-width="100" />
          <el-table-column prop="status" label="处理状态" min-width="100">
            <template #default="{ row }: { row: any }">
              <el-tag :type="row.status === '已处理' ? 'success' : row.status === '处理中' ? 'warning' : 'info'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="流程" min-width="180">
            <template #default="{ row }">
              <el-steps :active="row.progress" finish-status="success" simple>
                <el-step title="发现" />
                <el-step title="分派" />
                <el-step title="处置" />
                <el-step title="完成" />
              </el-steps>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="发现时间" min-width="160" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="info" link @click="handleDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="事件详情" width="600px" :before-close="() => detailVisible = false">
      <div v-if="currentDetail">
        <p><b>事件名称：</b>{{ currentDetail.eventName }}</p>
        <p><b>风险等级：</b>{{ currentDetail.level }}</p>
        <p><b>处理人：</b>{{ currentDetail.handler }}</p>
        <p><b>处理状态：</b>{{ currentDetail.status }}</p>
        <p><b>发现时间：</b>{{ currentDetail.createTime }}</p>
        <p><b>流程：</b></p>
        <el-steps :active="currentDetail.progress" finish-status="success">
          <el-step title="发现" />
          <el-step title="分派" />
          <el-step title="处置" />
          <el-step title="完成" />
        </el-steps>
        <p style="margin-top: 16px;"><b>处置记录：</b></p>
        <el-timeline>
          <el-timeline-item v-for="(log, idx) in currentDetail.logs" :key="idx" :timestamp="log.time" :type="log.type">
            {{ log.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { WarningFilled, Warning, InfoFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

interface SecurityLog {
  time: string;
  content: string;
  type?: string;
}
interface SecurityItem {
  id: number;
  eventName: string;
  handler: string;
  level: string;
  status: string;
  progress: number;
  createTime: string;
  logs: SecurityLog[];
}

const originalSecurityList = ref<SecurityItem[]>([
  { id: 1, eventName: 'SQL注入攻击', handler: '李明', level: '高危', status: '已处理', progress: 4, createTime: '2024-04-01 09:00', logs: [ { time: '2024-04-01 08:30', content: '事件发现', type: 'info' }, { time: '2024-04-01 08:40', content: '已分派', type: 'warning' }, { time: '2024-04-01 08:50', content: '处置中', type: 'warning' }, { time: '2024-04-01 09:00', content: '处置完成', type: 'success' } ] },
  { id: 2, eventName: '异常登录', handler: '王芳', level: '中危', status: '处理中', progress: 3, createTime: '2024-04-01 08:30', logs: [ { time: '2024-04-01 08:30', content: '事件发现', type: 'info' }, { time: '2024-04-01 08:40', content: '已分派', type: 'warning' }, { time: '2024-04-01 08:50', content: '处置中', type: 'warning' } ] },
  { id: 3, eventName: '文件上传漏洞', handler: '赵强', level: '高危', status: '待处理', progress: 1, createTime: '2024-03-31 17:00', logs: [ { time: '2024-03-31 17:00', content: '事件发现', type: 'info' } ] },
  { id: 4, eventName: '弱密码告警', handler: '孙丽', level: '低危', status: '已处理', progress: 4, createTime: '2024-03-31 16:00', logs: [ { time: '2024-03-31 16:00', content: '事件发现', type: 'info' }, { time: '2024-03-31 16:10', content: '已分派', type: 'warning' }, { time: '2024-03-31 16:20', content: '处置中', type: 'warning' }, { time: '2024-03-31 16:30', content: '处置完成', type: 'success' } ] },
  { id: 5, eventName: 'XSS攻击', handler: '周伟', level: '中危', status: '处理中', progress: 2, createTime: '2024-03-30 14:00', logs: [ { time: '2024-03-30 14:00', content: '事件发现', type: 'info' }, { time: '2024-03-30 14:20', content: '已分派', type: 'warning' } ] },
  { id: 6, eventName: '未授权访问', handler: '马俊', level: '高危', status: '已处理', progress: 4, createTime: '2024-03-29 11:00', logs: [ { time: '2024-03-29 11:00', content: '事件发现', type: 'info' }, { time: '2024-03-29 11:10', content: '已分派', type: 'warning' }, { time: '2024-03-29 11:20', content: '处置中', type: 'warning' }, { time: '2024-03-29 11:30', content: '处置完成', type: 'success' } ] },
  { id: 7, eventName: '敏感信息泄露', handler: '许静', level: '中危', status: '待处理', progress: 1, createTime: '2024-03-28 09:00', logs: [ { time: '2024-03-28 09:00', content: '事件发现', type: 'info' } ] },
  { id: 8, eventName: '暴力破解', handler: '宋倩', level: '高危', status: '处理中', progress: 3, createTime: '2024-03-27 13:00', logs: [ { time: '2024-03-27 13:00', content: '事件发现', type: 'info' }, { time: '2024-03-27 13:10', content: '已分派', type: 'warning' }, { time: '2024-03-27 13:20', content: '处置中', type: 'warning' } ] },
  { id: 9, eventName: '配置错误', handler: '魏东', level: '低危', status: '已处理', progress: 4, createTime: '2024-03-26 10:00', logs: [ { time: '2024-03-26 10:00', content: '事件发现', type: 'info' }, { time: '2024-03-26 10:10', content: '已分派', type: 'warning' }, { time: '2024-03-26 10:20', content: '处置中', type: 'warning' }, { time: '2024-03-26 10:30', content: '处置完成', type: 'success' } ] },
  { id: 10, eventName: '权限提升', handler: '冯媛', level: '高危', status: '待处理', progress: 1, createTime: '2024-03-25 15:00', logs: [ { time: '2024-03-25 15:00', content: '事件发现', type: 'info' } ] }
])
const securityList = ref<SecurityItem[]>([])

const stat = reactive({ high: 0, mid: 0, low: 0, done: 0, processing: 0, wait: 0 })

const trendChartRef = ref<HTMLDivElement | null>(null)
const trendData = ref({
  days: ['3-26', '3-27', '3-28', '3-29', '3-30', '3-31', '4-1'],
  high: [2, 2, 2, 2, 2, 2, 2],
  mid: [3, 3, 2, 2, 2, 2, 2],
  low: [2, 2, 2, 2, 2, 2, 2]
})

const groupedList = computed(() => {
  const levels = ['高危', '中危', '低危']
  return levels.map(level => ({
    level,
    list: securityList.value.filter(e => e.level === level).sort((a, b) => {
      // 状态排序：待处理 > 处理中 > 已处理
      const order: Record<string, number> = { '待处理': 1, '处理中': 2, '已处理': 3 }
      return order[a.status] - order[b.status]
    })
  }))
})

const detailVisible = ref(false)
const currentDetail = ref<SecurityItem | null>(null)

function updateStat() {
  stat.high = originalSecurityList.value.filter(d => d.level === '高危').length
  stat.mid = originalSecurityList.value.filter(d => d.level === '中危').length
  stat.low = originalSecurityList.value.filter(d => d.level === '低危').length
  stat.done = originalSecurityList.value.filter(d => d.status === '已处理').length
  stat.processing = originalSecurityList.value.filter(d => d.status === '处理中').length
  stat.wait = originalSecurityList.value.filter(d => d.status === '待处理').length
}

function renderTrendChart() {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['高危', '中危', '低危'] },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: trendData.value.days },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      { name: '高危', type: 'line', data: trendData.value.high, smooth: true, lineStyle: { color: '#F56C6C' } },
      { name: '中危', type: 'line', data: trendData.value.mid, smooth: true, lineStyle: { color: '#E6A23C' } },
      { name: '低危', type: 'line', data: trendData.value.low, smooth: true, lineStyle: { color: '#409EFF' } }
    ]
  })
}

function handleDetail(row: SecurityItem) {
  currentDetail.value = row
  detailVisible.value = true
}

onMounted(() => {
  securityList.value = [...originalSecurityList.value]
  updateStat()
  nextTick(() => {
    renderTrendChart()
  })
})
</script>

<style scoped>
.security-container {
  padding: 20px;
}
.security-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  flex: 1;
  text-align: center;
  padding: 16px 0;
}
.stat-title {
  font-size: 15px;
  color: #888;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
}
.stat-card.danger .stat-value { color: #F56C6C; }
.stat-card.warning .stat-value { color: #E6A23C; }
.stat-card.info .stat-value { color: #409EFF; }
.stat-card.success .stat-value { color: #67C23A; }
.stat-card.processing .stat-value { color: #E6A23C; }
.stat-card.wait .stat-value { color: #909399; }
.trend-card {
  margin-bottom: 20px;
}
.trend-title {
  font-size: 15px;
  color: #888;
  margin-bottom: 8px;
}
.trend-chart {
  width: 100%;
  height: 260px;
}
.group-list {
  margin-top: 20px;
}
.event-group {
  margin-bottom: 32px;
}
.group-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.group-title.高危 { color: #F56C6C; }
.group-title.中危 { color: #E6A23C; }
.group-title.低危 { color: #409EFF; }
.group-alert {
  margin-left: 16px;
  color: #F56C6C;
  font-size: 14px;
  font-weight: bold;
}
:deep(.event-row-高危) { background: #fff1f0 !important; }
:deep(.event-row-中危) { background: #fffbe6 !important; }
:deep(.event-row-低危) { background: #e6f7ff !important; }
</style> 