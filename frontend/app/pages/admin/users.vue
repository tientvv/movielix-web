<template>
  <div class="admin-users container" id="admin-users-page">
    <div class="admin-users__header">
      <h1>Manage Users</h1>
      <div class="admin-users__actions">
        <NuxtLink to="/admin" class="btn btn-outline" id="btn-back-dashboard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Movies
        </NuxtLink>
        <button class="btn btn-primary" @click="showCreateForm = !showCreateForm" id="btn-create-user">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create User
        </button>
        <button class="btn btn-ghost" @click="logout" id="btn-logout">Logout</button>
      </div>
    </div>

    <!-- Create User Form -->
    <Transition name="slide-down">
      <div v-if="showCreateForm" class="admin-users__create-card card">
        <h3>Create New Account</h3>
        <form @submit.prevent="createUser" class="admin-users__create-form">
          <div class="admin-users__form-row">
            <div class="admin-users__field">
              <label for="new-username">Username</label>
              <input
                v-model="newUser.username"
                type="text"
                id="new-username"
                class="input"
                placeholder="Enter username"
                required
              />
            </div>
            <div class="admin-users__field">
              <label for="new-password">Password</label>
              <input
                v-model="newUser.password"
                type="text"
                id="new-password"
                class="input"
                placeholder="Enter password"
                required
              />
            </div>
            <div class="admin-users__field">
              <label for="new-role">Role</label>
              <select v-model="newUser.role" id="new-role" class="input">
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary admin-users__form-submit" :disabled="isCreating">
              {{ isCreating ? 'Creating...' : 'Create' }}
            </button>
          </div>
          <p v-if="createError" class="admin-users__error">{{ createError }}</p>
          <p v-if="createSuccess" class="admin-users__success">{{ createSuccess }}</p>
        </form>
      </div>
    </Transition>

    <!-- Stats -->
    <div class="admin-users__stats">
      <div class="admin-stat card">
        <p class="admin-stat__number">{{ users.length }}</p>
        <p class="admin-stat__label">Total Users</p>
      </div>
      <div class="admin-stat card">
        <p class="admin-stat__number">{{ adminCount }}</p>
        <p class="admin-stat__label">Admins</p>
      </div>
      <div class="admin-stat card">
        <p class="admin-stat__number">{{ userCount }}</p>
        <p class="admin-stat__label">Viewers</p>
      </div>
    </div>

    <!-- User List -->
    <div class="admin-users__list">
      <h2>All Accounts</h2>
      <div class="admin-table-wrap">
        <table class="admin-table" id="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="text-muted">{{ user.id }}</td>
              <td><strong>{{ user.username }}</strong></td>
              <td>
                <span class="badge" :class="user.role === 'ADMIN' ? 'badge-accent' : 'badge-dark'">
                  {{ user.role }}
                </span>
              </td>
              <td class="text-muted">{{ formatDate(user.createdAt) }}</td>
              <td>
                <button
                  class="btn btn-sm btn-ghost admin-table__delete"
                  @click="deleteUser(user)"
                  :disabled="user.role === 'ADMIN' && adminCount <= 1"
                  :title="user.role === 'ADMIN' && adminCount <= 1 ? 'Cannot delete the last admin' : 'Delete user'"
                >
                  🗑
                </button>
              </td>
            </tr>
            <tr v-if="!users.length">
              <td colspan="5" class="text-muted" style="text-align: center; padding: var(--space-8)">
                No users yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: 'Manage Users — MovieLix Admin' });

const { authHeaders, requireAuth, logout } = useAdminAuth();

interface UserRecord {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

const users = ref<UserRecord[]>([]);
const showCreateForm = ref(false);
const isCreating = ref(false);
const createError = ref('');
const createSuccess = ref('');

const newUser = reactive({
  username: '',
  password: '',
  role: 'USER',
});

const adminCount = computed(() => users.value.filter((u) => u.role === 'ADMIN').length);
const userCount = computed(() => users.value.filter((u) => u.role === 'USER').length);

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

async function fetchUsers() {
  try {
    users.value = await $fetch<UserRecord[]>('/api/admin/users', {
      headers: authHeaders(),
    });
  } catch {
    console.error('Failed to fetch users');
  }
}

async function createUser() {
  createError.value = '';
  createSuccess.value = '';
  isCreating.value = true;

  try {
    const created = await $fetch<UserRecord>('/api/admin/users', {
      method: 'POST',
      headers: authHeaders(),
      body: {
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
      },
    });

    createSuccess.value = `Account "${created.username}" created successfully!`;
    newUser.username = '';
    newUser.password = '';
    newUser.role = 'USER';

    await fetchUsers();
  } catch (err: any) {
    createError.value = err?.data?.statusMessage || 'Failed to create user.';
  } finally {
    isCreating.value = false;
  }
}

async function deleteUser(user: UserRecord) {
  if (user.role === 'ADMIN' && adminCount.value <= 1) {
    alert('Cannot delete the last admin account!');
    return;
  }

  if (!confirm(`Are you sure you want to delete "${user.username}"?`)) return;

  try {
    await $fetch('/api/admin/users', {
      method: 'DELETE',
      headers: authHeaders(),
      body: { id: user.id },
    });

    await fetchUsers();
  } catch {
    alert('Failed to delete user.');
  }
}

onMounted(() => {
  if (!requireAuth()) return;
  fetchUsers();
});
</script>

<style scoped>
.admin-users {
  padding-top: var(--space-10);
  padding-bottom: var(--space-10);
}

.admin-users__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
  gap: var(--space-4);
}

.admin-users__header h1 {
  font-size: var(--text-3xl);
}

.admin-users__actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
}

.admin-users__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.admin-stat {
  padding: var(--space-6);
  text-align: center;
}

.admin-stat__number {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-accent);
}

.admin-stat__label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.admin-users__create-card {
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.admin-users__create-card h3 {
  margin-bottom: var(--space-4);
  font-size: var(--text-lg);
}

.admin-users__form-row {
  display: flex;
  gap: var(--space-4);
  align-items: flex-end;
  flex-wrap: wrap;
}

.admin-users__field {
  flex: 1;
  min-width: 160px;
}

.admin-users__field label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.admin-users__form-submit {
  height: 42px;
  white-space: nowrap;
}

.admin-users__error {
  color: var(--color-error);
  font-size: var(--text-sm);
  margin-top: var(--space-3);
}

.admin-users__success {
  color: var(--color-accent);
  font-size: var(--text-sm);
  margin-top: var(--space-3);
}

.admin-users__list {
  margin-top: var(--space-4);
}

.admin-users__list h2 {
  margin-bottom: var(--space-4);
  font-size: var(--text-xl);
}

/* Slide-down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 300px;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .admin-users__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-users__form-row {
    flex-direction: column;
  }

  .admin-users__field {
    width: 100%;
  }
}
</style>
