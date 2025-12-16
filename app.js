// ========================================
// GESTIÓN DE DATOS Y ALMACENAMIENTO
// ========================================

class SistemaPrestamos {
    constructor() {
        this.clientes = this.cargarDatos('clientes') || [];
        this.pagos = this.cargarDatos('pagos') || [];
        this.sesionActiva = false;
        this.usuarioActual = null;
        this.verificarSesion();
    }

    cargarDatos(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    guardarDatos(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                throw new Error('The quota has been exceeded.');
            }
            throw e;
        }
    }

    verificarEspacioDisponible() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        const totalMB = (total / 1024 / 1024).toFixed(2);
        return totalMB;
    }

    // ========================================
    // SISTEMA DE AUTENTICACIÓN
    // ========================================

    verificarSesion() {
        const sesion = this.cargarDatos('sesion');
        const credenciales = this.cargarDatos('credenciales');

        // Si no hay credenciales, crear usuario por defecto
        if (!credenciales) {
            this.guardarDatos('credenciales', {
                usuario: 'admin',
                password: this.hashPassword('admin123')
            });
        }

        // Verificar si hay sesión activa
        if (sesion && sesion.timestamp) {
            const ahora = new Date().getTime();
            const tiempoTranscurrido = ahora - sesion.timestamp;
            // Sesión válida por 24 horas
            if (tiempoTranscurrido < 24 * 60 * 60 * 1000) {
                this.sesionActiva = true;
                this.usuarioActual = sesion.usuario;
                this.mostrarApp();
                return;
            }
        }

        // Mostrar pantalla de login
        this.mostrarLogin();
    }

    mostrarLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('appContainer').classList.add('hidden');
        
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.intentarLogin();
        });
    }

    mostrarApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        document.getElementById('userInfo').textContent = `👤 ${this.usuarioActual}`;
        
        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
            this.inicializar();
        }, 100);
    }

    intentarLogin() {
        const usuario = document.getElementById('loginUsuario').value;
        const password = document.getElementById('loginPassword').value;
        const credenciales = this.cargarDatos('credenciales');

        if (usuario === credenciales.usuario && this.hashPassword(password) === credenciales.password) {
            // Login exitoso
            this.sesionActiva = true;
            this.usuarioActual = usuario;
            this.guardarDatos('sesion', {
                usuario: usuario,
                timestamp: new Date().getTime()
            });
            this.mostrarApp();
            document.getElementById('loginForm').reset();
        } else {
            // Login fallido
            const errorDiv = document.getElementById('loginError');
            errorDiv.textContent = '❌ Usuario o contraseña incorrectos';
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 3000);
        }
    }

    cerrarSesion() {
        if (confirm('¿Está seguro que desea cerrar sesión?')) {
            localStorage.removeItem('sesion');
            this.sesionActiva = false;
            this.usuarioActual = null;
            location.reload();
        }
    }

    hashPassword(password) {
        // Simple hash (en producción usar algo más robusto)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    inicializar() {
        this.configurarEventos();
        this.actualizarVistas();
        this.establecerFechaActual();
    }

    establecerFechaActual() {
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fechaInicio').value = hoy;
        document.getElementById('fechaPago').value = hoy;
    }

    configurarEventos() {
        // Verificar que los elementos existen antes de agregar eventos
        const calculadoraForm = document.getElementById('calculadoraForm');
        const clienteForm = document.getElementById('clienteForm');
        const buscarCliente = document.getElementById('buscarCliente');
        const pagoForm = document.getElementById('pagoForm');
        const tipoPago = document.getElementById('tipoPago');
        const clientePago = document.getElementById('clientePago');
        const filtroClientePago = document.getElementById('filtroClientePago');
        const filtroFechaReporte = document.getElementById('filtroFechaReporte');
        const cambiarPasswordForm = document.getElementById('cambiarPasswordForm');

        // Calculadora
        if (calculadoraForm) {
            calculadoraForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calcularPrestamo();
            });
        }

        // Clientes
        if (clienteForm) {
            clienteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registrarCliente();
            });
        }

        if (buscarCliente) {
            buscarCliente.addEventListener('input', (e) => {
                this.buscarClientes(e.target.value);
            });
        }

        // Pagos
        if (pagoForm) {
            pagoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registrarPago();
            });
        }

        if (tipoPago) {
            tipoPago.addEventListener('change', (e) => {
                this.ajustarMontoPago(e.target.value);
            });
        }

        if (clientePago) {
            clientePago.addEventListener('change', (e) => {
                const clienteId = parseInt(e.target.value);
                const cliente = this.clientes.find(c => c.id === clienteId);
                const tipoPagoEl = document.getElementById('tipoPago');
                
                // Auto-seleccionar la frecuencia del cliente
                if (cliente && cliente.frecuenciaPago && tipoPagoEl) {
                    tipoPagoEl.value = cliente.frecuenciaPago;
                    this.ajustarMontoPago(cliente.frecuenciaPago);
                } else if (tipoPagoEl && tipoPagoEl.value) {
                    this.ajustarMontoPago(tipoPagoEl.value);
                }
            });
        }

        if (filtroClientePago) {
            filtroClientePago.addEventListener('change', (e) => {
                this.filtrarPagos(e.target.value);
            });
        }

        // Reportes
        if (filtroFechaReporte) {
            filtroFechaReporte.addEventListener('change', (e) => {
                this.generarReportes();
            });
        }

        // Configuración
        if (cambiarPasswordForm) {
            cambiarPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.cambiarCredenciales();
            });
        }
    }

    cambiarCredenciales() {
        const usuarioActual = document.getElementById('usuarioActual').value;
        const passwordActual = document.getElementById('passwordActual').value;
        const nuevoUsuario = document.getElementById('nuevoUsuario').value;
        const nuevoPassword = document.getElementById('nuevoPassword').value;
        const confirmarPassword = document.getElementById('confirmarPassword').value;

        const credenciales = this.cargarDatos('credenciales');

        // Verificar credenciales actuales
        if (usuarioActual !== credenciales.usuario || this.hashPassword(passwordActual) !== credenciales.password) {
            this.mostrarNotificacion('Usuario o contraseña actual incorrectos', 'error');
            return;
        }

        // Verificar que las nuevas contraseñas coincidan
        if (nuevoPassword !== confirmarPassword) {
            this.mostrarNotificacion('Las contraseñas nuevas no coinciden', 'error');
            return;
        }

        // Verificar longitud mínima
        if (nuevoPassword.length < 4) {
            this.mostrarNotificacion('La contraseña debe tener al menos 4 caracteres', 'error');
            return;
        }

        // Guardar nuevas credenciales
        this.guardarDatos('credenciales', {
            usuario: nuevoUsuario,
            password: this.hashPassword(nuevoPassword)
        });

        this.usuarioActual = nuevoUsuario;
        this.guardarDatos('sesion', {
            usuario: nuevoUsuario,
            timestamp: new Date().getTime()
        });

        document.getElementById('cambiarPasswordForm').reset();
        document.getElementById('userInfo').textContent = `👤 ${nuevoUsuario}`;
        this.mostrarNotificacion('Credenciales actualizadas correctamente', 'success');
    }

    borrarTodosDatos() {
        const confirmacion = prompt('⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE.\n\nSe eliminarán:\n- Todos los clientes\n- Todos los pagos\n- Todos los reportes\n\nEscriba "BORRAR TODO" para confirmar:');
        
        if (confirmacion === 'BORRAR TODO') {
            this.clientes = [];
            this.pagos = [];
            this.guardarDatos('clientes', []);
            this.guardarDatos('pagos', []);
            this.actualizarVistas();
            this.mostrarNotificacion('Todos los datos han sido eliminados', 'success');
        } else {
            this.mostrarNotificacion('Operación cancelada', 'error');
        }
    }

    // ========================================
    // BACKUP Y RESTAURACIÓN
    // ========================================

    crearBackup() {
        const backup = {
            version: '1.0',
            fecha: new Date().toISOString(),
            usuario: this.usuarioActual,
            datos: {
                clientes: this.clientes,
                pagos: this.pagos
            },
            estadisticas: {
                totalClientes: this.clientes.length,
                totalPagos: this.pagos.length,
                totalPrestado: this.clientes.reduce((sum, c) => sum + c.monto, 0),
                totalCobrado: this.clientes.reduce((sum, c) => sum + c.pagado, 0)
            }
        };

        const dataStr = JSON.stringify(backup, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `backup-prestamos-${fecha}.json`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacion(`Backup creado: ${nombreArchivo}`, 'success');
    }

    restaurarBackup(event) {
        const archivo = event.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        
        lector.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                
                // Validar estructura del backup
                if (!backup.datos || !backup.datos.clientes || !backup.datos.pagos) {
                    throw new Error('Archivo de backup inválido');
                }

                const confirmacion = confirm(
                    `⚠️ CONFIRMAR RESTAURACIÓN\n\n` +
                    `Archivo: ${archivo.name}\n` +
                    `Fecha del backup: ${new Date(backup.fecha).toLocaleString('es-MX')}\n` +
                    `Clientes en backup: ${backup.datos.clientes.length}\n` +
                    `Pagos en backup: ${backup.datos.pagos.length}\n\n` +
                    `Clientes actuales: ${this.clientes.length}\n` +
                    `Pagos actuales: ${this.pagos.length}\n\n` +
                    `¿Desea REEMPLAZAR los datos actuales con este backup?`
                );

                if (confirmacion) {
                    // Restaurar datos
                    this.clientes = backup.datos.clientes;
                    this.pagos = backup.datos.pagos;
                    
                    this.guardarDatos('clientes', this.clientes);
                    this.guardarDatos('pagos', this.pagos);
                    
                    this.actualizarVistas();
                    
                    this.mostrarNotificacion(
                        `✅ Backup restaurado correctamente\n` +
                        `${backup.datos.clientes.length} clientes y ${backup.datos.pagos.length} pagos cargados`,
                        'success'
                    );
                }
                
            } catch (error) {
                this.mostrarNotificacion(
                    `❌ Error al restaurar backup: ${error.message}`,
                    'error'
                );
            }
            
            // Limpiar el input para permitir cargar el mismo archivo nuevamente
            event.target.value = '';
        };
        
        lector.onerror = () => {
            this.mostrarNotificacion('Error al leer el archivo', 'error');
            event.target.value = '';
        };
        
        lector.readAsText(archivo);
    }

    // ========================================
    // CALCULADORA DE PRÉSTAMOS
    // ========================================

    calcularPrestamo() {
        const monto = parseFloat(document.getElementById('monto').value.replace(/,/g, ''));
        const tasaMensual = parseFloat(document.getElementById('tasa').value.replace(/,/g, '')) / 100;
        const plazo = parseInt(document.getElementById('plazo').value);

        // Cálculo de pago mensual usando fórmula de amortización
        let pagoMensual;
        if (tasaMensual === 0) {
            pagoMensual = monto / plazo;
        } else {
            pagoMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) / 
                         (Math.pow(1 + tasaMensual, plazo) - 1);
        }

        const totalPagar = pagoMensual * plazo;
        const interesTotal = totalPagar - monto;

        // Mostrar resultados
        document.getElementById('pagoMensual').textContent = this.formatearMoneda(pagoMensual);
        document.getElementById('totalPagar').textContent = this.formatearMoneda(totalPagar);
        document.getElementById('interesTotal').textContent = this.formatearMoneda(interesTotal);

        // Generar tabla de amortización
        this.generarTablaAmortizacion(monto, tasaMensual, plazo, pagoMensual);

        document.getElementById('resultadoCalculo').classList.remove('hidden');
    }

    generarTablaAmortizacion(monto, tasaMensual, plazo, pagoMensual) {
        const tbody = document.querySelector('#tablaAmortizacion tbody');
        tbody.innerHTML = '';

        let saldo = monto;

        for (let mes = 1; mes <= plazo; mes++) {
            const interesMes = saldo * tasaMensual;
            const capitalMes = pagoMensual - interesMes;
            saldo = saldo - capitalMes;

            // Ajustar último pago para evitar errores de redondeo
            if (mes === plazo) {
                saldo = 0;
            }

            const fila = tbody.insertRow();
            fila.innerHTML = `
                <td>${mes}</td>
                <td>${this.formatearMoneda(pagoMensual)}</td>
                <td>${this.formatearMoneda(capitalMes)}</td>
                <td>${this.formatearMoneda(interesMes)}</td>
                <td>${this.formatearMoneda(Math.max(0, saldo))}</td>
            `;
        }
    }

    // ========================================
    // GESTIÓN DE CLIENTES
    // ========================================

    registrarCliente() {
        try {
            console.log('Iniciando registro de cliente...');
            
            const nombre = document.getElementById('nombreCliente').value;
            const cedula = document.getElementById('cedulaCliente').value;
            const telefono = document.getElementById('telefonoCliente').value;
            const telefono2 = document.getElementById('telefono2Cliente').value;
            const direccion = document.getElementById('direccionCliente').value;
            const monto = parseFloat(document.getElementById('montoPrestamo').value.replace(/,/g, ''));
            const tasa = parseFloat(document.getElementById('tasaPrestamo').value.replace(/,/g, ''));
            const plazo = parseInt(document.getElementById('plazoPrestamo').value);
            const frecuenciaPago = document.getElementById('frecuenciaPago').value;
            const fechaInicio = document.getElementById('fechaInicio').value;
            const montoPagadoInicialInput = document.getElementById('montoPagadoInicial').value;
            const montoPagadoInicial = montoPagadoInicialInput ? parseFloat(montoPagadoInicialInput.replace(/,/g, '')) : 0;
            
            console.log('Datos capturados:', { nombre, cedula, telefono, monto, tasa, plazo });

        const tasaMensual = tasa / 100;
        let pagoMensual;
        
        if (tasaMensual === 0) {
            pagoMensual = monto / plazo;
        } else {
            pagoMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) / 
                         (Math.pow(1 + tasaMensual, plazo) - 1);
        }

        const totalPagar = pagoMensual * plazo;

        const cliente = {
            id: Date.now(),
            nombre,
            cedula,
            telefono,
            direccion,
            monto,
            tasa,
            plazo,
            pagoMensual,
            totalPagar,
            fechaInicio,
            pagado: montoPagadoInicial,
            estado: 'activo',
            fechaRegistro: new Date().toISOString()
        };

        this.clientes.push(cliente);
        this.guardarDatos('clientes', this.clientes);
        
        // Si hay un monto inicial pagado, crear un registro de pago histórico
        if (montoPagadoInicial > 0) {
            const pagoInicial = {
                id: Date.now() + 1,
                clienteId: cliente.id,
                clienteNombre: cliente.nombre,
                tipoPago: 'otro',
                monto: montoPagadoInicial,
                fecha: fechaInicio,
                notas: 'Pagos anteriores al registro en el sistema',
                fechaRegistro: new Date().toISOString()
            };
            this.pagos.push(pagoInicial);
            this.guardarDatos('pagos', this.pagos);
        }
        
            document.getElementById('clienteForm').reset();
            this.establecerFechaActual();
            this.actualizarVistas();

            this.mostrarNotificacion('Cliente registrado exitosamente', 'success');
            console.log('Cliente registrado exitosamente');
            
        } catch (error) {
            console.error('Error al registrar cliente:', error);
            
            if (error.message.includes('quota') || error.name === 'QuotaExceededError') {
                this.mostrarNotificacion(
                    '⚠️ Almacenamiento lleno. \n\n' +
                    'Opciones:\n' +
                    '1. Haz un backup en Configuración\n' +
                    '2. Elimina clientes antiguos\n' +
                    '3. Evita fotos muy grandes (máx 500KB recomendado)',
                    'error'
                );
            } else {
                this.mostrarNotificacion('Error al registrar cliente: ' + error.message, 'error');
            }
        }
    }

    buscarClientes(termino) {
        const clientesFiltrados = this.clientes.filter(cliente => 
            cliente.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            cliente.cedula.includes(termino) ||
            cliente.telefono.includes(termino) ||
            (cliente.telefono2 && cliente.telefono2.includes(termino))
        );
        this.renderizarClientes(clientesFiltrados);
    }

    renderizarClientes(clientes = this.clientes) {
        const contenedor = document.getElementById('listaClientes');
        
        if (clientes.length === 0) {
            contenedor.innerHTML = `
                <div class="empty-state">
                    <p>No hay clientes registrados</p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = clientes.map(cliente => {
            const porcentajePagado = (cliente.pagado / cliente.totalPagar) * 100;
            const saldoPendiente = cliente.totalPagar - cliente.pagado;
            
            let estadoClase = 'estado-activo';
            let estadoTexto = 'Activo';
            
            if (cliente.pagado >= cliente.totalPagar) {
                estadoClase = 'estado-completado';
                estadoTexto = 'Completado';
            }

            return `
                <div class="cliente-card">
                    <div class="cliente-header">
                        <div class="cliente-nombre">${cliente.nombre}</div>
                        <span class="estado-badge ${estadoClase}">${estadoTexto}</span>
                    </div>
                    
                    <div class="cliente-info">
                        <div class="info-item">
                            <span class="info-label">Cédula</span>
                            <span class="info-value">${cliente.cedula}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Teléfono 1</span>
                            <span class="info-value">${cliente.telefono}</span>
                        </div>
                        ${cliente.telefono2 ? `<div class="info-item">
                            <span class="info-label">Teléfono 2</span>
                            <span class="info-value">${cliente.telefono2}</span>
                        </div>` : ''}
                        <div class="info-item">
                            <span class="info-label">Monto Préstamo</span>
                            <span class="info-value">${this.formatearMoneda(cliente.monto)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tasa Mensual</span>
                            <span class="info-value">${cliente.tasa}%</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Plazo</span>
                            <span class="info-value">${cliente.plazo} meses</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Frecuencia</span>
                            <span class="info-value">${this.obtenerTextoFrecuencia(cliente.frecuenciaPago || 'mensual')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Cuota a Pagar</span>
                            <span class="info-value">${this.formatearMoneda(cliente.cuotaPago || cliente.pagoMensual)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Fecha Inicio</span>
                            <span class="info-value">${this.formatearFecha(cliente.fechaInicio)}</span>
                        </div>
                    </div>

                    <div class="progreso-pago">
                        <div class="progreso-bar">
                            <div class="progreso-fill" style="width: ${porcentajePagado}%"></div>
                        </div>
                        <div class="progreso-text">
                            <span>Pagado: ${this.formatearMoneda(cliente.pagado)}</span>
                            <span>Pendiente: ${this.formatearMoneda(saldoPendiente)}</span>
                        </div>
                    </div>

                    <div class="cliente-actions">
                        <button class="btn-secondary" onclick="sistema.verDetalleCliente(${cliente.id})">
                            Ver Detalle
                        </button>
                        <button class="btn-danger" onclick="sistema.eliminarCliente(${cliente.id})">
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    verDetalleCliente(clienteId) {
        const cliente = this.clientes.find(c => c.id === clienteId);
        if (!cliente) return;

        const pagosCliente = this.pagos.filter(p => p.clienteId === clienteId);
        
        let detalleHTML = `
            <div style="max-width: 600px; margin: 20px auto;">
                <h3>Detalle del Cliente</h3>
                <p><strong>Nombre:</strong> ${cliente.nombre}</p>
                <p><strong>Cédula:</strong> ${cliente.cedula}</p>
                <p><strong>Teléfono 1:</strong> ${cliente.telefono}</p>
                ${cliente.telefono2 ? `<p><strong>Teléfono 2:</strong> ${cliente.telefono2}</p>` : ''}
                ${cliente.direccion ? `<p><strong>Dirección:</strong> ${cliente.direccion}</p>` : ''}
                <p><strong>Monto del Préstamo:</strong> ${this.formatearMoneda(cliente.monto)}</p>
                <p><strong>Frecuencia de Pago:</strong> ${this.obtenerTextoFrecuencia(cliente.frecuenciaPago || 'mensual')}</p>
                <p><strong>Cuota a Pagar:</strong> ${this.formatearMoneda(cliente.cuotaPago || cliente.pagoMensual)}</p>
                <p><strong>Total a Pagar:</strong> ${this.formatearMoneda(cliente.totalPagar)}</p>
                <p><strong>Total Pagado:</strong> ${this.formatearMoneda(cliente.pagado)}</p>
                <p><strong>Saldo Pendiente:</strong> ${this.formatearMoneda(cliente.totalPagar - cliente.pagado)}</p>
                
                <h4 style="margin-top: 20px;">Historial de Pagos</h4>
        `;

        if (pagosCliente.length > 0) {
            detalleHTML += '<table style="width: 100%; margin-top: 10px;">';
            detalleHTML += '<thead><tr><th>Fecha</th><th>Monto</th></tr></thead><tbody>';
            pagosCliente.forEach(pago => {
                detalleHTML += `
                    <tr>
                        <td>${this.formatearFecha(pago.fecha)}</td>
                        <td>${this.formatearMoneda(pago.monto)}</td>
                    </tr>
                `;
            });
            detalleHTML += '</tbody></table>';
        } else {
            detalleHTML += '<p>No hay pagos registrados</p>';
        }

        detalleHTML += '</div>';

        const ventana = window.open('', '_blank', 'width=700,height=600');
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Detalle - ${cliente.nombre}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #2563eb; color: white; }
                    button { padding: 10px 20px; margin-top: 20px; cursor: pointer; }
                </style>
            </head>
            <body>
                ${detalleHTML}
                <button onclick="window.print()">Imprimir</button>
                <button onclick="window.close()">Cerrar</button>
            </body>
            </html>
        `);
    }

    eliminarCliente(clienteId) {
        if (!confirm('¿Estás seguro de eliminar este cliente? También se eliminarán todos sus pagos.')) {
            return;
        }

        this.clientes = this.clientes.filter(c => c.id !== clienteId);
        this.pagos = this.pagos.filter(p => p.clienteId !== clienteId);
        
        this.guardarDatos('clientes', this.clientes);
        this.guardarDatos('pagos', this.pagos);
        
        this.actualizarVistas();
        this.mostrarNotificacion('Cliente eliminado', 'success');
    }

    // ========================================
    // GESTIÓN DE PAGOS
    // ========================================

    registrarPago() {
        const clienteId = parseInt(document.getElementById('clientePago').value);
        const tipoPago = document.getElementById('tipoPago').value;
        const monto = parseFloat(document.getElementById('montoPago').value.replace(/,/g, ''));
        const fecha = document.getElementById('fechaPago').value;
        const notas = document.getElementById('notasPago').value;

        const cliente = this.clientes.find(c => c.id === clienteId);
        if (!cliente) return;

        const pago = {
            id: Date.now(),
            clienteId,
            clienteNombre: cliente.nombre,
            tipoPago,
            monto,
            fecha,
            notas,
            fechaRegistro: new Date().toISOString()
        };

        this.pagos.push(pago);
        cliente.pagado += monto;

        this.guardarDatos('pagos', this.pagos);
        this.guardarDatos('clientes', this.clientes);

        document.getElementById('pagoForm').reset();
        this.establecerFechaActual();
        this.actualizarVistas();

        this.mostrarNotificacion('Pago registrado exitosamente', 'success');
    }

    filtrarPagos(clienteId) {
        let pagosFiltrados = this.pagos;
        
        if (clienteId) {
            pagosFiltrados = this.pagos.filter(p => p.clienteId === parseInt(clienteId));
        }

        this.renderizarPagos(pagosFiltrados);
    }

    renderizarPagos(pagos = this.pagos) {
        const contenedor = document.getElementById('historialPagos');
        
        if (pagos.length === 0) {
            contenedor.innerHTML = `
                <div class="empty-state">
                    <p>No hay pagos registrados</p>
                </div>
            `;
            return;
        }

        // Ordenar por fecha descendente
        const pagosOrdenados = [...pagos].sort((a, b) => 
            new Date(b.fecha) - new Date(a.fecha)
        );

        contenedor.innerHTML = pagosOrdenados.map(pago => {
            const tipoPagoTexto = {
                'semanal': '📅 Cuota Semanal',
                'quincenal': '📆 Cuota Quincenal',
                'mensual': '📋 Cuota Mensual',
                'otro': '💵 Otro Monto',
                'saldo-total': '✅ Saldo Total'
            }[pago.tipoPago] || '💵 Pago';

            return `
            <div class="pago-card">
                <div class="pago-header">
                    <div class="pago-cliente">${pago.clienteNombre}</div>
                    <div class="pago-monto">${this.formatearMoneda(pago.monto)}</div>
                </div>
                <div class="pago-info">
                    <span>${tipoPagoTexto}</span>
                    <span>📅 ${this.formatearFecha(pago.fecha)}</span>
                </div>
                ${pago.notas ? `<div class="pago-notas">${pago.notas}</div>` : ''}
            </div>
            `;
        }).join('');
    }

    ajustarMontoPago(tipoPago) {
        const clienteId = parseInt(document.getElementById('clientePago').value);
        if (!clienteId) return;

        const cliente = this.clientes.find(c => c.id === clienteId);
        if (!cliente) return;

        const montoInput = document.getElementById('montoPago');
        
        if (tipoPago === 'semanal') {
            const cuotaSemanal = cliente.pagoMensual / 4;
            montoInput.value = cuotaSemanal.toFixed(2);
        } else if (tipoPago === 'quincenal') {
            const cuotaQuincenal = cliente.pagoMensual / 2;
            montoInput.value = cuotaQuincenal.toFixed(2);
        } else if (tipoPago === 'mensual') {
            montoInput.value = cliente.pagoMensual.toFixed(2);
        } else if (tipoPago === 'saldo-total') {
            const saldoPendiente = cliente.totalPagar - cliente.pagado;
            montoInput.value = saldoPendiente.toFixed(2);
        } else if (tipoPago === 'otro') {
            montoInput.value = '';
        }
    }

    obtenerTextoFrecuencia(frecuencia) {
        const textos = {
            'semanal': '📅 Semanal',
            'quincenal': '📆 Quincenal',
            'mensual': '📋 Mensual'
        };
        return textos[frecuencia] || '📋 Mensual';
    }

    actualizarSelectoresClientes() {
        const selects = [
            document.getElementById('clientePago'),
            document.getElementById('filtroClientePago')
        ];

        selects.forEach((select, index) => {
            const valorActual = select.value;
            const esFiltroPagos = index === 1;
            
            select.innerHTML = esFiltroPagos ? 
                '<option value="">Todos los clientes</option>' : 
                '<option value="">-- Seleccione un cliente --</option>';
            
            this.clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = `${cliente.nombre} - Pendiente: ${this.formatearMoneda(cliente.totalPagar - cliente.pagado)}`;
                select.appendChild(option);
            });

            if (valorActual) {
                select.value = valorActual;
            }
        });
    }

    // ========================================
    // UTILIDADES
    // ========================================

    actualizarVistas() {
        this.renderizarClientes();
        this.renderizarPagos();
        this.actualizarSelectoresClientes();
        this.generarReportes();
        this.mostrarEspacioUsado();
    }

    mostrarEspacioUsado() {
        const espacioMB = this.verificarEspacioDisponible();
        const elemento = document.getElementById('espacioUsado');
        if (elemento) {
            let color = '#10b981'; // verde
            if (espacioMB > 7) color = '#ef4444'; // rojo
            else if (espacioMB > 4) color = '#f59e0b'; // amarillo
            
            elemento.innerHTML = `<strong style="color: ${color};">${espacioMB} MB</strong>`;
        }
    }

    // ========================================
    // REPORTES
    // ========================================

    generarReportes() {
        // Calcular estadísticas generales
        const totalPrestado = this.clientes.reduce((sum, c) => sum + c.monto, 0);
        const totalAPagar = this.clientes.reduce((sum, c) => sum + c.totalPagar, 0);
        const totalCobrado = this.clientes.reduce((sum, c) => sum + c.pagado, 0);
        const totalPendiente = totalAPagar - totalCobrado;
        
        const clientesActivos = this.clientes.filter(c => c.pagado < c.totalPagar).length;
        const clientesCompletados = this.clientes.filter(c => c.pagado >= c.totalPagar).length;

        // Actualizar estadísticas en el DOM
        document.getElementById('totalPrestado').textContent = this.formatearMoneda(totalPrestado);
        document.getElementById('totalCobrado').textContent = this.formatearMoneda(totalCobrado);
        document.getElementById('totalPendiente').textContent = this.formatearMoneda(totalPendiente);
        document.getElementById('totalClientes').textContent = this.clientes.length;
        document.getElementById('clientesActivos').textContent = `${clientesActivos} Activos`;
        document.getElementById('clientesCompletados').textContent = `${clientesCompletados} Completados`;

        // Generar gráfico de progreso
        this.generarGraficoProgreso(totalCobrado, totalPendiente);

        // Generar tabla de clientes
        this.generarTablaReporteClientes();

        // Generar movimientos recientes
        this.generarMovimientosRecientes();
    }

    generarGraficoProgreso(cobrado, pendiente) {
        const total = cobrado + pendiente;
        const porcentajeCobrado = total > 0 ? (cobrado / total) * 100 : 0;
        const porcentajePendiente = total > 0 ? (pendiente / total) * 100 : 0;

        const contenedor = document.getElementById('progressChart');
        contenedor.innerHTML = `
            <div class="progress-bar-large">
                <div class="progress-segment" style="width: ${porcentajeCobrado}%; background: #10b981;">
                    ${porcentajeCobrado > 5 ? `<span>${porcentajeCobrado.toFixed(1)}%</span>` : ''}
                </div>
                <div class="progress-segment" style="width: ${porcentajePendiente}%; background: #f59e0b;">
                    ${porcentajePendiente > 5 ? `<span>${porcentajePendiente.toFixed(1)}%</span>` : ''}
                </div>
            </div>
            <div class="progress-labels">
                <div>Cobrado: ${this.formatearMoneda(cobrado)}</div>
                <div>Pendiente: ${this.formatearMoneda(pendiente)}</div>
            </div>
        `;
    }

    generarTablaReporteClientes() {
        const tbody = document.querySelector('#tablaReporteClientes tbody');
        
        if (this.clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay clientes registrados</td></tr>';
            return;
        }

        tbody.innerHTML = this.clientes.map(cliente => {
            const pendiente = cliente.totalPagar - cliente.pagado;
            const porcentaje = (cliente.pagado / cliente.totalPagar) * 100;
            const estado = cliente.pagado >= cliente.totalPagar ? 'Completado' : 'Activo';
            const estadoClase = cliente.pagado >= cliente.totalPagar ? 'estado-completado' : 'estado-activo';

            return `
                <tr>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.cedula}</td>
                    <td>${this.formatearMoneda(cliente.monto)}</td>
                    <td>${this.formatearMoneda(cliente.pagado)}</td>
                    <td>${this.formatearMoneda(pendiente)}</td>
                    <td><span class="estado-badge ${estadoClase}">${estado}</span></td>
                    <td>
                        <div class="mini-progress">
                            <div class="mini-progress-fill" style="width: ${porcentaje}%"></div>
                        </div>
                        <span class="mini-progress-text">${porcentaje.toFixed(1)}%</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    generarMovimientosRecientes() {
        const filtro = document.getElementById('filtroFechaReporte').value;
        const ahora = new Date();
        
        let pagosFiltrados = this.pagos.filter(pago => {
            const fechaPago = new Date(pago.fecha);
            
            switch(filtro) {
                case 'hoy':
                    return fechaPago.toDateString() === ahora.toDateString();
                case 'semana':
                    const unaSemanaAtras = new Date(ahora);
                    unaSemanaAtras.setDate(ahora.getDate() - 7);
                    return fechaPago >= unaSemanaAtras;
                case 'mes':
                    const unMesAtras = new Date(ahora);
                    unMesAtras.setMonth(ahora.getMonth() - 1);
                    return fechaPago >= unMesAtras;
                case 'año':
                    const unAñoAtras = new Date(ahora);
                    unAñoAtras.setFullYear(ahora.getFullYear() - 1);
                    return fechaPago >= unAñoAtras;
                default:
                    return true;
            }
        });

        const contenedor = document.getElementById('movimientosRecientes');
        
        if (pagosFiltrados.length === 0) {
            contenedor.innerHTML = '<div class="empty-state">No hay movimientos en este período</div>';
            return;
        }

        const totalMovimientos = pagosFiltrados.reduce((sum, p) => sum + p.monto, 0);
        
        contenedor.innerHTML = `
            <div class="movimientos-summary">
                <strong>Total de movimientos en el período:</strong> ${this.formatearMoneda(totalMovimientos)}
                <strong style="margin-left: 20px;">Cantidad de pagos:</strong> ${pagosFiltrados.length}
            </div>
            ${this.renderizarMovimientos(pagosFiltrados)}
        `;
    }

    renderizarMovimientos(pagos) {
        const pagosOrdenados = [...pagos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        return pagosOrdenados.map(pago => {
            const tipoPagoTexto = {
                'semanal': '📅 Cuota Semanal',
                'quincenal': '📆 Cuota Quincenal',
                'mensual': '📋 Cuota Mensual',
                'otro': '💵 Otro Monto',
                'saldo-total': '✅ Saldo Total'
            }[pago.tipoPago] || '💵 Pago';

            return `
                <div class="movimiento-item">
                    <div class="movimiento-fecha">${this.formatearFecha(pago.fecha)}</div>
                    <div class="movimiento-cliente">${pago.clienteNombre}</div>
                    <div class="movimiento-tipo">${tipoPagoTexto}</div>
                    <div class="movimiento-monto">${this.formatearMoneda(pago.monto)}</div>
                </div>
            `;
        }).join('');
    }

    imprimirReporte() {
        const totalPrestado = this.clientes.reduce((sum, c) => sum + c.monto, 0);
        const totalCobrado = this.clientes.reduce((sum, c) => sum + c.pagado, 0);
        const totalPendiente = this.clientes.reduce((sum, c) => sum + (c.totalPagar - c.pagado), 0);
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte de Préstamos</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1, h2 { color: #2563eb; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #2563eb; color: white; }
                    .summary { background: #f0f9ff; padding: 15px; margin: 20px 0; border-radius: 8px; }
                    .summary-item { display: flex; justify-content: space-between; padding: 8px 0; }
                    @media print { button { display: none; } }
                </style>
            </head>
            <body>
                <h1>Reporte de Préstamos</h1>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                <div class="summary">
                    <h2>Resumen General</h2>
                    <div class="summary-item">
                        <span>Total Prestado:</span>
                        <strong>${this.formatearMoneda(totalPrestado)}</strong>
                    </div>
                    <div class="summary-item">
                        <span>Total Cobrado:</span>
                        <strong>${this.formatearMoneda(totalCobrado)}</strong>
                    </div>
                    <div class="summary-item">
                        <span>Total Pendiente:</span>
                        <strong>${this.formatearMoneda(totalPendiente)}</strong>
                    </div>
                    <div class="summary-item">
                        <span>Total de Clientes:</span>
                        <strong>${this.clientes.length}</strong>
                    </div>
                </div>

                <h2>Detalle de Clientes</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Cédula</th>
                            <th>Teléfono</th>
                            <th>Préstamo</th>
                            <th>Cobrado</th>
                            <th>Pendiente</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        this.clientes.forEach(cliente => {
            const pendiente = cliente.totalPagar - cliente.pagado;
            const estado = cliente.pagado >= cliente.totalPagar ? 'Completado' : 'Activo';
            
            html += `
                <tr>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.cedula}</td>
                    <td>${cliente.telefono}</td>
                    <td>${this.formatearMoneda(cliente.monto)}</td>
                    <td>${this.formatearMoneda(cliente.pagado)}</td>
                    <td>${this.formatearMoneda(pendiente)}</td>
                    <td>${estado}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
                
                <button onclick="window.print()" style="padding: 10px 20px; margin: 20px 10px 0 0; cursor: pointer;">Imprimir</button>
                <button onclick="window.close()" style="padding: 10px 20px; margin: 20px 0 0 0; cursor: pointer;">Cerrar</button>
            </body>
            </html>
        `;

        const ventana = window.open('', '_blank', 'width=900,height=700');
        ventana.document.write(html);
    }

    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(valor);
    }

    formatearFecha(fecha) {
        return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    mostrarNotificacion(mensaje, tipo) {
        // Crear notificación temporal
        const notif = document.createElement('div');
        notif.textContent = mensaje;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
}

// ========================================
// NAVEGACIÓN DE TABS
// ========================================

function showTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar el tab seleccionado
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// ========================================
// INICIALIZACIÓN
// ========================================

const sistema = new SistemaPrestamos();

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
