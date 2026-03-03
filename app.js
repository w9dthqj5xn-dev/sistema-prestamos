// ========================================
// GESTIÓN DE DATOS Y ALMACENAMIENTO
// ========================================

class SistemaPrestamos {
    constructor() {
        this.clientes = this.cargarDatos('clientes') || [];
        this.pagos = this.cargarDatos('pagos') || [];
        this.empresa = this.cargarDatos('empresa') || {};
        this.sesionActiva = false;
        this.usuarioActual = null;
        this.verificarSesion();
        this.inicializarEventListeners();
    }

    inicializarEventListeners() {
        // Botón para cargar datos de demostración
        const btnCargarDemo = document.getElementById('btnCargarDemo');
        if (btnCargarDemo) {
            btnCargarDemo.addEventListener('click', () => {
                console.log('Botón cargarDatos demo clickeado');
                this.cargarDatosDemo();
            });
        }

        // Botón para limpiar todos los datos
        const btnLimpiarDatos = document.getElementById('btnLimpiarDatos');
        if (btnLimpiarDatos) {
            btnLimpiarDatos.addEventListener('click', () => {
                console.log('Botón limpiar datos clickeado');
                this.limpiarTodosDatos();
            });
        }
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
        // No cargar automáticamente aquí, permitir que el usuario decida
        this.actualizarVistas();
        this.establecerFechaActual();
    }

    cargarDatosDemo() {
        // Limpiar primero y luego generar
        console.log('Cargando datos de demostración...');
        this.generarDatosDemo();
    }

    generarDatosDemo() {
        // Limpiar localStorage primero para asegurar que se cargan los nuevos datos
        localStorage.removeItem('clientes');
        localStorage.removeItem('pagos');
        localStorage.removeItem('empresa');
        
        const ahora = new Date();
        const hace30dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        const hace15dias = new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000);
        const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Clientes de demostración
        this.clientes = [
            {
                id: 1000001,
                nombre: 'Juan Carlos Martínez',
                cedula: '001-1234567-8',
                telefono: '8091234567',
                telefono2: '8095678901',
                direccion: 'Calle Principal 123, Santo Domingo',
                monto: 50000,
                tasa: 5,
                plazo: 12,
                frecuenciaPago: 'mensual',
                pagoMensual: 4583.33,
                cuotaPago: 4583.33,
                totalPagar: 55000,
                fechaInicio: hace30dias.toISOString().split('T')[0],
                pagado: 13750,
                estado: 'activo',
                fechaRegistro: hace30dias.toISOString()
            },
            {
                id: 1000002,
                nombre: 'María Rosa Pérez García',
                cedula: '002-2345678-9',
                telefono: '8096789012',
                telefono2: '',
                direccion: 'Avenida Central 456, Santiago',
                monto: 75000,
                tasa: 6,
                plazo: 24,
                frecuenciaPago: 'quincenal',
                pagoMensual: 3437.50,
                cuotaPago: 1718.75,
                totalPagar: 82500,
                fechaInicio: hace15dias.toISOString().split('T')[0],
                pagado: 5156.25,
                estado: 'activo',
                fechaRegistro: hace15dias.toISOString()
            },
            {
                id: 1000003,
                nombre: 'Carlos Alberto López',
                cedula: '003-3456789-0',
                telefono: '8097890123',
                telefono2: '8099876543',
                direccion: 'Calle del Comercio 789, La Romana',
                monto: 30000,
                tasa: 4.5,
                plazo: 6,
                frecuenciaPago: 'mensual',
                pagoMensual: 5250,
                cuotaPago: 5250,
                totalPagar: 31500,
                fechaInicio: hace7dias.toISOString().split('T')[0],
                pagado: 5250,
                estado: 'activo',
                fechaRegistro: hace7dias.toISOString()
            },
            {
                id: 1000004,
                nombre: 'Ana Sofía Rodríguez',
                cedula: '004-4567890-1',
                telefono: '8098901234',
                telefono2: '',
                direccion: 'Calle Las Flores 321, San Cristóbal',
                monto: 100000,
                tasa: 5.5,
                plazo: 18,
                frecuenciaPago: 'mensual',
                pagoMensual: 6111.11,
                cuotaPago: 6111.11,
                totalPagar: 110000,
                fechaInicio: '2025-12-01',
                pagado: 12222.22,
                estado: 'activo',
                fechaRegistro: new Date('2025-12-01').toISOString()
            }
        ];

