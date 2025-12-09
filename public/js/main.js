// --- UI Logic ---
function showSection(sectionId) {
    // Hide all main sections
    const sections = ['login-section', 'register-section', 'dashboard-section', 'profile-section', 'onboarding-section', 'admin-section'];
    sections.forEach(id => document.getElementById(id).classList.add('hidden'));

    // Show target
    document.getElementById(sectionId).classList.remove('hidden');
}

function reloadApp() {
    if(userId) {
        showSection('dashboard-section');
    } else {
        showSection('login-section');
    }
}

function updateAuthUI(isLoggedIn, role = 'user') {
    const publicLinks = document.querySelectorAll('.public-link');
    const privateLinks = document.querySelectorAll('.private-link');
    const adminLinks = document.querySelectorAll('.admin-link');

    if (isLoggedIn) {
        publicLinks.forEach(el => el.classList.add('hidden'));
        privateLinks.forEach(el => el.classList.remove('hidden'));

        if (role === 'admin') {
            adminLinks.forEach(el => el.classList.remove('hidden'));
        } else {
            adminLinks.forEach(el => el.classList.add('hidden'));
        }
    } else {
        publicLinks.forEach(el => el.classList.remove('hidden'));
        privateLinks.forEach(el => el.classList.add('hidden'));
        adminLinks.forEach(el => el.classList.add('hidden'));
    }
}

// --- App Logic ---
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const profileForm = document.getElementById('profileForm');
const changePasswordForm = document.getElementById('changePasswordForm');
const onboardingForm = document.getElementById('onboardingForm');

const messageDiv = document.getElementById('message');
const regMessageDiv = document.getElementById('reg-message');
const profileMessageDiv = document.getElementById('profileMessage');
const passwordMessageDiv = document.getElementById('passwordMessage');
const onboardingMessageDiv = document.getElementById('onboardingMessage');
const socketStatusDiv = document.getElementById('socketStatus');

const submitButton = document.getElementById('submitButton');
const crearTurnoDiv = document.getElementById('crearturno');
const crearTurnoBtn = document.getElementById('crearTurnoBtn');
const startDiv = document.getElementById('startExp');
const startExpBtn = document.getElementById('startExpBtn');
const tempDisplay = document.getElementById('tempDisplay');
const expDataDiv = document.getElementById('expData');

let shiftId;
let userId;
let currentSocketId = null;

// 1. Socket Connection
const socket = io(); // Connects to same origin

socket.on('connect', () => {
  currentSocketId = socket.id;
  socketStatusDiv.textContent = `🟢 Conectado al servidor`;
  socketStatusDiv.classList.remove('text-muted');
  socketStatusDiv.classList.add('text-success');
  submitButton.disabled = false;
});

socket.on('disconnect', () => {
  currentSocketId = null;
  socketStatusDiv.textContent = '🔴 Desconectado';
  socketStatusDiv.classList.remove('text-success');
  socketStatusDiv.classList.add('text-danger');
  submitButton.disabled = true;
});

socket.on('experiment:started', (data) => {
    alert(`Experimento iniciado: ${data.message}`);
    expDataDiv.style.display = 'block';
});

socket.on('turno:ofrecido', (data) => {
  alert('¡Es tu turno! Tienes 30 segundos para aceptar.');
  startDiv.style.display = 'block';
  shiftId = data.turnoId;
});

socket.on('exp:data', (temp) => {
  tempDisplay.textContent = `${temp} °C`;
});

// 2. Login Handler
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageDiv.textContent = '';

  if (!currentSocketId) {
    messageDiv.textContent = 'Error: Sin conexión al servidor.';
    return;
  }

  // Loading State
  const btn = event.submitter;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cargando...';

  const loginData = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
  };

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();

    if (response.ok) {
      if (result.userId) {
        userId = result.userId;
        await fetchProfileData(userId);

        updateAuthUI(true, result.role);
        showSection('dashboard-section');
        crearTurnoDiv.style.display = 'block';
        crearTurnoBtn.textContent = `Solicitar Turno`;
      }
    } else {
      messageDiv.textContent = result.message || 'Error en credenciales.';
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = 'Error de red.';
  } finally {
      btn.disabled = false;
      btn.textContent = originalText;
  }
});

