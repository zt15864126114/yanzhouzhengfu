<template>
  <div class="user-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-right">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>添加用户
            </el-button>
            <el-button type="success" @click="handleRegister">
              <el-icon><User /></el-icon>用户注册
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="getRoleTag(row.role)">{{ getRoleName(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '已激活' : '未激活' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button class="action-btn" size="small" type="primary" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button class="action-btn" size="small" type="success" @click="handleRole(row)">
                <el-icon><Setting /></el-icon>分配角色
              </el-button>
              <el-button class="action-btn" size="small" type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="普通用户" value="user" />
            <el-option label="操作员" value="operator" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户注册对话框 -->
    <el-dialog
      v-model="registerDialogVisible"
      title="用户注册"
      width="500px"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="verify-code">
            <el-input v-model="registerForm.code" placeholder="请输入验证码" />
            <el-button type="primary" @click="handleSendCode">获取验证码</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="registerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRegisterSubmit">注册</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="500px"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <span>{{ roleForm.username }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="roleForm.roles">
            <el-checkbox label="user">普通用户</el-checkbox>
            <el-checkbox label="operator">操作员</el-checkbox>
            <el-checkbox label="admin">管理员</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
            ref="permissionTreeRef"
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :default-checked-keys="roleForm.permissions"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRoleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, User, Edit, Setting, Delete } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

// 用户列表
const loading = ref(false)
const userList = ref([
  {
    id: 1,
    username: 'admin',
    role: 'admin',
    phone: '13800138000',
    email: 'admin@example.com',
    status: 'active',
    createTime: '2024-01-01 12:00:00'
  },
  {
    id: 2,
    username: 'operator',
    role: 'operator',
    phone: '13800138001',
    email: 'operator@example.com',
    status: 'active',
    createTime: '2024-01-02 12:00:00'
  },
  {
    id: 3,
    username: 'system',
    role: 'admin',
    phone: '13800138002',
    email: 'system@example.com',
    status: 'active',
    createTime: '2024-01-03 12:00:00'
  },
  {
    id: 4,
    username: 'monitor',
    role: 'operator',
    phone: '13800138003',
    email: 'monitor@example.com',
    status: 'active',
    createTime: '2024-01-04 12:00:00'
  },
  {
    id: 5,
    username: 'security',
    role: 'admin',
    phone: '13800138004',
    email: 'security@example.com',
    status: 'active',
    createTime: '2024-01-05 12:00:00'
  },
  {
    id: 6,
    username: 'backup',
    role: 'operator',
    phone: '13800138005',
    email: 'backup@example.com',
    status: 'inactive',
    createTime: '2024-01-06 12:00:00'
  },
  {
    id: 7,
    username: 'test',
    role: 'user',
    phone: '13800138006',
    email: 'test@example.com',
    status: 'active',
    createTime: '2024-01-07 12:00:00'
  },
  {
    id: 8,
    username: 'guest',
    role: 'user',
    phone: '13800138007',
    email: 'guest@example.com',
    status: 'inactive',
    createTime: '2024-01-08 12:00:00'
  }
])

// 添加/编辑用户对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  password: '',
  phone: '',
  email: '',
  role: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 注册对话框
const registerDialogVisible = ref(false)
const registerFormRef = ref<FormInstance>()
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  code: ''
})

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
}

// 角色对话框
const roleDialogVisible = ref(false)
const roleFormRef = ref<FormInstance>()
const roleForm = reactive({
  username: '',
  roles: [] as string[],
  permissions: [] as string[]
})

// 权限树数据
const permissionTree = [
  {
    id: '1',
    label: '系统管理',
    children: [
      { id: '1-1', label: '用户管理' },
      { id: '1-2', label: '角色管理' },
      { id: '1-3', label: '权限管理' }
    ]
  },
  {
    id: '2',
    label: '设备管理',
    children: [
      { id: '2-1', label: '设备列表' },
      { id: '2-2', label: '设备监控' },
      { id: '2-3', label: '设备配置' }
    ]
  },
  {
    id: '3',
    label: '资源管理',
    children: [
      { id: '3-1', label: '资源分配' },
      { id: '3-2', label: '资源监控' },
      { id: '3-3', label: '资源统计' }
    ]
  }
]

// 获取角色标签样式
const getRoleTag = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: 'danger',
    operator: 'warning',
    user: 'info'
  }
  return roleMap[role] || 'info'
}

// 获取角色名称
const getRoleName = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    operator: '操作员',
    user: '普通用户'
  }
  return roleMap[role] || role
}

// 添加用户
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  form.username = ''
  form.password = ''
  form.phone = ''
  form.email = ''
  form.role = ''
}

// 编辑用户
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 删除用户
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    '确认删除该用户吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      dialogVisible.value = false
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
    }
  })
}

// 打开注册对话框
const handleRegister = () => {
  registerDialogVisible.value = true
  registerForm.username = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerForm.phone = ''
  registerForm.email = ''
  registerForm.code = ''
}

// 发送验证码
const handleSendCode = () => {
  if (!registerForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  ElMessage.success('验证码已发送')
}

// 提交注册
const handleRegisterSubmit = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate((valid) => {
    if (valid) {
      registerDialogVisible.value = false
      ElMessage.success('注册成功，请查收激活邮件')
    }
  })
}

// 分配角色
const handleRole = (row: any) => {
  roleDialogVisible.value = true
  roleForm.username = row.username
  roleForm.roles = [row.role]
  roleForm.permissions = []
}

// 提交角色分配
const handleRoleSubmit = () => {
  roleDialogVisible.value = false
  ElMessage.success('角色分配成功')
}
</script>

<style scoped>
.user-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 10px;
}

.verify-code {
  display: flex;
  gap: 10px;
}

.verify-code .el-input {
  flex: 1;
}

.action-buttons {
  display: flex;
  flex-wrap: nowrap;
  gap: 5px;
}

.action-btn {
  padding: 6px 10px !important;
  display: flex !important;
  align-items: center !important;
}

.action-btn .el-icon {
  margin-right: 3px !important;
}
</style> 