        // Pagos de demostración
        this.pagos = [
            // Pagos de Juan Carlos
            { id: 2000001, clienteId: 1000001, clienteNombre: 'Juan Carlos Martínez', clienteTelefono: '8091234567', tipoPago: 'mensual', monto: 4583.33, fecha: hace30dias.toISOString().split('T')[0], notas: 'Primer pago', fechaRegistro: hace30dias.toISOString() },
            { id: 2000002, clienteId: 1000001, clienteNombre: 'Juan Carlos Martínez', clienteTelefono: '8091234567', tipoPago: 'mensual', monto: 4583.33, fecha: hace15dias.toISOString().split('T')[0], notas: '', fechaRegistro: hace15dias.toISOString() },
            { id: 2000003, clienteId: 1000001, clienteNombre: 'Juan Carlos Martínez', clienteTelefono: '8091234567', tipoPago: 'mensual', monto: 4583.33, fecha: ahora.toISOString().split('T')[0], notas: 'Pago al día', fechaRegistro: ahora.toISOString() },
            
            // Pagos de María Rosa
            { id: 2000004, clienteId: 1000002, clienteNombre: 'María Rosa Pérez García', clienteTelefono: '8096789012', tipoPago: 'quincenal', monto: 1718.75, fecha: hace15dias.toISOString().split('T')[0], notas: 'Primer pago', fechaRegistro: hace15dias.toISOString() },
            { id: 2000005, clienteId: 1000002, clienteNombre: 'María Rosa Pérez García', clienteTelefono: '8096789012', tipoPago: 'quincenal', monto: 1718.75, fecha: ahora.toISOString().split('T')[0], notas: 'Segundo pago', fechaRegistro: ahora.toISOString() },
            
            // Pagos de Carlos Alberto
            { id: 2000006, clienteId: 1000003, clienteNombre: 'Carlos Alberto López', clienteTelefono: '8097890123', tipoPago: 'mensual', monto: 5250, fecha: hace7dias.toISOString().split('T')[0], notas: 'Pago inicial', fechaRegistro: hace7dias.toISOString() },
            
            // Pagos de Ana Sofía
            { id: 2000007, clienteId: 1000004, clienteNombre: 'Ana Sofía Rodríguez', clienteTelefono: '8098901234', tipoPago: 'mensual', monto: 6111.11, fecha: '2025-12-15', notas: '', fechaRegistro: new Date('2025-12-15').toISOString() },
            { id: 2000008, clienteId: 1000004, clienteNombre: 'Ana Sofía Rodríguez', clienteTelefono: '8098901234', tipoPago: 'mensual', monto: 6111.11, fecha: '2026-01-15', notas: 'Pago mensual', fechaRegistro: new Date('2026-01-15').toISOString() }
        ];

        // Guardar datos de demostración
        this.guardarDatos('clientes', this.clientes);
        this.guardarDatos('pagos', this.pagos);

        // Configuración de empresa de demostración
        this.empresa = {
            nombre: 'C. Polanco - Préstamos',
            telefono: '809-555-0001',
            direccion: 'Av. Independencia 500, Santo Domingo, RD'
        };
        this.guardarDatos('empresa', this.empresa);

        this.actualizarVistas();
        this.mostrarNotificacion('✅ Datos de demostración cargados correctamente', 'success');
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
        const empresaForm = document.getElementById('empresaForm');
        const logoEmpresaInput = document.getElementById('logoEmpresa');

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