// 3. Register Handler
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    regMessageDiv.textContent = '';

    // Loading State
    const btn = event.submitter;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registrando...';

    const regData = {
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value
    };

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(regData)
        });

        const result = await response.json();

        if (response.ok) {
            userId = result.userId;

            updateAuthUI(true, result.role);

            onboardingForm.reset();
            document.getElementById('onboardingUsernameDisplay').textContent = 'Usuario';
            document.getElementById('onboardingAvatarDisplay').src = 'https://via.placeholder.com/150';

            showSection('onboarding-section');
            registerForm.reset();

        } else {
            regMessageDiv.classList.add('text-danger');
            regMessageDiv.classList.remove('text-success');
            // Show Validation Errors if any
            if (result.errors) {
                 regMessageDiv.innerHTML = result.errors.map(e => e.msg).join('<br>');
            } else {
                 regMessageDiv.textContent = result.error || 'Error al registrarse.';
            }
        }
    } catch (error) {
        regMessageDiv.textContent = 'Error de conexión.';
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
});

// 3b. Onboarding Logic
const onboardUserIn = document.getElementById('onboardingUsername');
const onboardAvatarIn = document.getElementById('onboardingAvatar');

onboardUserIn.addEventListener('input', (e) => {
    document.getElementById('onboardingUsernameDisplay').textContent = e.target.value || 'Usuario';
});
onboardAvatarIn.addEventListener('input', (e) => {
    document.getElementById('onboardingAvatarDisplay').src = e.target.value || 'https://via.placeholder.com/150';
});

onboardingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    onboardingMessageDiv.textContent = '';

    const data = {
        username: onboardUserIn.value,
        avatar: onboardAvatarIn.value
    };

    try {
        const res = await fetch(`/auth/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if(res.ok) {
            await fetchProfileData(userId);
            showSection('dashboard-section');
            crearTurnoDiv.style.display = 'block';
            crearTurnoBtn.textContent = `Solicitar Turno`;
        } else {
            const result = await res.json();
            onboardingMessageDiv.textContent = result.message || 'Error al guardar perfil.';
        }
    } catch(e) {
        onboardingMessageDiv.textContent = 'Error de conexión.';
    }
});

function skipOnboarding() {
    showSection('dashboard-section');
    fetchProfileData(userId);
    crearTurnoDiv.style.display = 'block';
    crearTurnoBtn.textContent = `Solicitar Turno`;
}

// 4. Experiment Logic
startExpBtn.addEventListener('click', async () => {
  await fetch('/exp/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shiftId: shiftId })
  });
});

crearTurnoBtn.addEventListener('click', async () => {
  const shiftData = {
    socketid: currentSocketId,
    userId: userId
  };

  const response = await fetch('/shift/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shiftData)
  });

  if (response.ok) {
    alert('¡Has entrado a la cola! Te avisaremos cuando sea tu turno.');
    crearTurnoBtn.disabled = true;
    crearTurnoBtn.textContent = 'Esperando turno...';
  } else {
    const result = await response.json();
    alert(result.message);
  }
});

// 5. Logout Logic
async function logout(skipConfirm = false) {
    if(!skipConfirm && !confirm('¿Seguro que quieres cerrar sesión?')) return;

    try {
        await fetch('/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId })
        });

        userId = null;
        updateAuthUI(false);
        showSection('login-section');

        // Forms Reset
        loginForm.reset();
        registerForm.reset();
        onboardingForm.reset();
        profileForm.reset();

        // UI Elements Reset
        const defaultAvatar = 'https://via.placeholder.com/30';
        const defaultLargeAvatar = 'https://via.placeholder.com/150';
        const defaultUser = 'Usuario';

        document.getElementById('navUsername').textContent = defaultUser;
        document.getElementById('navAvatar').src = defaultAvatar;
        document.getElementById('dashUsername').textContent = defaultUser;

        document.getElementById('profileUsernameDisplay').textContent = defaultUser;
        document.getElementById('profileEmailDisplay').textContent = 'cargando...';
        document.getElementById('profileAvatarDisplay').src = defaultLargeAvatar;

        document.getElementById('onboardingUsernameDisplay').textContent = defaultUser;
        document.getElementById('onboardingAvatarDisplay').src = defaultLargeAvatar;

        crearTurnoBtn.disabled = false;
        startDiv.style.display = 'none';
        expDataDiv.style.display = 'none';

    } catch(e) {
        console.error(e);
    }
}

// 5b. Delete Account Logic
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    const deleteMsg = document.getElementById('deleteMessage');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    deleteMsg.textContent = 'Procesando...';
    confirmBtn.disabled = true;

    try {
        const res = await fetch('/auth/delete', {
            method: 'DELETE'
        });

        if (res.ok) {
            const modalEl = document.getElementById('deleteAccountModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            await logout(true);
            alert('Tu cuenta ha sido eliminada.');
        } else {
            const result = await res.json();
            deleteMsg.textContent = result.message || 'Error al eliminar cuenta.';
            deleteMsg.className = 'text-danger mb-3';
            confirmBtn.disabled = false;
        }
    } catch (e) {
        deleteMsg.textContent = 'Error de conexión.';
        deleteMsg.className = 'text-danger mb-3';
        confirmBtn.disabled = false;
    }
});

// 6. Profile Logic
async function loadProfile() {
    profileMessageDiv.textContent = '';
    document.getElementById('profileFieldset').disabled = true;
    document.getElementById('saveProfileBtn').disabled = true;
    showSection('profile-section');
}

document.getElementById('editProfileBtn').addEventListener('click', () => {
    const fieldset = document.getElementById('profileFieldset');
    const saveBtn = document.getElementById('saveProfileBtn');
    const isEnabled = !fieldset.disabled;

    if (isEnabled) {
        fieldset.disabled = true;
        saveBtn.disabled = true;
        fetchProfileData(userId);
    } else {
        fieldset.disabled = false;
        saveBtn.disabled = false;
    }
});

const profUserIn = document.getElementById('profileUsername');
const profAvatarIn = document.getElementById('profileAvatarUrl');

profUserIn.addEventListener('input', (e) => {
     document.getElementById('profileUsernameDisplay').textContent = e.target.value || 'Usuario';
});
profAvatarIn.addEventListener('input', (e) => {
     document.getElementById('profileAvatarDisplay').src = e.target.value || 'https://via.placeholder.com/150';
});

async function fetchProfileData(id) {
    try {
        const res = await fetch(`/auth/profile/${id}`);
        if(res.ok) {
            const user = await res.json();

            document.getElementById('navUsername').textContent = user.username || 'Usuario';
            document.getElementById('dashUsername').textContent = user.username || 'Usuario';
            document.getElementById('navAvatar').src = user.avatar || 'https://via.placeholder.com/30';

            document.getElementById('profileUsernameDisplay').textContent = user.username || 'Usuario';
            document.getElementById('profileEmailDisplay').textContent = user.email;
            document.getElementById('profileAvatarDisplay').src = user.avatar || 'https://via.placeholder.com/150';

            document.getElementById('profileUsername').value = user.username || '';
            document.getElementById('profileAvatarUrl').value = user.avatar || '';
        }
    } catch(e) {
        console.error("Error fetching profile", e);
    }
}

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    profileMessageDiv.textContent = 'Guardando...';
    profileMessageDiv.className = 'mt-3 text-center text-muted';

    const updateData = {
        username: document.getElementById('profileUsername').value,
        avatar: document.getElementById('profileAvatarUrl').value
    };

    try {
        const res = await fetch(`/auth/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if(res.ok) {
            profileMessageDiv.className = 'mt-3 text-center text-success';
            profileMessageDiv.textContent = '¡Perfil actualizado correctamente!';
            document.getElementById('profileFieldset').disabled = true;
            document.getElementById('saveProfileBtn').disabled = true;
            await fetchProfileData(userId);
        } else {
            const result = await res.json();
            profileMessageDiv.className = 'mt-3 text-center text-danger';
            profileMessageDiv.textContent = result.message || 'Error al actualizar perfil.';
        }
    } catch(e) {
         profileMessageDiv.className = 'mt-3 text-center text-danger';
         profileMessageDiv.textContent = 'Error de conexión.';
    }
});

// 7. Password Change Logic
changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    passwordMessageDiv.textContent = 'Procesando...';
    passwordMessageDiv.className = 'text-center mb-3 text-muted';

    const data = {
        userId: userId,
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value
    };

    try {
        const res = await fetch('/auth/change-password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            passwordMessageDiv.className = 'text-center mb-3 text-success';
            passwordMessageDiv.textContent = '¡Contraseña cambiada exitosamente!';
            changePasswordForm.reset();
            setTimeout(() => {
                const modalEl = document.getElementById('changePasswordModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                passwordMessageDiv.textContent = '';
            }, 1500);
        } else {
            passwordMessageDiv.className = 'text-center mb-3 text-danger';
            passwordMessageDiv.textContent = result.message || 'Error al cambiar contraseña';
        }
    } catch (e) {
        passwordMessageDiv.className = 'text-center mb-3 text-danger';
        passwordMessageDiv.textContent = 'Error de conexión';
    }
});

