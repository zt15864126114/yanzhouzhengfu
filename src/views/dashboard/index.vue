<template>
    <div class="dashboard-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>设备总数</span>
              </div>
            </template>
            <div class="card-body">
              <h2>128</h2>
              <div class="trend">
                <span class="up">↑ 12%</span>
                <span class="text">较上月</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>在线设备</span>
              </div>
            </template>
            <div class="card-body">
              <h2>98</h2>
              <div class="trend">
                <span class="up">↑ 8%</span>
                <span class="text">较上月</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>告警数量</span>
              </div>
            </template>
            <div class="card-body">
              <h2>5</h2>
              <div class="trend">
                <span class="down">↓ 3%</span>
                <span class="text">较上月</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>资源使用率</span>
              </div>
            </template>
            <div class="card-body">
              <h2>68%</h2>
              <div class="trend">
                <span class="up">↑ 5%</span>
                <span class="text">较上月</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
  
      <el-row :gutter="20" class="mt-20">
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>设备状态分布</span>
              </div>
            </template>
            <div class="chart-container" ref="deviceChartRef"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>资源使用趋势</span>
              </div>
            </template>
            <div class="chart-container" ref="resourceChartRef"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts';
  
  // 图表DOM引用
  const deviceChartRef = ref<HTMLElement | null>(null);
  const resourceChartRef = ref<HTMLElement | null>(null);
  
  // 初始化设备状态分布饼图
  const initDeviceChart = () => {
    if (!deviceChartRef.value) return;
    
    const deviceChart = echarts.init(deviceChartRef.value);
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: ['在线设备', '离线设备', '维护中', '告警设备']
      },
      color: ['#67C23A', '#909399', '#E6A23C', '#F56C6C'],
      series: [
        {
          name: '设备状态',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 98, name: '在线设备' },
            { value: 20, name: '离线设备' },
            { value: 5, name: '维护中' },
            { value: 5, name: '告警设备' }
          ]
        }
      ]
    };
    
    deviceChart.setOption(option);
    
    // 监听窗口变化，重绘图表
    window.addEventListener('resize', () => {
      deviceChart.resize();
    });
  };
  
  // 初始化资源使用趋势图
  const initResourceChart = () => {
    if (!resourceChartRef.value) return;
    
    const resourceChart = echarts.init(resourceChartRef.value);
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['CPU使用率', '内存使用率', '存储使用率', '网络带宽']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%'
        },
        max: 100
      },
      series: [
        {
          name: 'CPU使用率',
          type: 'line',
          data: [45, 52, 38, 65, 42, 35, 50],
          smooth: true,
          lineStyle: {
            width: 3
          },
          areaStyle: {
            opacity: 0.1
          }
        },
        {
          name: '内存使用率',
          type: 'line',
          data: [62, 68, 70, 75, 65, 60, 72],
          smooth: true,
          lineStyle: {
            width: 3
          },
          areaStyle: {
            opacity: 0.1
          }
        },
        {
          name: '存储使用率',
          type: 'line',
          data: [55, 56, 58, 60, 62, 64, 68],
          smooth: true,
          lineStyle: {
            width: 3
          },
          areaStyle: {
            opacity: 0.1
          }
        },
        {
          name: '网络带宽',
          type: 'line',
          data: [30, 42, 35, 45, 25, 38, 32],
          smooth: true,
          lineStyle: {
            width: 3
          },
          areaStyle: {
            opacity: 0.1
          }
        }
      ]
    };
    
    resourceChart.setOption(option);
    
    // 监听窗口变化，重绘图表
    window.addEventListener('resize', () => {
      resourceChart.resize();
    });
  };
  
  // 组件挂载后初始化图表
  onMounted(() => {
    initDeviceChart();
    initResourceChart();
  });
  </script>
  
  <style scoped>
  .dashboard-container {
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
  
  .card-body {
    text-align: center;
  }
  
  .card-body h2 {
    font-size: 28px;
    margin: 10px 0;
  }
  
  .trend {
    font-size: 14px;
    color: #666;
  }
  
  .trend .up {
    color: #67C23A;
  }
  
  .trend .down {
    color: #F56C6C;
  }
  
  .trend .text {
    margin-left: 5px;
  }
  
  .chart-container {
    height: 300px;
  }
  </style>
  