        // Empresa
        if (empresaForm) {
            empresaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarConfiguracionEmpresa();
            });
        }

        if (logoEmpresaInput) {
            logoEmpresaInput.addEventListener('change', (e) => {
                this.procesarLogoEmpresa(e);
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

    limpiarTodosDatos() {
        if (confirm('⚠️ ¿Está seguro de limpiar todos los datos actuales?\n\nEsta acción eliminará:\n- Todos los clientes\n- Todos los pagos\n\nNo se puede deshacer.')) {
            this.clientes = [];
            this.pagos = [];
            this.guardarDatos('clientes', []);
            this.guardarDatos('pagos', []);
            this.actualizarVistas();
            this.mostrarNotificacion('Datos limpiados correctamente', 'success');
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
        const monto = this.parseInputNumber(document.getElementById('monto').value);
        const tasaMensual = this.parseInputNumber(document.getElementById('tasa').value) / 100;
        const plazo = parseInt(document.getElementById('plazo').value);
        const frecuencia = document.getElementById('frecuenciaCalc') ? document.getElementById('frecuenciaCalc').value : 'mensual';

        // Determinar factor de periodo según frecuencia
        const factor = (frecuencia === 'semanal') ? 4 : (frecuencia === 'quincenal') ? 2 : 1;
        const totalPeriodos = plazo * factor;

        // INTERÉS SIMPLE: Monto × Tasa × Tiempo
        const interesTotal = Math.round(monto * tasaMensual * plazo);
        const totalPagar = monto + interesTotal;
        const pagoPeriodo = Math.round(totalPagar / totalPeriodos);

        // Mostrar resultados (texto adaptado a la frecuencia)
        const labelPago = (frecuencia === 'semanal') ? 'Pago Semanal' : (frecuencia === 'quincenal') ? 'Pago Quincenal' : 'Pago Mensual';
        document.getElementById('pagoMensual').previousElementSibling.textContent = labelPago + ':';
        document.getElementById('pagoMensual').textContent = this.formatearMoneda(pagoPeriodo);
        document.getElementById('totalPagar').textContent = this.formatearMoneda(totalPagar);
        document.getElementById('interesTotal').textContent = this.formatearMoneda(interesTotal);

        // Generar tabla de amortización por periodo
        this.generarTablaAmortizacion(monto, interesTotal, totalPeriodos, pagoPeriodo, frecuencia);

        document.getElementById('resultadoCalculo').classList.remove('hidden');
    }

    generarTablaAmortizacion(monto, interesTotal, totalPeriodos, pagoPeriodo, frecuencia) {
        const tbody = document.querySelector('#tablaAmortizacion tbody');
        tbody.innerHTML = '';

        let saldo = monto;
        const periodoLabel = (frecuencia === 'semanal') ? 'Semana' : (frecuencia === 'quincenal') ? 'Quincena' : 'Mes';
        const interesPorPeriodo = interesTotal / totalPeriodos;
        const capitalPorPeriodo = monto / totalPeriodos;

        for (let i = 1; i <= totalPeriodos; i++) {
            let capital = capitalPorPeriodo;
            
            // Ajustar último pago para evitar errores de redondeo
            if (i === totalPeriodos) {
                capital = saldo;
            }

            saldo = saldo - capital;
            if (saldo < 1e-8) saldo = 0;

            const fila = tbody.insertRow();
            fila.innerHTML = `
                <td>${periodoLabel} ${i}</td>
                <td>${this.formatearMoneda(pagoPeriodo)}</td>
                <td>${this.formatearMoneda(capital)}</td>
                <td>${this.formatearMoneda(interesPorPeriodo)}</td>
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
            const monto = this.parseInputNumber(document.getElementById('montoPrestamo').value);
            const tasa = this.parseInputNumber(document.getElementById('tasaPrestamo').value);
            const plazo = parseInt(document.getElementById('plazoPrestamo').value);
            const frecuenciaPago = document.getElementById('frecuenciaPago').value;
            const fechaInicio = document.getElementById('fechaInicio').value;
            const montoPagadoInicialInput = document.getElementById('montoPagadoInicial').value;
            const montoPagadoInicial = montoPagadoInicialInput ? this.parseInputNumber(montoPagadoInicialInput) : 0;
            
            console.log('Datos capturados:', { nombre, cedula, telefono, telefono2, monto, tasa, plazo, frecuenciaPago });

            // INTERÉS SIMPLE: Monto × Tasa × Tiempo
            const tasaMensual = tasa / 100;
            const interesTotal = Math.round(monto * tasaMensual * plazo);
            const totalPagar = monto + interesTotal;
            const pagoMensual = Math.round(totalPagar / plazo);

            // Calcular cuota según frecuencia
            let cuotaPago;
            if (frecuenciaPago === 'semanal') {
                cuotaPago = Math.round(pagoMensual / 4);
            } else if (frecuenciaPago === 'quincenal') {
                cuotaPago = Math.round(pagoMensual / 2);
            } else {
                cuotaPago = pagoMensual;
            }

            const cliente = {
                id: Date.now(),
                nombre,
                cedula,
                telefono,
                telefono2,
                direccion,
                monto,
                tasa,
                plazo,
                frecuenciaPago,
                pagoMensual,
                cuotaPago,
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
                    body { font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #2563eb; color: white; }
                    .button-group { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
                    button { padding: 10px 20px; cursor: pointer; border: none; border-radius: 6px; font-weight: 600; transition: background 0.3s; }
                    .btn-whatsapp { background: #25D366; color: white; }
                    .btn-whatsapp:hover { background: #1ebe5b; }
                    .btn-print { background: #2563eb; color: white; }
                    .btn-print:hover { background: #1e40af; }
                    .btn-close { background: #ef4444; color: white; }
                    .btn-close:hover { background: #dc2626; }
                </style>
            </head>
            <body>
                <div class="container">
                    ${detalleHTML}
                    <div class="button-group">
                        <button class="btn-whatsapp" onclick="compartirWhatsApp()">💬 Compartir por WhatsApp</button>
                        <button class="btn-print" onclick="window.print()">🖨️ Imprimir</button>
                        <button class="btn-close" onclick="window.close()">❌ Cerrar</button>
                    </div>
                </div>
                <script>
                    function compartirWhatsApp() {
                        const telefonoOriginal = '${cliente.telefono}';
                        const telefonoLimpio = telefonoOriginal.replace(/\\D/g, '');
                        let telefono = telefonoLimpio;
                        
                        if (telefono.length === 10) {
                            telefono = '1' + telefono;
                        }
                        
                        if (!telefono || telefono.length < 11) {
                            alert('El cliente no tiene un teléfono válido para WhatsApp');
                            return;
                        }
                        
                        const mensaje = \`*Información del Préstamo*\\n\\n\` +
                            \`Nombre: ${cliente.nombre}\\n\` +
                            \`Cédula: ${cliente.cedula}\\n\` +
                            \`Monto del Préstamo: ${this.formatearMoneda ? this.formatearMoneda(cliente.monto) : '$' + cliente.monto}\\n\` +
                            \`Cuota a Pagar: ${this.formatearMoneda ? this.formatearMoneda(cliente.cuotaPago || cliente.pagoMensual) : '$' + (cliente.cuotaPago || cliente.pagoMensual)}\\n\` +
                            \`Total a Pagar: ${this.formatearMoneda ? this.formatearMoneda(cliente.totalPagar) : '$' + cliente.totalPagar}\\n\` +
                            \`Total Pagado: ${this.formatearMoneda ? this.formatearMoneda(cliente.pagado) : '$' + cliente.pagado}\\n\` +
                            \`Saldo Pendiente: ${this.formatearMoneda ? this.formatearMoneda(cliente.totalPagar - cliente.pagado) : '$' + (cliente.totalPagar - cliente.pagado)}\\n\\n\` +
                            \`Frecuencia de Pago: ${cliente.frecuenciaPago || 'mensual'}\\n\`;
                        
                        const url = 'https://wa.me/' + telefono + '?text=' + encodeURIComponent(mensaje);
                        window.open(url, '_blank');
                    }
                </script>
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
        const monto = this.parseInputNumber(document.getElementById('montoPago').value);
        const fecha = document.getElementById('fechaPago').value;
        const notas = document.getElementById('notasPago').value;

        const cliente = this.clientes.find(c => c.id === clienteId);
        if (!cliente) return;

        const pago = {
            id: Date.now(),
            clienteId,
            clienteNombre: cliente.nombre,
            clienteTelefono: cliente.telefono,
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

        if (confirm('¿Desea enviar el recibo por WhatsApp?')) {
            this.enviarReciboWhatsApp(pago.id);
        }
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
                <div class="pago-actions">
                    <button class="btn-secondary" onclick="sistema.descargarReciboPDF(${pago.id})">📄 Descargar PDF</button>
                    <button class="btn-secondary btn-whatsapp" onclick="sistema.enviarReciboWhatsApp(${pago.id})">💬 Enviar por WhatsApp</button>
                </div>
            </div>
            `;
        }).join('');
    }

    descargarReciboPDF(pagoId) {
        const pago = this.pagos.find(p => p.id === pagoId);
        if (!pago) {
            this.mostrarNotificacion('No se encontró el pago', 'error');
            return;
        }

        const cliente = this.clientes.find(c => c.id === pago.clienteId);
        const element = this.crearHTMLRecibo(pago, cliente);
        
        const opt = {
            margin: 10,
            filename: `recibo-${pago.clienteNombre}-${pago.fecha}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };

        html2pdf().set(opt).from(element).save();
    }

    enviarReciboWhatsApp(pagoId) {
        const pago = this.pagos.find(p => p.id === pagoId);
        if (!pago) {
            this.mostrarNotificacion('No se encontró el pago para enviar el recibo', 'error');
            return;
        }

        const cliente = this.clientes.find(c => c.id === pago.clienteId);
        const telefono = (cliente && cliente.telefono) ? cliente.telefono : (pago.clienteTelefono || '');
        const telefonoLimpio = this.normalizarTelefono(telefono);

        if (!telefonoLimpio) {
            this.mostrarNotificacion('El cliente no tiene un teléfono válido para WhatsApp', 'error');
            return;
        }

        // Generar PDF del recibo
        this.generarPDFRecibo(pago, cliente, telefonoLimpio);
    }

    normalizarTelefono(telefono) {
        if (!telefono) return '';
        let digits = String(telefono).replace(/\D/g, '');

        if (digits.length === 10) {
            digits = `1${digits}`;
        }

        if (digits.length < 11) {
            return '';
        }

        return digits;
    }

    generarMensajeRecibo(pago, cliente) {
        const nombre = pago.clienteNombre || (cliente ? cliente.nombre : 'Cliente');
        const tipoPagoTexto = {
            'semanal': 'Cuota Semanal',
            'quincenal': 'Cuota Quincenal',
            'mensual': 'Cuota Mensual',
            'otro': 'Otro Monto',
            'saldo-total': 'Saldo Total'
        }[pago.tipoPago] || 'Pago';

        const monto = this.formatearMoneda(pago.monto);
        const fecha = this.formatearFecha(pago.fecha);
        const saldoPendiente = cliente ? this.formatearMoneda(Math.max(0, cliente.totalPagar - cliente.pagado)) : null;

        return (
            `Recibo de pago\n` +
            `Cliente: ${nombre}\n` +
            `Tipo: ${tipoPagoTexto}\n` +
            `Monto: ${monto}\n` +
            `Fecha: ${fecha}` +
            (saldoPendiente ? `\nSaldo pendiente: ${saldoPendiente}` : '') +
            `\n\nGracias por su pago.`
        );
    }

    ajustarMontoPago(tipoPago) {
        const clienteId = parseInt(document.getElementById('clientePago').value);
        if (!clienteId) return;

        const cliente = this.clientes.find(c => c.id === clienteId);
        if (!cliente) return;

        const montoInput = document.getElementById('montoPago');
        
        if (tipoPago === 'semanal') {
            const cuotaSemanal = Math.round(cliente.pagoMensual / 4);
            montoInput.value = cuotaSemanal.toString();
        } else if (tipoPago === 'quincenal') {
            const cuotaQuincenal = Math.round(cliente.pagoMensual / 2);
            montoInput.value = cuotaQuincenal.toString();
        } else if (tipoPago === 'mensual') {
            montoInput.value = cliente.pagoMensual.toString();
        } else if (tipoPago === 'saldo-total') {
            const saldoPendiente = cliente.totalPagar - cliente.pagado;
            montoInput.value = Math.round(saldoPendiente).toString();
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

    // ========================================
    // GENERACIÓN DE PDF
    // ========================================

    generarPDFRecibo(pago, cliente, telefonoWhatsApp) {
        const element = this.crearHTMLRecibo(pago, cliente);
        const opt = {
            margin: 10,
            filename: `recibo-${pago.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };

        // Generar PDF
        html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
            // Convertir a base64 para poder enviarlo
            const pdfData = pdf.output('dataurlstring');
            
            // Guardar para referencia
            pago.pdfRecibo = pdfData;
            this.guardarDatos('pagos', this.pagos);

            // Crear mensaje
            const mensaje = this.generarMensajeRecibo(pago, cliente);
            
            // Abrir WhatsApp con el mensaje
            const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');

            this.mostrarNotificacion('PDF generado. Abre WhatsApp para enviar el recibo', 'success');
        }).catch((err) => {
            console.error('Error al generar PDF:', err);
            this.mostrarNotificacion('Error al generar el PDF: ' + err.message, 'error');
        });
    }

    crearHTMLRecibo(pago, cliente) {
        const empresa = this.empresa || {};
        const fechaHoy = new Date();
        const fechaFormato = fechaHoy.toLocaleDateString('es-MX', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const tipoPagoTexto = {
            'semanal': 'Cuota Semanal',
            'quincenal': 'Cuota Quincenal',
            'mensual': 'Cuota Mensual',
            'otro': 'Otro Monto',
            'saldo-total': 'Saldo Total'
        }[pago.tipoPago] || 'Pago';

        const saldoPendiente = cliente ? (cliente.totalPagar - cliente.pagado) : 0;

        const html = document.createElement('div');
        html.innerHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <!-- Header -->
                <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px;">
                    ${empresa.logo ? `<img src="${empresa.logo}" style="max-height: 80px; margin-bottom: 10px;">` : ''}
                    <h1 style="margin: 10px 0; color: #2563eb; font-size: 24px;">${empresa.nombre || 'RECIBO DE PAGO'}</h1>
                    <p style="margin: 5px 0; color: #64748b; font-size: 12px;">
                        ${empresa.telefono ? `Tel: ${empresa.telefono} | ` : ''}
                        ${empresa.direccion ? `Dir: ${empresa.direccion}` : ''}
                    </p>
                </div>

                <!-- Información del Recibo -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <p style="margin: 0; color: #64748b; font-size: 11px;">CLIENTE</p>
                        <p style="margin: 5px 0 0 0; color: #1e293b; font-weight: bold; font-size: 14px;">${pago.clienteNombre}</p>
                        ${cliente ? `<p style="margin: 2px 0; color: #64748b; font-size: 11px;">Cédula: ${cliente.cedula}</p>` : ''}
                        ${cliente ? `<p style="margin: 2px 0; color: #64748b; font-size: 11px;">Teléfono: ${cliente.telefono}</p>` : ''}
                    </div>
                    <div>
                        <p style="margin: 0; color: #64748b; font-size: 11px;">FECHA DE PAGO</p>
                        <p style="margin: 5px 0 0 0; color: #1e293b; font-weight: bold; font-size: 14px;">${this.formatearFecha(pago.fecha)}</p>
                        <p style="margin: 2px 0; color: #64748b; font-size: 11px;">Emitido: ${fechaFormato}</p>
                    </div>
                </div>

                <!-- Detalles del Pago -->
                <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <table style="width: 100%; font-size: 12px;">
                        <tr>
                            <td style="color: #64748b;">Tipo de Pago:</td>
                            <td style="text-align: right; font-weight: bold; color: #1e293b;">${tipoPagoTexto}</td>
                        </tr>
                        <tr style="margin-top: 10px;">
                            <td style="color: #64748b;">Monto Pagado:</td>
                            <td style="text-align: right; font-size: 16px; font-weight: bold; color: #10b981;">${this.formatearMoneda(pago.monto)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Resumen de Préstamo -->
                ${cliente ? `
                <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: bold; font-size: 13px;">RESUMEN DEL PRÉSTAMO</p>
                    <table style="width: 100%; font-size: 11px;">
                        <tr>
                            <td style="color: #64748b;">Monto Original:</td>
                            <td style="text-align: right; color: #1e293b;">${this.formatearMoneda(cliente.monto)}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b;">Total a Pagar:</td>
                            <td style="text-align: right; color: #1e293b;">${this.formatearMoneda(cliente.totalPagar)}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b;">Total Pagado:</td>
                            <td style="text-align: right; color: #10b981; font-weight: bold;">${this.formatearMoneda(cliente.pagado)}</td>
                        </tr>
                        <tr style="border-top: 1px solid #dbeafe;">
                            <td style="color: #64748b; padding-top: 8px;">Saldo Pendiente:</td>
                            <td style="text-align: right; color: #ef4444; font-weight: bold; padding-top: 8px;">${this.formatearMoneda(Math.max(0, saldoPendiente))}</td>
                        </tr>
                    </table>
                </div>
                ` : ''}

                <!-- Notas -->
                ${pago.notas ? `
                <div style="background: #fef3c7; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 12px;"><strong>Notas:</strong> ${pago.notas}</p>
                </div>
                ` : ''}

                <!-- Footer -->
                <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
                    <p style="margin: 0; color: #64748b; font-size: 11px;">
                        Este recibo fue generado automáticamente por el Sistema de Préstamos
                    </p>
                    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 10px;">
                        Recibo #${pago.id} | ${new Date().toLocaleDateString('es-MX')}
                    </p>
                </div>
            </div>
        `;

        return html;
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

    // Parseo seguro de números con soporte para separadores locales
    parseInputNumber(value) {
        if (value === null || value === undefined) return 0;
        let s = String(value).trim();
        if (s === '') return 0;

        // Si contiene tanto ',' como '.' asumimos formato europeo: puntos miles, coma decimal
        if (s.indexOf(',') > -1 && s.indexOf('.') > -1) {
            return parseFloat(s.replace(/\./g, '').replace(/,/g, '.')) || 0;
        }

        // Si contiene solo comas, tratarlas como separador decimal
        if (s.indexOf(',') > -1) {
            return parseFloat(s.replace(/\./g, '').replace(/,/g, '.')) || 0;
        }

        // Si contiene puntos, decidir si son separadores de miles o decimal
        const dotCount = (s.match(/\./g) || []).length;
        if (dotCount > 1) {
            // varios puntos -> eliminar todos (separadores de miles)
            return parseFloat(s.replace(/\./g, '')) || 0;
        }
        if (dotCount === 1) {
            const parts = s.split('.');
            // Si la parte después del punto tiene 3 cifras, probablemente es separador de miles
            if (parts[1].length === 3) {
                return parseFloat(parts.join('')) || 0;
            }
            // En cualquier otro caso, tratar punto como decimal
            return parseFloat(s) || 0;
        }

        // Sin separadores
        return parseFloat(s) || 0;
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

    generarCobroPorDia() {
        const filtro = document.getElementById('filtroFechaReporte').value;
        const ahora = new Date();
        
        // Agrupar pagos por día
        let pagosPorDia = {};
        
        this.pagos.forEach(pago => {
            const fechaPago = new Date(pago.fecha);
            
            // Aplicar filtro
            let incluir = false;
            switch(filtro) {
                case 'hoy':
                    incluir = fechaPago.toDateString() === ahora.toDateString();
                    break;
                case 'semana':
                    const unaSemanaAtras = new Date(ahora);
                    unaSemanaAtras.setDate(ahora.getDate() - 7);
                    incluir = fechaPago >= unaSemanaAtras;
                    break;
                case 'mes':
                    const unMesAtras = new Date(ahora);
                    unMesAtras.setMonth(ahora.getMonth() - 1);
                    incluir = fechaPago >= unMesAtras;
                    break;
                case 'año':
                    const unAñoAtras = new Date(ahora);
                    unAñoAtras.setFullYear(ahora.getFullYear() - 1);
                    incluir = fechaPago >= unAñoAtras;
                    break;
                default:
                    incluir = true;
            }
            
            if (incluir) {
                const fechaKey = pago.fecha;
                if (!pagosPorDia[fechaKey]) {
                    pagosPorDia[fechaKey] = [];
                }
                pagosPorDia[fechaKey].push(pago);
            }
        });
        
        const contenedor = document.getElementById('cobroPorDia');
        
        // Ordenar las fechas de más reciente a más antigua
        const fechasOrdenadas = Object.keys(pagosPorDia).sort((a, b) => 
            new Date(b) - new Date(a)
        );
        
        if (fechasOrdenadas.length === 0) {
            contenedor.innerHTML = '<div class="empty-state">No hay cobros en este período</div>';
            return;
        }
        
        let html = '<div class="cobros-por-dia">';
        
        let totalGeneral = 0;
        
        fechasOrdenadas.forEach(fecha => {
            const pagos = pagosPorDia[fecha];
            const totalDia = pagos.reduce((sum, p) => sum + p.monto, 0);
            totalGeneral += totalDia;
            
            html += `
                <div class="dia-cobro">
                    <div class="dia-header">
                        <span class="fecha-dia">${this.formatearFecha(fecha)}</span>
                        <span class="total-dia"><strong>${this.formatearMoneda(totalDia)}</strong></span>
                    </div>
                    <div class="dia-detalles">
            `;
            
            pagos.forEach(pago => {
                html += `
                    <div class="pago-detalle">
                        <span class="cliente-nombre">${pago.clienteNombre}</span>
                        <span class="monto-pago">${this.formatearMoneda(pago.monto)}</span>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
            <div class="total-general">
                <strong>Total en el período: ${this.formatearMoneda(totalGeneral)}</strong>
            </div>
        </div>`;
        
    }

    generarMovimientosRecientes() {
        const filtro = document.getElementById('filtroFechaReporte').value;
        const ahora = new Date();
        const hoyString = ahora.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
        
        let pagosFiltrados = this.pagos.filter(pago => {
            const fechaPagoString = pago.fecha; // Ya viene en formato YYYY-MM-DD
            const fechaPago = new Date(fechaPagoString + 'T00:00:00');
            
            switch(filtro) {
                case 'hoy':
                    return fechaPagoString === hoyString;
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
        // Redondear al entero más cercano (sin centavos)
        const valorRedondeado = Math.round(valor);
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valorRedondeado);
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

    // ========================================
    // CONFIGURACIÓN DE EMPRESA
    // ========================================

    guardarConfiguracionEmpresa() {
        const nombre = document.getElementById('nombreEmpresa').value;
        const telefono = document.getElementById('telefonoEmpresa').value;
        const direccion = document.getElementById('direccionEmpresa').value;

        this.empresa = {
            nombre: nombre || 'Sistema de Préstamos',
            telefono,
            direccion,
            logo: this.empresa.logo || null
        };

        this.guardarDatos('empresa', this.empresa);
        this.actualizarHeaderEmpresa();
        this.mostrarNotificacion('Configuración de empresa guardada correctamente', 'success');
    }

    procesarLogoEmpresa(event) {
        const archivo = event.target.files[0];
        if (!archivo) return;

        // Validar tipo de archivo
        if (!archivo.type.startsWith('image/')) {
            this.mostrarNotificacion('Solo se permiten archivos de imagen', 'error');
            return;
        }

        // Validar tamaño (500KB máximo)
        if (archivo.size > 500 * 1024) {
            this.mostrarNotificacion('El archivo es demasiado grande (máximo 500KB)', 'error');
            return;
        }

        const lector = new FileReader();
        lector.onload = (e) => {
            try {
                this.empresa.logo = e.target.result;
                this.guardarDatos('empresa', this.empresa);
                this.mostrarPreviewLogo(e.target.result);
                this.actualizarHeaderEmpresa();
                this.mostrarNotificacion('Logo cargado exitosamente', 'success');
            } catch (error) {
                this.mostrarNotificacion('Error al procesar el logo: ' + error.message, 'error');
            }
        };

        lector.onerror = () => {
            this.mostrarNotificacion('Error al leer el archivo', 'error');
        };

        lector.readAsDataURL(archivo);
    }

    mostrarPreviewLogo(logoBase64) {
        const preview = document.getElementById('logoPreview');
        if (preview) {
            preview.innerHTML = `<img src="${logoBase64}" style="max-width: 150px; max-height: 100px; object-fit: contain;">`;
        }
    }

    eliminarLogo() {
        if (confirm('¿Desea eliminar el logo de la empresa?')) {
            this.empresa.logo = null;
            this.guardarDatos('empresa', this.empresa);
            
            const preview = document.getElementById('logoPreview');
            if (preview) {
                preview.innerHTML = '<p style="color: #64748b; margin: 0;">Ningún logo cargado</p>';
            }
            
            this.actualizarHeaderEmpresa();
            this.mostrarNotificacion('Logo eliminado', 'success');
        }
    }

    actualizarHeaderEmpresa() {
        const nombre = this.empresa.nombre || 'Sistema de Préstamos';
        const tituloEl = document.getElementById('tituloEmpresa');
        const logoHeaderEl = document.getElementById('logoEmpresaHeader');

        if (tituloEl) {
            tituloEl.textContent = nombre;
        }

        if (logoHeaderEl) {
            if (this.empresa.logo) {
                logoHeaderEl.innerHTML = `<img src="${this.empresa.logo}" style="height: 60px; width: auto; object-fit: contain;">`;
            } else {
                logoHeaderEl.innerHTML = '';
            }
        }

        // Actualizar título de la página
        document.title = nombre + ' - Sistema de Préstamos';
    }

    cargarConfiguracionEmpresa() {
        const nombreEl = document.getElementById('nombreEmpresa');
        const telefonoEl = document.getElementById('telefonoEmpresa');
        const direccionEl = document.getElementById('direccionEmpresa');

        if (nombreEl) nombreEl.value = this.empresa.nombre || '';
        if (telefonoEl) telefonoEl.value = this.empresa.telefono || '';
        if (direccionEl) direccionEl.value = this.empresa.direccion || '';

        if (this.empresa.logo) {
            this.mostrarPreviewLogo(this.empresa.logo);
        }

        this.actualizarHeaderEmpresa();
    }

    // ========================================
    // INSTALACIÓN COMO APP
    // ========================================

    mostrarOpcionesInstalacion() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    this.mostrarNotificacion('✅ Aplicación instalada exitosamente', 'success');
                } else {
                    this.mostrarNotificacion('❌ Instalación cancelada', 'error');
                }
                window.deferredPrompt = null;
            });
        } else {
            this.mostrarNotificacion('La aplicación ya está instalada o tu navegador no lo soporta', 'info');
        }
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

    // Cargar configuración de empresa si es el tab de configuración
    if (tabName === 'configuracion' && sistema) {
        setTimeout(() => sistema.cargarConfiguracionEmpresa(), 100);
    }
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