// Admin Logic
async function loadAdminPanel() {
    showSection('admin-section');
    const tbody = document.getElementById('adminUserTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';

    try {
        const res = await fetch('/auth/admin/users');
        if (res.ok) {
            const users = await res.json();
            tbody.innerHTML = '';
            users.forEach(user => {
                let badge = '';
                let resetBtnState = 'disabled';

                if (user.reset_requested) {
                    badge = '<span class="badge bg-danger ms-2">Solicitó Reset</span>';
                    resetBtnState = '';
                }

                const row = `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.username || '-'}</td>
                        <td>${user.email} ${badge}</td>
                        <td><span class="badge ${user.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}">${user.role}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-danger me-1" onclick="deleteUserByAdmin(${user.id})" title="Eliminar Usuario"><i class="bi bi-trash"></i></button>
                            <button class="btn btn-sm btn-outline-warning" onclick="openResetModal(${user.id})" ${resetBtnState} title="Restablecer Contraseña"><i class="bi bi-key"></i></button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error cargando usuarios</td></tr>';
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error de conexión</td></tr>';
    }
}

window.deleteUserByAdmin = async function(id) {
    if(!confirm(`¿Estás seguro de eliminar al usuario ID ${id}? Esta acción es irreversible.`)) return;

    try {
        const res = await fetch(`/auth/admin/users/${id}`, { method: 'DELETE' });
        if(res.ok) {
            alert('Usuario eliminado.');
            loadAdminPanel();
        } else {
            alert('Error al eliminar usuario.');
        }
    } catch(e) {
        alert('Error de conexión');
    }
}

window.openResetModal = function(id) {
    document.getElementById('resetUserId').value = id;
    document.getElementById('resetNewPassword').value = '';
    document.getElementById('resetMessage').textContent = '';
    const modal = new bootstrap.Modal(document.getElementById('adminResetModal'));
    modal.show();
}

document.getElementById('adminResetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('resetUserId').value;
    const newPass = document.getElementById('resetNewPassword').value;
    const msg = document.getElementById('resetMessage');

    try {
        const res = await fetch(`/auth/admin/users/${id}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: newPass })
        });

        const result = await res.json();

        if(res.ok) {
            msg.className = 'mt-3 text-center text-success';
            msg.textContent = 'Contraseña actualizada.';
            setTimeout(() => {
                const modalEl = document.getElementById('adminResetModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                loadAdminPanel();
            }, 1500);
        } else {
            msg.className = 'mt-3 text-center text-danger';
            msg.textContent = result.message || 'Error.';
        }
    } catch(e) {
        msg.className = 'mt-3 text-center text-danger';
        msg.textContent = 'Error de conexión';
    }
});

// Request Reset (Public)
window.requestReset = async function() {
    const email = prompt("Ingresa tu correo electrónico para solicitar el restablecimiento:");
    if (email) {
        try {
            const res = await fetch('/auth/request-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const result = await res.json();
            alert(result.message);
        } catch(e) {
            alert("Error de conexión");
        }
    }
}

// Mobile Menu Collapse
document.querySelectorAll('.nav-link').forEach(item => {
    item.addEventListener('click', () => {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const collapse = document.querySelector('.navbar-collapse');
        if (window.getComputedStyle(navbarToggler).display !== 'none' && collapse.classList.contains('show')) {
            navbarToggler.click();
        }
    });
});

// Initial State
submitButton.disabled = true;
updateAuthUI(false);

// Check Session on Load
window.addEventListener('load', async () => {
    try {
        const res = await fetch('/auth/me');
        if (res.ok) {
            const data = await res.json();
            if (data.authenticated && data.user) {
                userId = data.user.id;
                await fetchProfileData(userId);
                updateAuthUI(true, data.user.role);
                showSection('dashboard-section');
                crearTurnoDiv.style.display = 'block';
                crearTurnoBtn.textContent = `Solicitar Turno`;
            }
        }
    } catch (error) {
        console.log("No active session found.");
    }
});
