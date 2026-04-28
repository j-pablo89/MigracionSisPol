const controller = {};
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const { get } = require("browser-sync");
const ExcelJS = require("exceljs");
const foxModel = require("../config/conectorODBC");
const { buscarASP } = require("../services/sispolService");

const EstadoVar = {
    ANULADO: 0,
    CERRADO: 1,
    ACTIVO: 2,
    MODIFICADO: 3,
};

//________________________________________________________________________________________________________________________________________________________

/******************************************************** CONTROLADORES PARA GESTION USUARIOS ***********************************************************/
//________________________________________________________________________________________________________________________________________________________
controller.login = (req, res) => {
    const { username, password } = req.body;
    console.log("USUARIO: ", username);
    console.log("PASS: ", password);
    req.getConnection((err, conn) => {
        conn.query("SELECT id_usuario, Usuario, Contrasenia, Email, Telefono, Nombre, Apellido, Dni, Avatar_url, permiso_principal AS Permiso, nombre_rol FROM pol_usuarios INNER JOIN pol_persona USING(id_Persona) INNER JOIN pol_usuarioperfiles USING(id_usuario) INNER JOIN pol_roles USING(id_rol) WHERE Usuario = ? AND pol_usuarios.Estado = 1",[username],(err, users) => {
                if (err || users.length === 0) {
                    return res.redirect("/error401?error_msg=Credenciales%20inválidas");
                }
                const user = users[0];
                // Verificar la contraseña
                console.log("PASSWORD: ", password);
                console.log("CONTRASEÑA: ", user.Contrasenia);
                const passwordIsValid = bcrypt.compareSync(password, user.Contrasenia);
                const passwordIgualUsuario = bcrypt.compareSync(user.Usuario, user.Contrasenia);
                if (!passwordIsValid) {
                    var EstadoConexion = "LOGIN FALLIDO";
                    conn.query("INSERT INTO pol_logueo (id_usuario, Tipo) VALUES (?, ?)", [user.id_usuario, EstadoConexion], (err) => {
                            if (err) {
                                console.error("Error al registrar login fallido:", err);
                            }
                            return res.redirect("/error401?error_msg=Credenciales%20inválidas",
                            );
                        },
                    );

                    return; // importante para cortar ejecución
                }
                // Crear el token JWT
                const token = jwt.sign(
                    {
                        id: user.id_usuario,
                        username: user.Usuario,
                        nombre: user.Nombre,
                        apellido: user.Apellido,
                        Permiso: user.Permiso,
                        nombre_rol: user.nombre_rol,
                        dni: user.Dni
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: 86400, // 24 horass
                    },
                );
                console.log("TOKEN: ", token);
                // Establecer el token en una cookie (opcional)
                res.cookie("token", token, { httpOnly: true });

                // Usar userId en lugar de id para evitar conflictos con Express-session
                req.session.userId = user.id_usuario;
                req.session.lastActivity = Date.now();
                req.session.firstnamesecondname = user.Nombre + " " + user.Apellido;
                req.session.apellido = user.Apellido;
                req.session.username = user.Usuario;
                req.session.avatar = user.Avatar_url;
                req.session.Dni = user.Dni;
                req.session.debeCambiarClave = user.debeCambiarClave;
                req.session.permiso = user.Permiso;
                req.session.nombre_rol = user.nombre_rol;
                req.session.forzarCambioClave = passwordIgualUsuario;

                console.log("CONSOLA USERNAME: ", req.session.username);
                console.log("CONSOLA AVATAR: ", req.session.avatar);
                console.log("CONSOLA FIRSTNAMESECONDNAME: ", req.session.firstnamesecondname);
                console.log("CONSOLA USER ID: ", req.session.userId);
                console.log("CONSOLA PERMISO: ", req.session.permiso);
                console.log("CONSOLA NOMBRE_ROL: ", req.session.nombre_rol);

                if (req.session.nombre_rol !== "ADMINISTRADOR") {
                    conn.query("SELECT uu.id_Unidades, un.Detalle AS Detalle FROM pol_usuariounidades uu INNER JOIN pol_unidades un ON uu.id_unidades = un.id_Unidades WHERE id_usuario = ? AND Estado = 1", [user.id_usuario], (err, unidades) => {
                            if (err) {
                                console.error("Error al obtener unidades:", err);
                                return res.redirect("/login");
                            }
                            // almacenar objetos completos para usarlos luego en la vista _header2.ejs
                            req.session.unidades = unidades;
                            console.log("UNIDADES EN SESIÓN: ", req.session.unidades);
                            console.log("ROL SESSION", req.session.nombre_rol);
                            console.log("UNIDADES SESSION", req.session.unidades);
                            var EstadoConexion = "LOGIN";
                            conn.query("INSERT INTO pol_logueo (id_usuario, Tipo) VALUES (?, ?)",[user.id_usuario, EstadoConexion], (err, result) => {
                                    if (err) {
                                        console.error("Error al registrar logueo:", err);
                                    }
                                    // Guardar sesión antes de redirigir
                                    req.session.save((err) => {
                                        if (err) {
                                            console.error("Error al guardar sesión:", err);
                                        }
                                        // Redirigir al inicio; los datos de unidades ya están en req.session
                                        res.redirect("/inicio");
                                    });
                                },
                            );
                        },
                    );
                } else{
                    var EstadoConexion = "LOGIN";
                    conn.query("INSERT INTO pol_logueo (id_usuario, Tipo) VALUES (?, ?)",[user.id_usuario, EstadoConexion], (err, result) => {
                            if (err) {
                                console.error("Error al registrar logueo:", err);
                            }
                            // Guardar sesión antes de redirigir
                            req.session.save((err) => {
                                if (err) {
                                    console.error("Error al guardar sesión:", err);
                                }
                                res.redirect("/inicio");
                            });
                        },
                    );
                }
            },
        );
    });
};

controller.logout = (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect("/login");
    }

    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error conexión DB:", err);
            return res.redirect("/login");
        }

        const EstadoConexion = "LOGOUT MANUAL";

        conn.query(
            "INSERT INTO pol_logueo (id_usuario, Tipo) VALUES (?, ?)", [userId, EstadoConexion],
            (err) => {
                if (err) {
                    console.error("Error al registrar logout:", err);
                }

                // Después de guardar el logout, destruir sesión
                req.session.destroy((err) => {
                    if (err) {
                        console.error("Error al cerrar sesión:", err);
                        return res.redirect("/inicio");
                    }

                    res.clearCookie("token");
                    res.clearCookie("connect.sid");
                    res.redirect("/login");
                });
            },
        );
    });
};

controller.inicio = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.json(err); // <--- return aquí para salir si error en conexión

        conn.query("SELECT MONTH(Fecha_alta) AS mes, COUNT(*) AS cantidad FROM pol_internolegajo WHERE YEAR(Fecha_alta) = YEAR(CURDATE()) GROUP BY MONTH(Fecha_alta) ORDER BY mes",
            (err, resultado) => {
                if (err) {
                    return res.json(err); // <--- return aquí para no continuar si error en query
                }

                const labels = resultado.map((row) => `MES ${row.mes}`);
                const data = resultado.map((row) => row.cantidad);
                conn.query("SELECT u.Detalle AS detalle_dependencia, im.Unidad_Destino, COUNT(*) AS cantidad FROM pol_internolegajo il INNER JOIN (SELECT * FROM pol_internomovimiento m WHERE m.id_InternoMovimiento IN (SELECT MAX(id_InternoMovimiento) FROM pol_internomovimiento GROUP BY id_InternoLegajo)) im ON im.id_InternoLegajo = il.id_InternoLegajo INNER JOIN pol_unidades u ON u.id_Unidades = im.Unidad_Destino WHERE il.Estado = 1 AND TIMESTAMPDIFF(DAY, im.Fecha_movimiento, NOW()) <= 6 GROUP BY im.Unidad_Destino, u.Detalle", (err, ingresosUltimos6Dias) => {
                        if (err) {
                            return res.json(err);
                        }
                        let anioactual = new Date().getFullYear();
                        conn.query("SELECT u.Detalle AS detalle_dependencia, im.Unidad_Destino, COUNT(*) AS cantidad FROM pol_internolegajo il INNER JOIN (SELECT * FROM pol_internomovimiento m WHERE m.id_InternoMovimiento IN (SELECT MAX(id_InternoMovimiento) FROM pol_internomovimiento GROUP BY id_InternoLegajo)) im ON im.id_InternoLegajo = il.id_InternoLegajo INNER JOIN pol_unidades u ON u.id_Unidades = im.Unidad_Destino WHERE il.Estado = 1 AND YEAR(im.Fecha_movimiento) = YEAR(CURDATE()) GROUP BY im.Unidad_Destino, u.Detalle",
                            (err, ingresosAnioActual) => {
                                if (err) {
                                    return res.json(err);
                                }
                                conn.query("SELECT u.Detalle AS detalle_dependencia, im.Unidad_Destino, COUNT(*) AS cantidad FROM pol_internolegajo il INNER JOIN (SELECT * FROM pol_internomovimiento m WHERE m.id_InternoMovimiento IN (SELECT MAX(id_InternoMovimiento) FROM pol_internomovimiento GROUP BY id_InternoLegajo)) im ON im.id_InternoLegajo = il.id_InternoLegajo INNER JOIN pol_unidades u ON u.id_Unidades = im.Unidad_Destino WHERE il.Estado = 1 GROUP BY im.Unidad_Destino, u.Detalle", (err, ingresosTotales) => {
                                        if (err) {
                                            return res.json(err);
                                        }
                                        return res.render("inicio", {
                                            labels: JSON.stringify(labels),
                                            data: JSON.stringify(data),
                                            ingresosUltimos6Dias,
                                            ingresosAnioActual,
                                            ingresosTotales,
                                        });
                                    },
                                );
                            },
                        );
                    },
                );
            },
        );
    });
};

controller.getIngresosPorAnio = (req, res) => {
    const anio = req.params.anio;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: "Error de conexión" });

        const sql = `SELECT MONTH(Fecha_alta) AS mes, COUNT(*) AS cantidad FROM pol_internolegajo WHERE YEAR(Fecha_alta) = ? GROUP BY MONTH(Fecha_alta) ORDER BY mes`;

        conn.query(sql, [anio], (err, resultado) => {
            if (err) return res.status(500).json({ error: "Error en la consulta" });

            // Armar labels y data para el gráfico
            const meses = [
                "Ene",
                "Feb",
                "Mar",
                "Abr",
                "May",
                "Jun",
                "Jul",
                "Ago",
                "Sep",
                "Oct",
                "Nov",
                "Dic",
            ];
            const labels = resultado.map((r) => meses[r.mes - 1]);
            const data = resultado.map((r) => r.cantidad);

            res.json({ labels, data });
        });
    });
};

controller.listarUsuarios = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query(
            "SELECT id_usuario, pol_persona.id_Persona, Usuario, Email, Apellido, Nombre, Dni, Avatar_url, permiso_principal AS Permiso, nombre_rol FROM pol_persona INNER JOIN pol_usuarios using(id_persona) LEFT JOIN pol_usuarioperfiles using(id_usuario) INNER JOIN pol_roles USING(id_rol) WHERE pol_usuarios.Estado != 0",
            (err, usuarios) => {
                if (err) {
                    res.json(err);
                }
                console.log("USUARIOS: ", usuarios);
                conn.query(
                    "SELECT * FROM pol_unidades WHERE id_Unidades >= 90",
                    (err, unidades) => {
                        if (err) {
                            res.json(err);
                        }
                        conn.query("SELECT * FROM pol_usuariounidades INNER JOIN pol_unidades USING(id_Unidades)", (err, dependencia) => {
                                if (err) {
                                    res.json(err);
                                }
                                console.log("USUARIOS: ", usuarios);
                                res.render("usuarios", {
                                    unidades: unidades,
                                    usuarios: usuarios,
                                    dependencia: dependencia,
                                    success_msg: req.flash("success_msg"),
                                    error_msg: req.flash("error_msg"),
                                });
                            },
                        );
                    },
                );
            },
        );
    });
};

controller.limpiarClave = (req, res) => {
    const { id_usuario, Dni } = req.body;
    const login = req.username;
    console.log("ID USUARIO: ", id_usuario);
    console.log("DNI: ", Dni);
    console.log("LOGIN: ", login);
    req.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error de conexión");
        }
        bcrypt.hash(Dni, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error al encriptar");
            }
            // 1️⃣ Obtener usuario actual
            conn.query("SELECT * FROM pol_usuarios WHERE id_usuario = ?", [id_usuario],
                (err, rows) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Error al obtener usuario");
                    }
                    const usuarioActual = rows[0];

                    conn.query(`UPDATE pol_usuarios SET Contrasenia = ?, debeCambiarClave = 1 WHERE id_usuario = ?`, [hashedPassword, id_usuario], (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send("Error al actualizar clave");
                        }
                        // 2️⃣ Guardar historial
                        conn.query(`INSERT INTO pol_usuarios_historial (id_usuario, accion, datos_anteriores, datos_nuevos, usuario_modifica) VALUES (?, 'RESET_PASSWORD', ?, ?, ?)`,
                            [
                                id_usuario,
                                JSON.stringify({ Contrasenia: usuarioActual.Contrasenia }),
                                JSON.stringify({ Contrasenia: hashedPassword }),
                                login,
                            ],
                            (err) => {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).send("Error al guardar historial");
                                }
                                req.flash("success_msg", "Clave reestablecida con éxito.");
                                res.redirect("/usuarios");
                            },
                        );
                    });
                },
            );
        });
    });
};

controller.nuevoUsuario = (req, res) => {
    req.getConnection((err) => {
        if (err) {
            return res.json(err);
        }
        res.render("agregar_usuario", {});
    });
};

controller.verificarUsuario = (req, res) => {
    const dni = req.params.dni;

    const sql = "SELECT id_Usuario FROM pol_usuarios WHERE Usuario = ? LIMIT 1";

    req.getConnection((err, conn) => {
        conn.query(sql, [dni], (err, results) => {
            if (err) {
                console.error("Error al verificar usuario:", err);
                return res.status(500).json({ error: true });
            }

            if (results.length > 0) {
                return res.json({ existe: true });
            } else {
                return res.json({ existe: false });
            }
        });
    });
};

controller.guardarUsuario = async (req, res) => {
    const login = req.session.username;
    const { Dni, Apellido, Nombre, Email, Telefono, Usuario, Clave, Fecha_baja } = req.body;
    const claveHash = await bcrypt.hash(Clave, 10);
    let Alta_autoriza = login;
    const now = new Date();
    const mysqlDateTime = now.toISOString().slice(0, 19).replace("T", " ");
    req.getConnection(async (err, conn) => {
        if (err) {
            console.error("Error de conexion: ", err);
            return res.status(500).send("Error al conectar con la base de datos!");
        }
        if (!/^\d{8}$/.test(req.body.Dni)) {
            return res.status(400).send("DNI inválido");
        }
        let Fecha_alta = mysqlDateTime;
        const usuarioPersonal = {Dni, Apellido, Nombre, Alta_autoriza};
        conn.query("INSERT INTO pol_persona SET ?", usuarioPersonal, (err, resultado) => {
                if (err) {
                    console.error("Error al insertar persona", err);
                    return resultado.status(500).send("Error al guardar datos personales");
                }
                const id_Persona = resultado.insertId;
                let Contrasenia = claveHash;
                let Estado = null;
                Estado = 1;
                const seed = Math.random().toString(36).substring(7);
                const Avatar_url = `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`;
                const usuarioData = {id_Persona, Usuario, Contrasenia, Email, Telefono, Estado, Fecha_baja, Alta_autoriza, Avatar_url };
                conn.query("INSERT INTO pol_usuarios SET  ?", usuarioData, async (err, resultado) => {
                        if (err) {
                            console.error("Error al insertar nuevo usuario", err);
                            return resultado.status(500).send("Error al guardar nuevo usuario");
                        }
                        const id_usuario = resultado.insertId;
                        // 2. Guardar historial
                        // 🔹 Insertar historial correctamente
                        const historialData = {id_usuario, accion: "CREACION", datos_nuevos: JSON.stringify(usuarioData), usuario_modifica: login};
                        conn.query("INSERT INTO pol_usuarios_historial SET ?", historialData, (err) => {
                                if (err) {
                                    console.error("Error historial:", err);
                                    return res.status(500).send("Error historial");
                                }
                                // continuar flujo acá
                            },
                        );

                        // 3. Luego hacer UPDATE real

                        const id_rol = 4;
                        const permiso_principal = "SIN PERMISOS";
                        const perfilData = {id_usuario, id_Persona, Estado, Alta_autoriza, id_rol, permiso_principal};
                        conn.query("INSERT INTO pol_usuarioperfiles SET ?", perfilData, (err, resultado) => {
                                if (err) {
                                    console.error("Error al insertar perfil", err);
                                    return resultado.status(500).send("Error al guardar nuevo perfil");
                                }
                                res.redirect("/usuarios");
                            },
                        );
                    },
                );
            },
        );
    });
};

controller.modificarUsuario = (req, res) => {
    const id = req.params.id;
    req.getConnection((err, conn) => {
        if (err) {
            return res.json(err);
        }
        conn.query(
            "SELECT * FROM pol_unidades WHERE id_unidades >= 99",
            (err, unidades) => {
                if (err) {
                    return res.json(err);
                }
                conn.query(
                    "SELECT id_usuario, pol_persona.id_Persona, Usuario, Contrasenia, Email, Apellido, Nombre, Dni, Telefono, Fecha_baja, permiso_principal AS Permiso, nombre_rol FROM pol_persona INNER JOIN pol_usuarios using(id_persona) INNER JOIN pol_usuarioperfiles using(id_usuario) INNER JOIN pol_roles USING(id_rol) WHERE id_usuario = ?",
                    [id],
                    (err, usuarios) => {
                        if (err) {
                            return res.json(err);
                        }
                        res.render("modificar_usuario", {
                            unidades: unidades,
                            usuarios: usuarios[0],
                        });
                    },
                );
            },
        );
    });
};

controller.actualizarUsuario = (req, res) => {
    const id = req.params.id;
    const login = req.session.username;
    const {id_Persona, Dni, Apellido, Nombre, Email, Telefono, Usuario, Fecha_baja, } = req.body;
    let Modifica_autoriza = login;
    let Alta_autoriza = login;
    const now = new Date();
    const mysqlDateTime = now.toISOString().slice(0, 19).replace("T", " ");
    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexion: ", err);
            return res.status(500).send("Error al conectar con la base de datos!");
        }
        // 1️⃣ Obtener usuario actual
        conn.query("SELECT * FROM pol_usuarios WHERE id_usuario = ?", [id], (err, rows) => {
                if (err) {
                    console.error("Error al obtener usuario:", err);
                    return res.status(500).send("Error al obtener usuario");
                }
                function formatearFecha(fecha) {
                    return fecha ? fecha.toISOString().slice(0, 10) : null;
                }

                const usuarioActual = rows[0];

                usuarioActual.Fecha_Baja = formatearFecha(usuarioActual.Fecha_Baja);
                usuarioActual.Fecha_alta = formatearFecha(usuarioActual.Fecha_alta);
                const id_persona = usuarioActual.id_Persona;
                const datosActualizados = {Dni,Apellido, Nombre, Usuario, Email, Fecha_baja, Telefono};

                // 2️⃣ Guardar historial
                conn.query(`INSERT INTO pol_usuarios_historial (id_usuario, accion, datos_anteriores, datos_nuevos, usuario_modifica) VALUES (?, 'ACTUALIZACION', ?, ?, ?)`,
                    [
                        id,
                        JSON.stringify(usuarioActual),
                        JSON.stringify(datosActualizados),
                        Alta_autoriza,
                    ],
                    (err) => {
                        if (err) {
                            console.error("Error al guardar historial:", err);
                            return res.status(500).send("Error al guardar historial");
                        }
                        const datosPersonales = {Dni, Apellido, Nombre,Modifica_autoriza};

                        // 3️⃣ Actualizar persona
                        conn.query("UPDATE pol_persona SET ? WHERE id_persona = ?", [datosPersonales, id_persona], (err) => {
                                if (err) {
                                    console.error("Error al actualizar persona", err);
                                    return res.status(500).send("Error al actualizar datos personales");
                                }
                                // 4️⃣ Actualizar usuario
                                conn.query(`UPDATE pol_usuarios SET Estado = ?, Usuario = ?, Email = ?, Fecha_Baja = ?, Telefono = ? WHERE id_Persona = ?`, [1, Usuario, Email, Fecha_baja, Telefono, id_Persona], (err) => {
                                        if (err) {
                                            console.error("ERROR SQL:", err.sqlMessage);
                                            return res.status(500).send("Error SQL");
                                        }
                                        res.redirect("/usuarios");
                                    },
                                );
                            },
                        );
                    },
                );
            },
        );
    });
};

controller.accesoUsuario = (req, res) => {
    const id = req.params.id;

    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión", err);
            return res.status(500).send("ERROR DE CONEXIÓN");
        }

        // 🔹 Traer roles
        conn.query(
            "SELECT * FROM pol_roles WHERE Nombre_rol != ? ORDER BY id_rol ",
            ["SIN PERFIL"],
            (err, roles) => {
                if (err) return res.json(err);

                conn.query(
                    "SELECT * FROM pol_unidades WHERE id_unidades >= 99 OR id_unidades = 90",
                    (err, unidades) => {
                        if (err) return res.json(err);

                        conn.query(
                            "SELECT * FROM pol_usuariounidades INNER JOIN pol_unidades USING(id_Unidades) WHERE id_usuario = ? AND pol_usuariounidades.Estado = 1",
                            [id],
                            (err, dependencias) => {
                                if (err) return res.json(err);

                                conn.query(
                                    `SELECT id_usuario, pol_persona.id_Persona as id_Persona, Usuario, Email, Apellido, Nombre, Dni, id_rol, permiso_principal AS Permiso, nombre_rol FROM pol_persona INNER JOIN pol_usuarios using(id_persona) LEFT JOIN pol_usuarioperfiles using(id_usuario) INNER JOIN pol_roles USING(id_rol) WHERE id_usuario = ?`,
                                    [id],
                                    (err, usuarios) => {
                                        if (err) return res.json(err);
                                        res.render("acceso_usuario", {
                                            unidades: unidades,
                                            dependencias: dependencias,
                                            usuarios: usuarios[0],
                                            roles: roles,
                                        });
                                    },
                                );
                            },
                        );
                    },
                );
            },
        );
    });
};

controller.guardarAcceso = (req, res) => {
    const idUsuario = req.body.id_usuario;
    const id_Persona = req.body.id_Persona;
    const idRol = parseInt(req.body.id_rol);
    const permisoPrincipal = req.body.permiso_principal;
    const login = req.session.username;

    const D5_ADMIN_ID = 90;
    const D5_ID = 99;

    let nuevas = req.body.dependencias || [];
    nuevas = Array.isArray(nuevas) ? nuevas : [nuevas];

    // 🔐 Forzar unidad según rol
    if (idRol === 1) nuevas = [D5_ADMIN_ID];
    if (idRol === 2) nuevas = [D5_ID];

    console.log("ROL SELECCIONADO:", idRol);
    console.log("nuevas dependencias:", nuevas);

    if (idRol === 3 && nuevas.length === 0) {
        return res.status(400).send("Un usuario debe tener al menos una dependencia asignada");
    }

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send("Error conexión");

        conn.beginTransaction((err) => {
            if (err) return res.status(500).send("Error transacción");

            conn.query(`SELECT * FROM pol_usuariounidades WHERE id_usuario = ?`, [idUsuario],(err, rows) => {
                    if (err)
                        return conn.rollback(() =>
                            res.status(500).send("Error obteniendo unidades actuales"),
                        );

                    let encontrado = null;

                    if (rows.length > 0) {
                        encontrado = true;
                    } else {
                        encontrado = false;
                    }

                    if (encontrado) {
                        conn.query(`SELECT id_Unidades FROM pol_usuariounidades WHERE id_usuario = ? AND Estado = 1`, [idUsuario], (err, actuales) => {
                                if (err)
                                    return conn.rollback(() =>
                                        res.status(500).send("Error obteniendo unidades actuales"),
                                    );

                                const actualesIds = actuales.map((u) => u.id_Unidades);

                                console.log("ACTUALES:", actualesIds);
                                console.log("NUEVAS:", nuevas);

                                // 🔴 1️⃣ Desactivar solo las que ya no están seleccionadas
                                const aDesactivar = actualesIds.filter(
                                    (id) => !nuevas.includes(id),
                                );

                                if (aDesactivar.length > 0) {
                                    conn.query(`UPDATE pol_usuariounidades SET Estado = 0 WHERE id_usuario = ? AND id_Unidades IN (?)`, [idUsuario, aDesactivar], (err) => {
                                            if (err)
                                                return conn.rollback(() =>
                                                    res.status(500).send("Error desactivando unidades"),
                                                );
                                            insertarOReactivar();
                                        },
                                    );
                                } else {
                                    insertarOReactivar();
                                }

                                function insertarOReactivar() {
                                    if (nuevas.length === 0) return actualizarPerfil();

                                    const valores = nuevas.map((idUnidad) => [ idUsuario, id_Persona, idUnidad, login, 1,new Date()]);

                                    console.log("VALORES A INSERTAR:", valores);

                                    conn.query(`INSERT INTO pol_usuariounidades (id_usuario, id_Persona, id_Unidades, Alta_Autoriza, Estado, Fecha_alta) VALUES ? ON DUPLICATE KEY UPDATE 
                                    Estado = 1, Modifica_autoriza = VALUES(Alta_Autoriza)`, [valores], (err) => {
                                            if (err)
                                                return conn.rollback(() =>
                                                    res.status(500).send("Error insertando/reactivando unidades"),
                                                );
                                            actualizarPerfil();
                                        },
                                    );
                                }
                            },
                        );
                    } else {
                        console.log("ENTRA POR EL FALSO");

                        // 2️⃣ Insertar / Reactivar unidades finales
                        const valores = nuevas.map((idUnidad) => [
                            idUsuario,
                            id_Persona,
                            idUnidad,
                            login,
                            1,
                            new Date(),
                        ]);

                        console.log("VALORES UNIDADES: ", valores);

                        if (valores.length === 0) return actualizarPerfil();

                        conn.query(`INSERT INTO pol_usuariounidades (id_usuario, id_Persona, id_Unidades, Alta_Autoriza, Estado, Fecha_alta) VALUES ? ON DUPLICATE KEY UPDATE Estado = 1, Modifica_autoriza = VALUES(Alta_Autoriza)`, [valores], (err) => {
                                if (err)
                                    return conn.rollback(() =>
                                        res.status(500).send("Error insertando unidades"),
                                    );
                                actualizarPerfil();
                            },
                        );
                    }
                },
            );

            function actualizarPerfil() {
                console.log("ID ROL: ", idRol);
                console.log("PERMISO PRINCIPAL: ", permisoPrincipal);
                console.log("ID USUARIO: ", idUsuario);
                conn.query(`UPDATE pol_usuarioperfiles SET id_rol = ?, permiso_principal = ? WHERE id_usuario = ?`, [idRol, permisoPrincipal, idUsuario], (err) => {
                        if (err)
                            return conn.rollback(() =>
                                res.status(500).send("Error actualizando perfil"),
                            );
                        guardarHistorial();
                    },
                );
            }

            function guardarHistorial() {
                const datosNuevos = {
                    id_rol: idRol,
                    permiso_principal: permisoPrincipal,
                    unidades: nuevas,
                };

                console.log("DATOS NUEVOS: ", datosNuevos);
                console.log("LOGIN: ", login);
                console.log("ID USUARIO: ", idUsuario);

                conn.query(`INSERT INTO pol_usuarios_historial (id_usuario, accion, datos_nuevos, usuario_modifica) VALUES (?, 'CAMBIO_ACCESO', ?, ?)`, [idUsuario, JSON.stringify(datosNuevos), login], (err) => {
                        if (err)
                            return conn.rollback(() =>
                                res.status(500).send("Error guardando historial"),
                            );

                        conn.commit((err) => {
                            if (err)
                                return conn.rollback(() =>
                                    res.status(500).send("Error commit"),
                                );
                            return res.redirect("/usuarios?success=acceso_actualizado");
                        });
                    },
                );
            }
        });
    });
};

controller.cambiarClave = async (req, res) => {
    const id = req.params.id;
    const login = req.session.username
    const { contrasenia, nuevaContrasenia, confirmaContrasenia } = req.body;
    console.log("ENTRA AL CONTROLADOR CAMBIO CLAVE  ");

    req.getConnection(async (err, conn) => {
        if (err) return res.redirect(`/inicio?error=conexion`);

        try {
            const [rows] = await conn.promise().query("SELECT * FROM pol_usuarios WHERE id_usuario = ?", [id]);
            if (rows.length === 0) {
                return res.redirect(`/inicio?error=usuario_no_encontrado`);
            }
            console.log("PASA EL PRIMER IF");
            const usuario = rows[0];
            const coincide = await bcrypt.compare(contrasenia, usuario.Contrasenia);
            if (!coincide) {
                return res.redirect(`/inicio?error=contrasenia_incorrecta`);
            }
            console.log("PASA EL SEGUNDO IF");
            if (nuevaContrasenia !== confirmaContrasenia) {
                return res.redirect(`/inicio?error=no_coinciden`);
            }
            console.log("PASA EL TERCER IF");
            if (nuevaContrasenia === usuario.Usuario) {
                return res.status(400).json({ error: "La clave no puede ser igual al usuario" });
            }
            console.log("PASA EL CUARTO IF");
            const claveHash = await bcrypt.hash(nuevaContrasenia, 10);
            await conn.promise().query(`INSERT INTO pol_usuarios_historial (id_usuario, accion, datos_anteriores, datos_nuevos, usuario_modifica) VALUES (?, 'CAMBIO_PASSWORD', ?, ?, ?)`,[id, JSON.stringify(usuario), JSON.stringify({ Contrasenia: claveHash }), login]);
            console.log("HASH: ", claveHash);
            console.log("LOGIN: ", login);
            console.log("id: ", id);
            await conn.promise().query("UPDATE pol_usuarios SET Contrasenia = ?, Modifica_autoriza = ?, debeCambiarClave = 0 WHERE id_usuario = ?", [claveHash, login, id]);
            // 🔴 DESACTIVAR OBLIGATORIEDAD
            req.session.forzarCambioClave = false;
            res.redirect(`/inicio?msg=cambio_clave_ok`);
        } catch (error) {
            console.error(error);
            return res.redirect(`/inicio?error=general`);
        }
    });
};

controller.listarDetenidos = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.json(err);

        const perfil = req.session && req.session.nombre_rol;
        const userId = req.session && req.session.userId;

        // 🔹 Base SIN ORDER BY
        const baseSql = `SELECT DISTINCT il.id_InternoLegajo, p.Apellido AS APELLIDO, p.Nombre AS NOMBRE, p.Dni AS DNI, p.sexo AS SEXO, p.Fecha_nacimiento AS FECHA_NACIMIENTO, p.Domicilio AS DOMICILIO, ip.id_InternoProntuario, im.Unidad_Destino, im.Unidad_Alojado, ua.Detalle AS detalle_destino, lo.Nombre AS LOCALIDAD, pr.Nombre AS PROVINCIA, il.Estado, f.frente, im.Detalle, COALESCE(c.cantidad_causas,0) AS cantidad_causas, COALESCE(nt.traslado_pendiente, 0) AS traslado_pendiente, pol_notificaciones.Unidad_Destino AS traslado_destino FROM pol_internolegajo il INNER JOIN pol_persona p ON p.id_Persona = il.id_Persona INNER JOIN (SELECT * FROM pol_internomovimiento m WHERE m.id_InternoMovimiento IN (SELECT MAX(id_InternoMovimiento) FROM pol_internomovimiento GROUP BY id_InternoLegajo)) im ON im.id_InternoLegajo = il.id_InternoLegajo INNER JOIN pol_unidades ua ON ua.id_Unidades = im.Unidad_Destino LEFT JOIN (SELECT * FROM pol_internoprontuario pr WHERE pr.id_InternoProntuario IN (SELECT MAX(id_InternoProntuario) FROM pol_internoprontuario GROUP BY id_InternoLegajo)) ip ON ip.id_InternoLegajo = il.id_InternoLegajo LEFT JOIN pol_internofotos f ON f.id_InternoLegajo = il.id_InternoLegajo LEFT JOIN (SELECT id_InternoLegajo, COUNT(*) AS cantidad_causas FROM pol_internoprontuario WHERE Estado != 0 AND Estado != 1 GROUP BY id_InternoLegajo) c ON c.id_InternoLegajo = il.id_InternoLegajo INNER JOIN pol_localidad lo ON lo.id_localidad = p.id_localidad INNER JOIN pol_provincia pr ON pr.id_provincia = p.id_provincia LEFT JOIN (SELECT id_InternoLegajo, COUNT(*) as traslado_pendiente FROM pol_notificaciones WHERE Tipo_Notificacion = 'TRASLADO' AND Estado = 'pendiente' GROUP BY id_InternoLegajo) nt ON nt.id_InternoLegajo = il.id_InternoLegajo LEFT JOIN pol_notificaciones ON pol_notificaciones.id_InternoLegajo = il.id_InternoLegajo WHERE il.Estado <> 0 AND im.Unidad_Destino != 50`;

        const orderBy = ` ORDER BY p.Apellido, p.Nombre`;

        const renderResult = (detenidos) => {
            conn.query("SELECT * FROM pol_unidades WHERE id_Unidades > 99", (err, unidades) => {
                    if (err) return res.json(err);
                    res.render("detenidos", {
                        detenidos,
                        session: req.session,
                        unidades,
                    });
                }
            );
        };

        // 🔹 ADMIN y GENERAL → ven todo
        if (perfil === "ADMINISTRADOR" || perfil === "USUARIO GENERAL" || perfil == "SUPERADMIN") {
            const sql = baseSql + orderBy;

            conn.query(sql, (err, detenidos) => {
                if (err) return res.json(err);
                return renderResult(detenidos);
            });

            return;
        }

        // 🔹 Si no hay usuario en sesión
        if (!userId) {
            return renderResult([]);
        }

        // 🔹 Obtener unidades asignadas al usuario
        conn.query("SELECT id_Unidades FROM pol_usuariounidades WHERE id_usuario = ? AND Estado = 1", [userId], (err, rows) => {
                if (err) return res.json(err);
                const unidadesAsignadas = rows.map(r => r.id_Unidades).filter(Boolean);

                if (unidadesAsignadas.length === 0) {
                    return renderResult([]);
                }

                // 🔹 Filtrar por Unidad_Alojado
                const sql = baseSql + " AND im.Unidad_Destino IN (?)" + orderBy;

                conn.query(sql, [unidadesAsignadas], (err, detenidos) => {
                    if (err) return res.json(err);
                    return renderResult(detenidos);
                });
            }
        );
    });
};

controller.nuevoDetenido = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query("SET NAMES utf8mb4");
        if (err) {
            return res.json(err);
        }
        conn.query(
            "SELECT * FROM pol_autoridadjudicial order by descripcion",
            (err, autoridades) => {
                if (err) {
                    return res.json(err);
                }
                conn.query(
                    "SELECT * FROM pol_unidades WHERE id_Unidades > 99 order by Detalle",
                    (err, unidades) => {
                        if (err) {
                            return res.json(err);
                        }
                        conn.query("SET NAMES utf8mb4");
                        conn.query("SELECT * FROM pol_localidad ", (err, localidades) => {
                            if (err) {
                                return res.json(err);
                            }
                            console.log(localidades);
                            conn.query("SELECT * FROM pol_provincia", (err, provincia) => {
                                if (err) {
                                    return res.json(err);
                                }
                                console.log(provincia)
                                res.render("agregar_detenido", {
                                    autoridades: autoridades,
                                    unidades: unidades,
                                    localidades: localidades,
                                    provincia: provincia,
                                });
                            });
                        });
                    },
                );
            },
        );
    });
};

controller.guardarDetenido = (req, res) => {
    const Alta_autoriza = req.session.username;
    const login = Alta_autoriza;
    let { Nombre, Apellido, Dni, Sexo, Fecha_nacimiento, Domicilio, Personal_fuerza, Oficio_Numero, Oficio_Fecha, Causa, Fecha_cumple_condena, Apellido_victima, Nombre_victima, Situacion_procesal, id_localidad, id_provincia, id_autoridad_judicial, id_comisaria_dependiente, id_comisaria_alojamiento, Detalle, Fecha_Detencion,} = req.body;
    console.log("REQ", req.body);
    const now = new Date();
    const mysqlDateTime = now.toISOString().slice(0, 19).replace("T", " ");
    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexion: ", err);
            return res.status(500).send("Error al conectar con la base de datos!");
        }
        conn.query("SELECT * FROM pol_persona pp INNER JOIN pol_internolegajo il USING(id_persona) WHERE pp.Dni = ?", [Dni], (err, results) => {
        if (results.length > 0) {
            return res.redirect('/detenidos?error=existe');
        }
        const datosPersonales = {Nombre, Apellido, Dni, Sexo, Fecha_nacimiento, Domicilio, id_localidad, id_provincia, Alta_autoriza };
        conn.query("INSERT INTO pol_persona SET ?", [datosPersonales], (err, resultado) => {
                if (err) {
                    console.error("Error al insertar nueva persona", err);
                    return resultado.render(500).send("Error al guardar datos personales");
                }
                const id_Persona = resultado.insertId;
                let Estado = null;
                Estado = 1;
                const datosDetenido = {id_Persona, Estado, Personal_fuerza, Alta_autoriza};
                conn.query("INSERT INTO pol_internolegajo SET ?", [datosDetenido],(err, resultado) => {
                        if (err) {
                            console.error("Error al insertar nuevo detenido", err);
                            return resultado.render(500).send("Error al guardar nuevo detenido");
                        }
                        let id_InternoLegajo = resultado.insertId;
                        let id_autoridadjudicial = id_autoridad_judicial;
                        let Unidad_alojado = id_comisaria_alojamiento;
                        let Unidad_Destino = id_comisaria_alojamiento;
                        let Unidad_dependencia = id_comisaria_dependiente;
                        let Victima = Apellido_victima + " " + Nombre_victima;
                        let Fecha_Hecho = mysqlDateTime;
                        Fecha_cumple_condena = Fecha_cumple_condena || null;
                        Estado = 2
                        const datosProntuario = {id_InternoLegajo, Oficio_Numero, Oficio_Fecha, Causa, Victima, Unidad_dependencia, Fecha_Hecho, Fecha_Detencion, Situacion_procesal, Fecha_cumple_condena, id_autoridadjudicial, Alta_autoriza, Estado, Observaciones: Detalle};
                        conn.query("INSERT INTO pol_internoprontuario SET ?", [datosProntuario], (err, resultado) => {
                                if (err) {
                                    console.error("Error al insertar nuevo prontuario", err);
                                    return resultado.render(500).send("Error al guardar nuevo prontuario");
                                }
                                const id_InternoProntuario = resultado.insertId;
                                const Tipo_Movimiento = "INGRESO";
                                Estado = 1;
                                let usuario = Alta_autoriza;
                                let DetalleMovimiento = Detalle;
                                    conn.query("INSERT INTO pol_internoprontuario_historial (id_InternoLegajo, id_InternoProntuario, accion, datos_nuevos, usuario_modifica) VALUES (?, ?, ?, ?, ?)", [id_InternoLegajo, id_InternoProntuario, 'CREACION', JSON.stringify(datosProntuario), Alta_autoriza], (err) => {
                                        if (err) 
                                        {
                                            console.error("Error al insertar en prontuario historial", err);
                                            return resultado.render(500).send("Error al guardar en prontuario historial");
                                        }
                                        conn.query("INSERT INTO pol_internomovimiento (id_InternoLegajo, id_InternoProntuario, Unidad_Alojado, Unidad_Destino, Tipo_Movimiento, Detalle, Usuario) VALUES (?, ?, ?, ?,'INGRESO',?,?)", [id_InternoLegajo, id_InternoProntuario, Unidad_alojado, Unidad_Destino, JSON.stringify(DetalleMovimiento), usuario ], (err, result) => {
                                                if (err) {
                                                    console.error("Error al insertar nuevo movimiento", err);
                                                    return resultado.render(500).send("Error al guardar nuevo movimiento");
                                                }
                                                res.redirect("/detenidos?msg=detenido_registrado");
                                            },
                                        );
                                    });
                                },
                            );
                        },
                    );
                },
            );
        });
    });
};

controller.modificarDetenido = (req, res) => {
    const id = req.params.id;
    console.log("ID DETENIDO: ", id);
    req.getConnection((err, conn) => {
        if (err) {
            return res.json(err);
        }
        conn.query("SET NAMES utf8mb4");
        conn.query("SELECT * FROM pol_localidad", (err, localidades) => {
            if (err) {
                return res.json(err);
            }
            conn.query("SELECT * FROM pol_provincia", (err, provincia) => {
                if (err) {
                    return res.json(err);
                }
                conn.query("SELECT pol_internolegajo.id_InternoLegajo, pol_internoLegajo.Personal_Fuerza AS Personal_Fuerza, pol_persona.id_Persona AS IdPersona, pol_persona.Apellido AS Apellido, pol_persona.Nombre AS Nombre, pol_persona.Dni AS Dni, pol_persona.Sexo AS Sexo, pol_persona.Fecha_nacimiento AS Fecha_nacimiento, pol_persona.Domicilio AS Domicilio, localidad.nombre AS Localidad, localidad.id_localidad AS id_localidad, provincia.Nombre AS Provincia, provincia.id_provincia AS id_provincia FROM pol_internoLegajo INNER JOIN pol_persona USING(id_persona) INNER JOIN pol_localidad AS localidad ON localidad.id_localidad = pol_persona.id_localidad INNER JOIN pol_provincia AS provincia ON provincia.id_provincia = localidad.id_provincia WHERE id_internoLegajo = ?", [id],
                    (err, detenidos) => {
                        if (err) {
                            return res.json(err);
                        }
                        if (detenidos[0].Fecha_nacimiento) {
                            const fecha = new Date(detenidos[0].Fecha_nacimiento);
                            detenidos[0].Fecha_nacimiento = fecha.toISOString().split("T")[0];
                        }
                        res.render("modificar_detenido", {
                            localidades: localidades,
                            provincia: provincia,
                            detenidos: detenidos[0],
                        });
                    },
                );
            });
        });
    });
};

controller.actualizarDetenido = (req, res) => {
    const login = req.username;
    const {id_Persona, id_InternoLegajo, Nombre, Apellido, Dni, Sexo, Fecha_nacimiento, Domicilio, id_localidad, id_provincia } = req.body;
    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexion: ", err);
            return res.status(500).send("Error al conectar con la base de datos!");
        }

        // 1️⃣ TRAER DATOS ACTUALES
        conn.query("SELECT * FROM pol_persona WHERE id_Persona = ?", [id_Persona], (err, rows) => {
                if (err) {
                    console.error("Error al obtener datos actuales", err);
                    return res.status(500).send("Error al obtener datos actuales");
                }

                const actual = rows[0];
                const historial = [];

                // 2️⃣ COMPARAR CAMPOS

                if (actual.Nombre !== Nombre) {
                    historial.push({
                        id_InternoLegajo,
                        campo: "Nombre",
                        valor_anterior: actual.Nombre,
                        valor_nuevo: Nombre,
                        usuario: login,
                    });
                }

                if (actual.Apellido !== Apellido) {
                    historial.push({
                        id_InternoLegajo,
                        campo: "Apellido",
                        valor_anterior: actual.Apellido,
                        valor_nuevo: Apellido,
                        usuario: login,
                    });
                }

                if (actual.Domicilio !== Domicilio) {
                    historial.push({
                        id_InternoLegajo,
                        campo: "Domicilio",
                        valor_anterior: actual.Domicilio,
                        valor_nuevo: Domicilio,
                        usuario: login,
                    });
                }

                if (actual.id_localidad != id_localidad) {
                    historial.push({
                        id_InternoLegajo,
                        campo: "Localidad",
                        valor_anterior: actual.id_localidad,
                        valor_nuevo: id_localidad,
                        usuario: login,
                    });
                }

                // 3️⃣ INSERTAR HISTORIAL
                if (historial.length > 0) {
                    conn.query("INSERT INTO pol_internolegajo_historial (id_InternoLegajo,campo,valor_anterior,valor_nuevo,usuario) VALUES ?",
                        [
                            historial.map((h) => [
                                h.id_InternoLegajo,
                                h.campo,
                                h.valor_anterior,
                                h.valor_nuevo,
                                h.usuario,
                            ]),
                        ],
                        (err) => {
                            if (err) {
                                console.error("Error al guardar historial", err);
                            }
                        },
                    );
                }

                // 4️⃣ ACTUALIZAR PERSONA
                const datosPersonales = {
                    Nombre,
                    Apellido,
                    Dni,
                    Sexo,
                    Fecha_nacimiento,
                    Domicilio,
                    id_localidad,
                    id_provincia,
                };

                conn.query("UPDATE pol_persona SET ? WHERE id_Persona = ?",
                    [datosPersonales, id_Persona],
                    (err) => {
                        if (err) {
                            console.error("Error al actualizar persona", err);
                            return res
                                .status(500)
                                .send("Error al actualizar datos personales");
                        }

                        res.redirect("/detenidos");
                    },
                );
            },
        );
    });
};

controller.causaDetenido = (req, res) => {
    const id = req.params.id;

    req.getConnection((err, conn) => {
        if (err) {
            return res.json(err);
        }
        conn.query("SELECT * FROM pol_autoridadjudicial", (err, autoridades) => {
            if (err) {
                return res.json(err);
            }
            conn.query(
                "SELECT * FROM pol_unidades WHERE id_Unidades > 99",
                (err, unidades) => {
                    if (err) {
                        return res.json(err);
                    }
                    conn.query(
                        "SELECT pol_internolegajo.id_InternoLegajo, pol_internolegajo.Estado AS EstadoInterno, pol_persona.id_Persona AS id_Persona, pol_persona.Apellido AS Apellido, pol_persona.Nombre AS Nombre, pol_persona.Dni AS Dni, pol_internoprontuario.*, pol_autoridadjudicial.descripcion AS Aut_judicial, pol_unidades.Detalle AS detalle_alojado, unidades_dependencia.Detalle AS detalle_dependencia, pol_internomovimiento.Detalle AS Detalle FROM pol_internolegajo INNER JOIN pol_persona USING(id_persona)  INNER JOIN pol_internoprontuario ON pol_internolegajo.id_InternoLegajo = pol_internoprontuario.id_InternoLegajo INNER JOIN pol_internomovimiento ON pol_internomovimiento.id_InternoLegajo = pol_internoprontuario.id_InternoLegajo INNER JOIN pol_unidades ON pol_unidades.id_Unidades = pol_internomovimiento.Unidad_alojado INNER JOIN pol_unidades AS unidades_dependencia ON unidades_dependencia.id_Unidades = pol_internoprontuario.Unidad_dependencia INNER JOIN pol_autoridadjudicial ON pol_autoridadjudicial.id_AutoridadJudicial = pol_internoprontuario.id_AutoridadJudicial WHERE pol_internoLegajo.id_InternoLegajo = ? AND (pol_internomovimiento.Tipo_movimiento = 'INGRESO' OR pol_internomovimiento.Tipo_movimiento = 'REINGRESO')  ORDER BY Estado DESC  ",
                        [id],
                        (err, detenidos) => {
                            if (err) {
                                return res.json(err);
                            }
                            conn.query(
                                "SELECT pol_internolegajo.id_InternoLegajo, pol_persona.id_Persona AS id_Persona, pol_persona.Apellido AS Apellido, pol_persona.Nombre AS Nombre, pol_persona.Dni AS Dni FROM pol_internolegajo INNER JOIN pol_persona USING(id_persona) INNER JOIN pol_internoprontuario ON pol_internolegajo.id_InternoLegajo = pol_internoprontuario.id_InternoLegajo WHERE pol_internolegajo.id_InternoLegajo = ? GROUP BY id_InternoLegajo, id_Persona, Apellido, Nombre, Dni",
                                [id],
                                (err, datos) => {
                                    if (err) {
                                        return res.json(err);
                                    }
                                    // Calcular tiempo restante para edición por cada causa (120 segundos desde Fecha_alta)
                                    const now = Date.now();
                                    const perfil = req.session && req.session.nombre_rol;
                                    const isAdmin = perfil === 'ADMINISTRADOR';
                                    const isRestrictedUser = perfil === 'USUARIO GENERAL' || perfil === 'USUARIO';

                                    detenidos = detenidos.map((item) => {
                                        let canEdit = true;

                                        if (item.Estado !== 1) {
                                            canEdit = false;
                                        }

                                        if (!isAdmin && item.Fecha_alta) {
                                            const fechaAltaMs = new Date(item.Fecha_alta).getTime();
                                            if (Date.now() - fechaAltaMs > 120000) {
                                                canEdit = false;
                                            }
                                        }

                                        if (isAdmin) {
                                            canEdit = true;
                                        }

                                        return {
                                            ...item,
                                            canEdit,
                                        };
                                    });

                                    res.render("causa_detenido", {
                                        autoridades: autoridades,
                                        unidades: unidades,
                                        detenidos: detenidos,
                                        datos: datos[0],
                                        nombre_rol: req.session.nombre_rol,
                                    });
                                },
                            );
                        },
                    );
                },
            );
        });
    });
};

controller.guardarCausaDetenido = (req, res) => {
    const id_InternoLegajo = req.params.id;
    const login = req.session.username;
    let { Oficio_Numero, Oficio_Fecha, Causa, id_autoridad_judicial, id_comisaria_dependiente, Situacion_procesal, Fecha_Detencion, Fecha_cumple_condena, Fecha_hecho, Apellido_victima, Nombre_victima, Detalle} = req.body;
    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión", err);
            return res.status(500).send("ERROR DE CONEXIÓN");
        }
        const Victima = Apellido_victima + " " + Nombre_victima;
        let Estado = null;
        Estado = 2;
        Fecha_cumple_condena = Fecha_cumple_condena != "" ? Fecha_cumple_condena : null;
        const datosProntuario = {id_InternoLegajo, Oficio_Numero, Oficio_Fecha, Causa, Victima, Unidad_dependencia: id_comisaria_dependiente, Fecha_Detencion, Fecha_cumple_condena, Fecha_hecho, Situacion_procesal, id_AutoridadJudicial: id_autoridad_judicial, Alta_autoriza: login, Estado, Observaciones: Detalle};
            if (err) {
                console.error("Error al insertar en el historial", err);
            }
            conn.query("INSERT INTO pol_internoprontuario SET ?", [datosProntuario], (err, resultado) => {
                if (err) {
                    console.error("Error al insertar nuevo prontuario", err);
                    return res.status(500).send("Error al guardar nuevo prontuario");
                }
                const id_InternoProntuario = resultado.insertId;
                console.log("CAUSA DETENIDO: ", datosProntuario);
                conn.query("INSERT INTO pol_internoprontuario_historial (id_InternoLegajo, id_InternoProntuario, accion, datos_nuevos, usuario_modifica) VALUES (?, ?, ?, ?, ?)", [id_InternoLegajo, id_InternoProntuario, 'CREACION', JSON.stringify(datosProntuario), login], (err) => {
                    if (err) {
                        console.error("Error al insertar en el historial", err);
                    }
                res.redirect("/detenidos");
            });
        });
    });
};

controller.actualizarCausaDetenido = (req, res) => {
    const login = req.session.username;
    let {id_InternoLegajo, id_internoprontuario, Oficio_Numero, Oficio_Fecha, Causa, id_autoridad_judicial, id_comisaria_dependiente, Situacion_procesal, Fecha_Detencion, Fecha_cumple_condena, Fecha_cumple_condena_disabled1, Fecha_Hecho, Victima, Detalle} = req.body;
    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión", err);
            return res.status(500).send("ERROR DE CONEXIÓN");
        }
        const perfil = req.session && req.session.nombre_rol;
        const isAdmin = perfil === 'ADMINISTRADOR';

        conn.query("SELECT * FROM pol_internoprontuario WHERE id_InternoProntuario = ?", [id_internoprontuario], (err, rows) => {
            if (err) {
                console.error("Error al obtener datos actuales", err);
                return res.status(500).send("Error al obtener datos actuales");
            }
            rows[0].Oficio_Fecha = rows[0].Oficio_Fecha ? new Date(rows[0].Oficio_Fecha).toISOString().slice(0, 10) : null;
            rows[0].Fecha_cumple_condena = rows[0].Fecha_cumple_condena ? new Date(rows[0].Fecha_cumple_condena).toISOString().slice(0, 10) : null;
            rows[0].Fecha_Hecho = rows[0].Fecha_Hecho ? new Date(rows[0].Fecha_Hecho).toISOString().slice(0, 10) : null;
            rows[0].Fecha_Detencion = rows[0].Fecha_Detencion ? new Date(rows[0].Fecha_Detencion).toISOString().slice(0, 10) : null;

            const actual = rows[0];

            if (!isAdmin && actual) {
                const fechaAltaMs = actual.Fecha_alta ? new Date(actual.Fecha_alta).getTime() : null;
                const fechaBase = fechaAltaMs || (actual.Fecha_modifica ? new Date(actual.Fecha_modifica).getTime() : null);
                if (fechaBase && Date.now() - fechaBase > 120000) {
                    console.warn("Intento de actualización fuera de tiempo:", id_internoprontuario);
                    return res.redirect(`/detenidos?msg=causa_edicion_expirada`);
                }
            }
            if (Situacion_procesal == "PROCESADO"){
                Fecha_cumple_condena_disabled1 = null;
            }

            const datosProntuario = {id_InternoLegajo, Oficio_Numero, Oficio_Fecha, Causa, Victima, Fecha_Detencion, Fecha_cumple_condena: Fecha_cumple_condena_disabled1, Fecha_Hecho, Unidad_Dependencia: id_comisaria_dependiente, Situacion_procesal, id_AutoridadJudicial: id_autoridad_judicial, Alta_autoriza: login, Observaciones: Detalle};
            console.log("CAUSA DETENIDO: ", datosProntuario);
            conn.query("INSERT INTO pol_internoprontuario_historial (id_InternoLegajo, id_InternoProntuario, accion, datos_anteriores, datos_nuevos, usuario_modifica) VALUES (?, ?, ?, ?, ?, ?)", [id_InternoLegajo, id_internoprontuario, 'MODIFICACION', JSON.stringify(actual), JSON.stringify(datosProntuario), login], (err) => {
                if (err) {
                    console.error("Error al insertar en el historial", err);
                }
                conn.query("UPDATE pol_internoprontuario SET ? WHERE id_InternoProntuario = ?", [datosProntuario, id_internoprontuario], (err, resultado) => {
                    if (err) {
                        console.error("Error al actualizar prontuario", err);
                        return res.status(500).send("Error al actualizar prontuario");
                    }
                    res.redirect("/detenidos?msg=causa_actualizada");
                });
            });
        });
    });
};

controller.cerrarCausaDetenido = (req, res) => {
    const id_InternoProntuario = req.params.id;
    const login = req.session.username;
    const motivo = req.body.motivo;
    const now = new Date();
    const id_InternoLegajo = req.body.id_InternoLegajo;
    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión", err);
            return res.status(500).send("ERROR DE CONEXIÓN");
        }
        let Estado = 1;
        const tipo = 'CIERRE';
        console.log("VALORES INSERT:", {id_InternoLegajo, id_InternoProntuario, tipo, login, motivo});
        conn.query("INSERT INTO pol_internoprontuario_historial (id_InternoLegajo, id_InternoProntuario, accion, usuario_modifica, Motivo) VALUES (?, ?, ?, ?, ?)", [id_InternoLegajo, id_InternoProntuario, tipo, login, motivo], (err) => {
            if (err) {
                console.error("Error al insertar en el historial", err);
            }
            conn.query("UPDATE pol_internoprontuario SET Estado = ?, Modifica_autoriza = ?, Detalle_Estado = ? WHERE id_InternoProntuario = ?", [Estado, login, motivo, id_InternoProntuario], (err) => {
                if (err) {
                    console.error("Error al anular prontuario", err);
                    return res.status(500).send("Error al anular prontuario");
                }
                res.redirect("/detenidos?msg=causa_cerrada");
                }
            );
        });
    });
};

controller.reabrirCausaDetenido = (req, res) => {
    const id_InternoProntuario = req.params.id;
    const login = req.session.username;
    const motivo = req.body.motivo;
    const id_InternoLegajo = req.body.id_InternoLegajo;
    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión", err);
            return res.status(500).send("ERROR DE CONEXIÓN");
        }
        let Estado = 2;
        const tipo = 'REABRIR';
        console.log("VALORES INSERT:", {id_InternoLegajo, id_InternoProntuario, tipo, login, motivo});
        conn.query("INSERT INTO pol_internoprontuario_historial (id_InternoLegajo, id_InternoProntuario, accion, usuario_modifica, Motivo) VALUES (?, ?, ?, ?, ?)", [id_InternoLegajo, id_InternoProntuario, tipo, login, motivo], (err) => {
            if (err) {
                console.error("Error al insertar en el historial", err);
            }
            
            conn.query("UPDATE pol_internoprontuario SET Modifica_autoriza = ?, Estado = ?, Detalle_Estado = ? WHERE id_InternoProntuario = ?", [login, Estado, motivo, id_InternoProntuario], (err) => {
                    if (err) {
                        console.error("Error al actualizar prontuario", err);
                        return res.status(500).send("Error al actualizar prontuario");
                    }
                    res.redirect("/detenidos?msg=causa_reabierta");
                },
            );
        });
    });
};

controller.anularCausaDetenido = (req, res) => {
    const id_InternoProntuario = req.params.id;
    const login = req.session.username;
    const motivo = req.body.motivo;
    const now = new Date();
    const id_InternoLegajo = req.body.id_InternoLegajo;
    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión", err);
            return res.status(500).send("ERROR DE CONEXIÓN");
        }
        let Estado = 0;
        const tipo = 'ANULACION';
        conn.query("INSERT INTO pol_internoprontuario_historial (id_InternoLegajo, id_InternoProntuario, accion, usuario_modifica, Motivo) VALUES (?, ?, ?, ?, ?)", [id_InternoLegajo, id_InternoProntuario, tipo, login, motivo], (err) => {
            if (err) {
                console.error("Error al insertar en el historial", err);
            }
            conn.query("UPDATE pol_internoprontuario SET Estado = ?, Modifica_autoriza = ?, Detalle_Estado = ? WHERE id_InternoProntuario = ?", [Estado, login, motivo, id_InternoProntuario], (err) => {
                if (err) {
                    console.error("Error al anular prontuario", err);
                    return res.status(500).send("Error al anular prontuario");
                }
                res.redirect("/detenidos?msg=causa_anulada");
            });
        });
    });
}

controller.agregarFoto = (req, res) => {
    const id = req.params.id;
    const login = req.username;
    console.log("username: ", login);
    console.log("ID DETENIDO: ", id);
    req.getConnection((err, conn) => {
        if (err) {
            return res.json(err);
        }
        conn.query("SELECT pol_internolegajo.id_InternoLegajo AS id_InternoLegajo, pol_persona.id_Persona AS id_Persona, pol_persona.Apellido AS Apellido, pol_persona.Nombre AS Nombre, pol_persona.Dni AS Dni, pol_internofotos.frente AS frente, pol_internofotos.espalda AS espalda, pol_internofotos.izquierdo AS izquierdo, pol_internofotos.derecho AS derecho, pol_internofotos.Fecha_alta AS Fecha_alta FROM pol_internolegajo INNER JOIN pol_persona USING(id_persona) LEFT JOIN pol_internofotos USING(id_InternoLegajo) WHERE pol_internolegajo.id_internoLegajo = ?", [id], (err, detenido) => {
                if (err) {
                    return res.json(err);
                }

                const registro = detenido[0] || {};
                const perfil = req.session && req.session.nombre_rol;
                const isAdmin = perfil === 'ADMINISTRADOR';
                const applyTimeRule = !isAdmin; // restringir sólo a usuarios no admin

                let canEditPhotos = true;
                let editTimeRemaining = 0;

                const LIMITE = 24 * 60 * 60 * 1000; // 24 horas

                const fechaAlta = registro.Fecha_alta ? new Date(registro.Fecha_alta).getTime() : null;

                if (applyTimeRule && fechaAlta) {
                    const diffMs = Date.now() - fechaAlta;
                    if (diffMs > LIMITE) {
                        canEditPhotos = false;
                    } else {
                        editTimeRemaining = LIMITE - diffMs;
                    }
                } else {
                    editTimeRemaining = LIMITE;
                }

                res.render("agregar_foto", {
                    detenido: registro,
                    canEditPhotos,
                    editTimeRemaining,
                });
            },
        );
    });
};

controller.guardarFotos = (req, res) => {
    const files = req.files;
    const { id_InternoLegajo, id_Persona, username } = req.body;
    const login = req.session.username;
    console.log("username: ", login);
    console.log("ID DETENIDO: ", id_InternoLegajo, id_Persona);
    const now = new Date();
    const mysqlDateTime = now.toISOString().slice(0, 19).replace("T", " ");

    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión:", err);
            return res.render("agregar_foto", {
                errorMessage: "Error de conexión a la base de datos.",
                detenido: { id_InternoLegajo, id_Persona },
            });
        }

        // 1) Consultar si ya existe registro
        conn.query("SELECT frente, izquierdo, derecho, espalda FROM pol_internofotos WHERE id_InternoLegajo = ?", [id_InternoLegajo], (err, rows) => {
                if (err) {
                    console.error("Error al leer DB:", err);
                    return res.render("agregar_foto", {
                        errorMessage: "Error al leer la base de datos.",
                        detenido: { id_InternoLegajo, id_Persona },
                    });
                }

                const existente = rows[0] || {};

                const perfil = req.session && req.session.nombre_rol;
                const isAdmin = perfil === 'ADMINISTRADOR';
                const LIMITE = 24 * 60 * 60 * 1000;

                // Si ya existe foto y ya pasó el periodo de edición, no permitir cambios.
                if (existente.Fecha_alta) {
                    const diferencia = Date.now() - new Date(existente.Fecha_alta).getTime();
                    if (!isAdmin && diferencia > LIMITE) {
                        return res.render("agregar_foto", {
                            errorMessage: "El periodo de edición de fotos expiró (24 horas).",
                            detenido: { id_InternoLegajo, id_Persona, ...existente },
                        });
                    }
                }

                // Validar: si no hay foto en DB ni archivo nuevo → error
                if (!existente.frente && !files?.frente) {
                    return res.render("agregar_foto", {
                        errorMessage: "Falta foto frente",
                        detenido: { id_InternoLegajo, id_Persona, ...existente },
                    });
                }
                if (!existente.izquierdo && !files?.izquierdo) {
                    return res.render("agregar_foto", {
                        errorMessage: "Falta foto izquierdo",
                        detenido: { id_InternoLegajo, id_Persona },
                    });
                }
                if (!existente.derecho && !files?.derecho) {
                    return res.render("agregar_foto", {
                        errorMessage: "Falta foto derecho",
                        detenido: { id_InternoLegajo, id_Persona },
                    });
                }
                if (!existente.espalda && !files?.espalda) {
                    return res.render("agregar_foto", {
                        errorMessage: "Falta foto espalda",
                        detenido: { id_InternoLegajo, id_Persona },
                    });
                }

                // Definir rutas: si hay nueva foto, usarla; si no, mantener la existente
                const rutaFrente = files?.frente
                    ? "/fotos/" + files.frente[0].filename
                    : existente.frente;
                const rutaIzquierdo = files?.izquierdo
                    ? "/fotos/" + files.izquierdo[0].filename
                    : existente.izquierdo;
                const rutaDerecho = files?.derecho
                    ? "/fotos/" + files.derecho[0].filename
                    : existente.derecho;
                const rutaEspalda = files?.espalda
                    ? "/fotos/" + files.espalda[0].filename
                    : existente.espalda;

                // 2) Decidir si es INSERT o UPDATE
                if (rows.length > 0) {
                    // UPDATE
                    const fechaAltaGuardar = mysqlDateTime;
                    const updateQuery = `UPDATE pol_internofotos SET frente = ?, izquierdo = ?, derecho = ?, espalda = ?, Alta_autoriza = ? WHERE id_InternoLegajo = ?`;
                    conn.query(
                        updateQuery,
                        [
                            rutaFrente,
                            rutaIzquierdo,
                            rutaDerecho,
                            rutaEspalda,
                            login,
                            fechaAltaGuardar,
                            id_InternoLegajo,
                        ],
                        (err, result) => {
                            if (err) {
                                console.error("Error al actualizar en DB:", err);
                                return res.render("agregar_foto", {
                                    errorMessage: "Error al actualizar en la base de datos.",
                                    detenido: { id_InternoLegajo, id_Persona },
                                });
                            }
                            res.redirect("/detenidos?subido=1");
                        },
                    );
                } else {
                    // INSERT
                    const insertQuery = `INSERT INTO pol_internofotos (id_InternoLegajo, frente, izquierdo, derecho, espalda, Alta_autoriza, Fecha_alta)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    conn.query(
                        insertQuery,
                        [
                            id_InternoLegajo,
                            rutaFrente,
                            rutaIzquierdo,
                            rutaDerecho,
                            rutaEspalda,
                            login,
                            mysqlDateTime,
                        ],
                        (err, result) => {
                            if (err) {
                                console.error("Error al insertar en DB:", err);
                                return res.render("agregar_foto", {
                                    errorMessage: "Error al insertar en la base de datos.",
                                    detenido: { id_InternoLegajo, id_Persona },
                                });
                            }
                            res.redirect("/detenidos?subido=1");
                        },
                    );
                }
            },
        );
    });
};

controller.agregarArchivo = (req, res) => {
    const id = req.params.id;
    console.log("ID DETENIDO: ", id);
    req.getConnection((err, conn) => {
        if (err) {
            return res.render("agregar_archivo", {
                errorMessage: "Error de conexión a la base de datos.",
                detenido: null,
                query: req.query,
            });
        }
        conn.query(
            "SELECT pol_internolegajo.id_InternoLegajo AS id_InternoLegajo, pol_persona.id_Persona AS id_Persona, pol_persona.Apellido AS Apellido, pol_persona.Nombre AS Nombre, pol_persona.Dni AS Dni, pol_internoarchivo.Source_Archivo AS Archivo FROM pol_persona JOIN pol_internolegajo USING(id_persona) LEFT JOIN pol_internoarchivo USING(id_InternoLegajo) WHERE pol_internolegajo.id_internoLegajo = ?",
            [id],
            (err, detenido) => {
                if (err) {
                    return res.render("agregar_archivo", {
                        errorMessage: "Error al obtener datos.",
                        detenido: null,
                        query: req.query,
                    });
                }
                conn.query(
                    "SELECT * FROM pol_internoarchivo WHERE id_InternoLegajo = ?",
                    [id],
                    (err, archivosSubidos) => {
                        if (err) {
                            return res.render("agregar_archivo", {
                                errorMessage: "Error al obtener datos.",
                                detenido: null,
                                query: req.query,
                            });
                        }
                        res.render("agregar_archivo", {
                            detenido: detenido[0],
                            archivosSubidos: archivosSubidos,
                            query: req.query,
                        });
                    },
                );
            },
        );
    });
};

controller.guardarArchivo = (req, res) => {
    const files = req.files;
    const { id_InternoLegajo, id_Persona } = req.body;
    const internoId = req.params.id;
    const login = req.session.username;
    const now = new Date();
    const mysqlDateTime = now.toISOString().slice(0, 19).replace("T", " ");

    if (!files || !files.archivo || files.archivo.length === 0) {
        return res.redirect(`/agregar_archivo/${internoId}?error=1`);
    }
    const archivo1 = files.archivo[0].filename;
    const archivoPath = "/archivos/" + files.archivo[0].filename;

    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión:", err);
            return res.redirect(`/agregar_archivo/${internoId}?error=1`);
        }

        const insertQuery = `INSERT INTO pol_internoarchivo (id_InternoLegajo, Tipo, Source_Archivo, Titulo, Alta_autoriza, Fecha_alta) VALUES (?, 'DOCUMENTO', ?, ?, ?, ?)`;
        conn.query(
            insertQuery,
            [
                id_InternoLegajo,
                archivoPath,
                archivo1,
                login,
                mysqlDateTime,
            ],
            (err, result) => {
                if (err) {
                    console.error("Error al insertar en DB:", err);
                    return res.redirect(`/agregar_archivo/${internoId}?error=1`);
                }

                res.redirect(`/agregar_archivo/${internoId}?msg=archivo_subido`);
            },
        );
    });
};

controller.liberarDetenido = (req, res) => {
    const { motivo } = req.body;
    const id = req.params.id;
    console.log("Motivo:", motivo);
    const login = req.session.username;
    console.log("ID DETENIDO: ", id);
    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión:", err);
            return res.redirect(`/detenidos?error=1`);
        }
        conn.query("SELECT pol_internomovimiento.id_InternoMovimiento, pol_internomovimiento.id_InternoProntuario, pol_internomovimiento.Unidad_Destino, pol_internomovimiento.Unidad_Alojado, pol_internolegajo.id_Persona FROM pol_internomovimiento INNER JOIN pol_internolegajo USING(id_InternoLegajo) WHERE pol_internolegajo.id_InternoLegajo = ? ORDER BY id_InternoMovimiento DESC LIMIT 1",[id], (err, rows) => {
                if (err) {
                    console.error("Error al obtener datos:", err);
                    return res.redirect(`/detenidos?error=1`);
                }
                let id_Persona = null;
                let id_InternoProntuario = null;
                let Estado = 0;
                if (rows.length > 0) {
                    id_Persona = rows[0].id_Persona;
                    id_InternoProntuario = rows[0].id_InternoProntuario;
                    Unidad_Destino = rows[0].Unidad_Destino;
                    Unidad_Alojado = rows[0].Unidad_Alojado;
                }
                conn.query("UPDATE pol_internolegajo SET Estado = ?, Modifica_autoriza = ? WHERE id_InternoLegajo = ?", [Estado, login, id], (err, result) => {
                        if (err) {
                            console.error("Error al liberar detenido:", err);
                            return res.redirect(`/detenidos?error=1`);
                        }
                        const updateQuery = "INSERT INTO pol_internomovimiento (id_InternoLegajo, id_InternoProntuario, Unidad_Destino, Unidad_Alojado, Tipo_Movimiento, Detalle, Usuario) VALUES (?, ?, ?, ?, 'EGRESO', ?, ?)";
                        conn.query(updateQuery,
                            [
                                id,
                                id_InternoProntuario,
                                Unidad_Destino,
                                Unidad_Alojado,
                                JSON.stringify(motivo),
                                login
                            ], (err, result) => {
                                if (err) {
                                    console.error("Error al actualizar estado del legajo:", err);
                                    return res.redirect(`/detenidos?error=1`);
                                }
                                res.redirect(`/detenidos?msg=detenido_liberado`);
                            },
                        );
                    },
                );
            },
        );
    });
};

controller.moverDetenido = (req, res) => {
    const id = req.params.id;
    const login = req.session.username;
    let {direccion, Oficio, personalCustodio, observaciones, nuevoAlojamiento, Institucion} = req.body;
    console.log("ID DETENIDO: ", id);
    let Estado = null;
    req.getConnection((err, conn) => {
        if (err) {
            return res.json(err);
        }

        conn.query("SELECT Unidad_alojado FROM pol_internomovimiento WHERE id_InternoLegajo = ? ORDER BY fecha_movimiento DESC LIMIT 1", [id], (err, rows) => {
            if (err) {
                return res.json(err);
            }
            const unidad_alojado = rows[0].Unidad_alojado;
            const detalleMovimiento = {Oficio, Institucion,direccion, personalCustodio, observaciones};
            conn.query("INSERT INTO pol_internomovimiento (id_InternoLegajo, Unidad_Alojado, Unidad_Destino, Tipo_Movimiento, Detalle, Usuario) VALUES (?, ?, ?, 'MOVIMIENTO',?,?)", [id, unidad_alojado, nuevoAlojamiento, JSON.stringify(detalleMovimiento), login], (err, result) => {
                if (err) {
                    return res.json(err);
                }
                res.redirect(`/detenidos?msg=tareaExitosa`);
            });
        });
    });
};

controller.regresarDetenido = (req, res) => {
    const id = req.params.id;
    const login = req.session.username;
    let {unidadAlojado, observaciones} = req.body;
    console.log("ID DETENIDO: ", id);
    let Estado = null;
    req.getConnection((err, conn) => {
        if (err) {
            return res.json(err);
        }

        conn.query("SELECT Unidad_alojado, Detalle FROM pol_internomovimiento WHERE id_InternoLegajo = ? ORDER BY fecha_movimiento DESC LIMIT 1", [id], (err, rows) => {
            if (err) {
                return res.json(err);
            }
            const unidad_alojado = rows[0].Unidad_alojado;
            const Detalle = rows[0].Detalle;
            const detalleMovimiento = {Detalle, observaciones};
            conn.query("INSERT INTO pol_internomovimiento (id_InternoLegajo, Unidad_Alojado, Unidad_Destino, Tipo_Movimiento, Detalle, Usuario) VALUES (?, ?, ?, 'REGRESA A COMISARIA',?,?)", [id, unidadAlojado, unidadAlojado, JSON.stringify(detalleMovimiento), login], (err, result) => {
                if (err) {
                    return res.json(err);
                }
                res.redirect(`/detenidos?msg=tareaExitosa`);
            });
        });
    });
        
}

controller.trasladarDetenido = (req, res) => {
    const id = req.params.id;
    const login = req.session.username;
    let { Movil, personalCustodio, observaciones, id_comisaria_destino } = req.body;

    id_comisaria_destino = parseInt(id_comisaria_destino);

    req.getConnection((err, conn) => {
        if (err) return res.redirect(`/detenidos?error=1`);
        // 🔹 Obtener datos del detenido
        conn.query(`SELECT im.id_InternoMovimiento, il.id_Persona, im.id_InternoProntuario, im.Unidad_Alojado, im.Unidad_Destino FROM pol_internomovimiento im INNER JOIN pol_internolegajo il USING(id_InternoLegajo) WHERE il.id_InternoLegajo = ? ORDER BY id_InternoMovimiento DESC LIMIT 1`, [id], (err, rows) => {

        if (err || !rows.length) {
            console.error(err);
            return res.redirect(`/detenidos?error=1`);
        }

        const movimiento = rows[0];

        // 🔹 Datos para notificación
        conn.query(`SELECT p.Apellido, p.Nombre, p.Dni, u1.Detalle AS unidad_origen, u2.Detalle AS unidad_destino FROM pol_internolegajo il INNER JOIN pol_persona p USING(id_Persona) LEFT JOIN pol_unidades u1 ON u1.id_Unidades = ? LEFT JOIN pol_unidades u2 ON u2.id_Unidades = ? WHERE il.id_InternoLegajo = ?`, [movimiento.Unidad_Alojado, id_comisaria_destino, id], (err, data) => {

            if (err || !data.length) {
            return res.redirect(`/detenidos?error=1`);
            }

            const detenido = data[0];

            // ✅ INSERT ÚNICO
            const notificacion = {
            id_InternoLegajo: id,
            Movil: Movil || "",
            PersonalCustodio: personalCustodio || "",
            Observaciones: observaciones || "",
            Unidad_Origen_Codigo: movimiento.Unidad_Destino,
            Unidad_Destino_Codigo: id_comisaria_destino,
            Apellido_Detenido: detenido.Apellido,
            Nombre_Detenido: detenido.Nombre,
            DNI_Detenido: detenido.Dni,
            Unidad_Origen: detenido.unidad_origen,
            Unidad_Destino: detenido.unidad_destino,
            Usuario_creacion: login,
            Tipo_Notificacion: "TRASLADO",
            Estado: "pendiente",
            id_unidad_destino: id_comisaria_destino
            };

            conn.query("INSERT INTO pol_notificaciones SET ?", notificacion, (err) => {
                if (err) {
                    console.error("Error insertando notificación:", err);
                    return res.redirect(`/detenidos?error=1`);
                }

                res.redirect(`/detenidos?msg=pedido_traslado`);
                });

            });
        });
    });
};

controller.movimientosComisarias = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.json(err);
        conn.query("SELECT im.id_InternoMovimiento, pp.Apellido, pp.Nombre, pp.Dni, im.Tipo_movimiento, pu.Detalle AS Detalle_Alojado, pua.Detalle AS Detalle_Destino, im.Fecha_movimiento, im.Usuario, im.Detalle FROM pol_internomovimiento im INNER JOIN pol_internolegajo il USING(id_InternoLegajo) INNER JOIN pol_persona pp USING(id_persona) INNER JOIN pol_unidades pu ON pu.id_Unidades = im.Unidad_Alojado INNER JOIN pol_unidades pua ON pua.id_Unidades = im.Unidad_Destino ORDER BY im.id_InternoMovimiento ASC",
            (err, rows) => {
                if (err) {
                    console.error("Error al obtener movimientos de comisarias:", err);
                    return res.redirect(`/detenidos?error=1`);
                }
                // 🔹 Formateo de fechas antes de renderizar
                rows.forEach((mov) => {
                    const opciones = {
                        dateStyle: "short",
                        timeStyle: "short",
                        hour12: false, // 🔹 fuerza formato 24 hs
                    };

                    if (mov.Fecha_movimiento instanceof Date) {
                        mov.Fecha_movimiento = mov.Fecha_movimiento.toLocaleString(
                            "es-AR",
                            opciones,
                        );
                    } else {
                        mov.Fecha_movimiento = "";
                    }

                    if (mov.Fecha_alta instanceof Date) {
                        mov.Fecha_alta = mov.Fecha_alta.toLocaleString("es-AR", opciones);
                    } else {
                        mov.Fecha_alta = "";
                    }

                    if (mov.Fecha_modifica instanceof Date) {
                        mov.Fecha_modifica = mov.Fecha_modifica.toLocaleString(
                            "es-AR",
                            opciones,
                        );
                    } else {
                        mov.Fecha_modifica = "";
                    }
                });

                res.render("movimientos_comisarias", { movimientos: rows });
            },
        );
    });
};

controller.exportarMovimientosComisarias = (req, res) => {
    req.getConnection(async (err, conn) => {
        if (err) return res.json(err);

        try {
            // 🔹 MISMA CONSULTA que usás en la vista
            conn.query(`SELECT im.id_InternoMovimiento, pp.Apellido, pp.Nombre, pp.Dni, im.Tipo_movimiento, pu.Detalle AS Detalle_Alojado, pua.Detalle AS Detalle_Destino, im.Fecha_movimiento, im.Usuario, im.Detalle FROM pol_internomovimiento im INNER JOIN pol_internolegajo il USING(id_InternoLegajo) INNER JOIN pol_persona pp USING(id_persona) INNER JOIN pol_unidades pu ON pu.id_Unidades = im.Unidad_Alojado INNER JOIN pol_unidades pua ON pua.id_Unidades = im.Unidad_Destino ORDER BY im.id_InternoMovimiento ASC`,
                async (err, rows) => {
                    if (err) {
                        console.error("Error al obtener movimientos de comisarias:", err);
                        return res.status(500).send("Error al generar el archivo Excel");
                    }

                    // 🔹 Formatear fechas igual que en tu método principal
                    const opciones = {
                        dateStyle: "short",
                        timeStyle: "short",
                        hour12: false,
                    };

                    rows.forEach((mov) => {
                        mov.Fecha_movimiento =
                            mov.Fecha_movimiento instanceof Date
                                ? mov.Fecha_movimiento.toLocaleString("es-AR", opciones)
                                : "";
                    });

                    // 🔹 Crear Excel
                    const workbook = new ExcelJS.Workbook();
                    const worksheet = workbook.addWorksheet("Movimientos Comisarías");

                    // Encabezados
                    worksheet.columns = [
                        { header: "ID", key: "id", width: 8 },
                        { header: "Apellido y Nombre", key: "nombre", width: 25 },
                        { header: "DNI", key: "dni", width: 15 },
                        { header: "Alojamiento", key: "alojado", width: 25 },
                        { header: "Destino", key: "destino", width: 25 },
                        { header: "Fecha Movimiento", key: "fecha_mov", width: 20 },
                        { header: "Tipo Movimiento", key: "tipo", width: 18 },
                        { header: "Usuario Alta", key: "alta_user", width: 20 },
                        { header: "Observaciones", key: "obs", width: 30 },
                    ];

                    // Estilo cabecera
                    worksheet.getRow(1).eachCell((cell) => {
                        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "4472C4" },
                        };
                        cell.alignment = { horizontal: "center", vertical: "middle" };
                        cell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" },
                        };
                    });

                    // Agregar filas
                    rows.forEach((m) => {
                        worksheet.addRow({
                            id: m.id_InternoMovimiento,
                            nombre: `${m.Apellido} ${m.Nombre}`,
                            dni: m.Dni,
                            alojado: m.Detalle_Alojado,
                            destino: m.Detalle_Destino,
                            fecha_mov: m.Fecha_movimiento,
                            tipo: m.Tipo_movimiento,
                            alta_user: m.Usuario,
                            obs: m.Detalle,
                        });
                    });

                    // Configurar headers para descarga
                    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    res.setHeader("Content-Disposition", "attachment; filename=movimientos_comisarias.xlsx");

                    await workbook.xlsx.write(res);
                    res.end();
                },
            );
        } catch (error) {
            console.error("Error al exportar movimientos:", error);
            res.status(500).send("Error al generar el archivo Excel");
        }
    });
};

controller.conexionUsuarios = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.json(err);

        conn.query(
            "SELECT pol_logueo.*, pol_usuarios.Usuario, pol_persona.Apellido, pol_persona.Nombre, pol_persona.Dni, pol_unidades.Detalle, pol_usuarioperfiles.id_rol, pol_roles.Nombre_rol AS Rol FROM pol_logueo INNER JOIN pol_usuarios USING(id_usuario) INNER JOIN pol_persona USING(id_Persona) INNER JOIN pol_usuariounidades USING(id_usuario) INNER JOIN pol_unidades USING(id_Unidades) INNER JOIN pol_usuarioperfiles USING(id_usuario) INNER JOIN pol_roles USING(id_Rol) ORDER BY FechaHoraSesion DESC",
            (err, usuarios) => {
                if (err) {
                    return res.json(err);
                }

                const opciones = {
                    dateStyle: "short",
                    timeStyle: "short",
                    hour12: false,
                };
                usuarios.forEach((mov) => {
                    mov.FechaHoraSesion =
                        mov.FechaHoraSesion instanceof Date
                            ? mov.FechaHoraSesion.toLocaleString("es-AR", opciones)
                            : "";
                });
                res.render("usuarios_conectados", {
                    usuarios: usuarios,
                });
            },
        );
    });
};

// controller.estadisticas = (req, res) => {
//     req.getConnection((err, conn) => {
//         if (err) return res.json(err); // <--- return aquí para salir si error en conexión

//         conn.query("SELECT MONTH(Fecha_alta) AS mes, COUNT(*) AS cantidad FROM pol_internolegajo WHERE YEAR(Fecha_alta) = YEAR(CURDATE()) GROUP BY MONTH(Fecha_alta) ORDER BY mes",
//             (err, resultado) => {
//                 if (err) {
//                     return res.json(err); // <--- return aquí para no continuar si error en query
//                 }

//                 const labels = resultado.map((row) => `MES ${row.mes}`);
//                 const data = resultado.map((row) => row.cantidad);
//                 conn.query("SELECT u.Detalle AS detalle_dependencia, im.Unidad_Destino, COUNT(*) AS cantidad FROM pol_internolegajo il INNER JOIN (SELECT * FROM pol_internomovimiento m WHERE m.id_InternoMovimiento IN (SELECT MAX(id_InternoMovimiento) FROM pol_internomovimiento GROUP BY id_InternoLegajo)) im ON im.id_InternoLegajo = il.id_InternoLegajo INNER JOIN pol_unidades u ON u.id_Unidades = im.Unidad_Destino WHERE il.Estado = 1 AND TIMESTAMPDIFF(DAY, im.Fecha_movimiento, NOW()) <= 6 GROUP BY im.Unidad_Destino, u.Detalle", (err, ingresosUltimos6Dias) => {
//                         if (err) {
//                             return res.json(err);
//                         }
//                         let anioactual = new Date().getFullYear();
//                         conn.query("SELECT u.Detalle AS detalle_dependencia, im.Unidad_Destino, COUNT(*) AS cantidad FROM pol_internolegajo il INNER JOIN (SELECT * FROM pol_internomovimiento m WHERE m.id_InternoMovimiento IN (SELECT MAX(id_InternoMovimiento) FROM pol_internomovimiento GROUP BY id_InternoLegajo)) im ON im.id_InternoLegajo = il.id_InternoLegajo INNER JOIN pol_unidades u ON u.id_Unidades = im.Unidad_Destino WHERE il.Estado = 1 AND YEAR(im.Fecha_movimiento) = YEAR(CURDATE()) GROUP BY im.Unidad_Destino, u.Detalle",
//                             (err, ingresosAnioActual) => {
//                                 if (err) {
//                                     return res.json(err);
//                                 }
//                                 conn.query("SELECT u.Detalle AS detalle_dependencia, im.Unidad_Destino, COUNT(*) AS cantidad FROM pol_internolegajo il INNER JOIN (SELECT * FROM pol_internomovimiento m WHERE m.id_InternoMovimiento IN (SELECT MAX(id_InternoMovimiento) FROM pol_internomovimiento GROUP BY id_InternoLegajo)) im ON im.id_InternoLegajo = il.id_InternoLegajo INNER JOIN pol_unidades u ON u.id_Unidades = im.Unidad_Destino WHERE il.Estado = 1 GROUP BY im.Unidad_Destino, u.Detalle", (err, ingresosTotales) => {
//                                         if (err) {
//                                             return res.json(err);
//                                         }
//                                         return res.render("estadisticas", {
//                                             labels: JSON.stringify(labels),
//                                             data: JSON.stringify(data),
//                                             ingresosUltimos6Dias,
//                                             ingresosAnioActual,
//                                             ingresosTotales,
//                                         });
//                                     },
//                                 );
//                             },
//                         );
//                     },
//                 );
//             },
//         );
//     });
// };

controller.obtenerNotificaciones = (req, res) => {
  const id_usuario = req.user.id;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "Error conexión" });

    conn.query(`SELECT n.*, IF(nu.leida IS NULL, 0, nu.leida) AS leida FROM pol_notificaciones n INNER JOIN pol_usuariounidades uu ON uu.id_Unidades = n.Unidad_Destino_Codigo AND uu.id_usuario = ? AND uu.Estado = 1 LEFT JOIN pol_notificaciones_usuarios nu ON n.id_Notificacion = nu.id_notificacion AND nu.id_usuario = ? WHERE n.Estado = 'pendiente' ORDER BY n.Fecha_Creacion DESC`, [id_usuario, id_usuario], (err, notificaciones) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error consulta" });
      }

      const noLeidas = notificaciones.filter(n => n.leida === 0).length;

      res.json({
        notificaciones,
        total_no_leidas: noLeidas
      });
    });
  });
};

controller.responderNotificacion = (req, res) => {
    const id_Notificacion = req.params.id;
    const { respuesta } = req.body;
    const id_usuario = req.user.id;
    const login = req.username || "sistema";

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: "Error conexión" });
        conn.query(`SELECT * FROM pol_notificaciones WHERE id_Notificacion = ?`, [id_Notificacion], (err, rows) => {
        if (err || !rows.length) {
            return res.status(500).json({ error: "Notificación no encontrada" });
        }
        const notif = rows[0];
        conn.query(`INSERT INTO pol_notificaciones_usuarios (id_notificacion, id_usuario, leida, fecha_lectura) VALUES (?, ?, 1, NOW()) ON DUPLICATE KEY UPDATE leida = 1`, [id_Notificacion, id_usuario]);
        if (respuesta === "aceptada") {
        conn.query(`SELECT Estado FROM pol_notificaciones WHERE id_Notificacion = ?`, [id_Notificacion], (err, result) => {
            if (err || !result.length) {
            return res.status(500).json({ error: "Error verificando estado" });
            }
            const estadoActual = result[0].Estado;
            if (estadoActual === "aceptada") {
            return res.json({
                success: false,
                message: "Esta notificación ya fue procesada por otro usuario"
            });
            }
            const detalle = `Movil: ${notif.Movil}, Personal: ${notif.PersonalCustodio}, Obs: ${notif.Observaciones}`;
            conn.query(`INSERT INTO pol_internomovimiento (id_InternoLegajo, Unidad_Alojado, Unidad_Destino, Tipo_Movimiento, Detalle, Usuario) VALUES (?, ?, ?, 'TRASLADO', ?, ?)`, [
            notif.id_InternoLegajo, notif.Unidad_Origen_Codigo, notif.Unidad_Destino_Codigo, JSON.stringify(detalle), login], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Error traslado" });
                }
                conn.query(`UPDATE pol_notificaciones SET Estado = 'aceptada', Leida = 1 WHERE id_Notificacion = ?`, [id_Notificacion]);
                return res.json({
                    success: true,
                    message: "Traslado aceptado correctamente"
                });
            });
        });
        } else {
            conn.query(`UPDATE pol_notificaciones SET Estado = 'rechazada' WHERE id_Notificacion = ?`, [id_Notificacion]);
            return res.json({ success: true, message: "Notificación rechazada" });
        }

        });
    });
};

controller.buscarInterleg = async (req, res) => {
    try {
        const q = req.query.q;
        console.log("BÚSQUEDA INTERLEG:", q);
        if (!q || q.trim() === "") {
            return res.render("interleg", {
                datosASP: [],
                datosMYSQL: [],
            });
        }
        // 1️⃣ Consultar ASP
        const datosASP = await buscarASP(q.trim());
        // 2️⃣ Consultar MySQL usando req.getConnection
        req.getConnection((err, conn) => {
            conn.query(`SELECT pe.Apellido, pe.Nombre, pe.Dni, fo.frente AS fotoUrl, le.id_InternoLegajo, le.estado AS estadoLegajo, (SELECT Unidad_Destino FROM pol_internomovimiento WHERE id_InternoMovimiento = (SELECT MAX(id_InternoMovimiento) FROM pol_internomovimiento WHERE id_InternoLegajo = le.id_InternoLegajo)) AS Unidad_Alojamiento, (SELECT pol_unidades.Detalle FROM pol_internomovimiento INNER JOIN pol_unidades ON pol_internomovimiento.Unidad_Destino = pol_unidades.id_unidades WHERE id_InternoLegajo = le.id_InternoLegajo ORDER BY id_InternoMovimiento DESC LIMIT 1) AS Detalle_Alojamiento FROM pol_persona pe INNER JOIN pol_internolegajo le USING(id_persona) LEFT JOIN pol_internofotos fo USING(id_InternoLegajo) WHERE pe.Apellido LIKE ? OR pe.Nombre LIKE ? OR pe.Dni LIKE ?`, [`%${q}%`, `%${q}%`, `%${q}%`], (err, results) => {
                    if (err) {
                        console.error("Error consulta MySQL:", err);
                        return res.render("interleg", {
                            datosASP,
                            datosMYSQL: [],
                        });
                    }
                    conn.query(`SELECT SUM(CASE WHEN pol_internolegajo.estado = 0 THEN 1 ELSE 0 END) AS cantidad_estado_0, SUM(CASE WHEN pol_internolegajo.estado = 1 THEN 1 ELSE 0 END) AS cantidad_estado_1 FROM pol_persona INNER JOIN pol_internolegajo USING(id_persona) LEFT JOIN pol_internofotos USING(id_InternoLegajo) WHERE pol_persona.Apellido LIKE ? OR pol_persona.Nombre LIKE ? OR pol_persona.Dni LIKE ?`,
                        [`%${q}%`, `%${q}%`, `%${q}%`],
                        (err, estadoCounts) => {
                            if (err) {
                                console.error("Error al contar estados:", err);
                            }
                            console.log("RESULTADOS MYSQL:", results.length);
                            console.log("ESTADOS CONTADOS:", estadoCounts);
                            res.render("interleg", {
                                datosASP,
                                datosMYSQL: results,
                                estadoCounts: estadoCounts[0] || {
                                    cantidad_estado_0: 0,
                                    cantidad_estado_1: 0,
                                },
                            });
                        },
                    );
                },
            );
        });
    } catch (error) {
        console.error("Error general:", error);

        res.render("interleg", {
            datosASP: [],
            datosMYSQL: [],
        });
    }
};

controller.consultaDetenido = async (req, res) => {
    const dni = req.params.dni;

    try {
        // 1️⃣ Consultar ASP (Fox Pro)
        const datosASP = await buscarASP(dni);

        // 2️⃣ Consultar MySQL
        req.getConnection((err, conn) => {
            if (err) {
                return res.status(500).json({ error: true });
            }

            conn.query(`SELECT pe.Nombre, pe.Apellido, pe.Dni, le.id_InternoLegajo, fo.frente FROM pol_persona pe INNER JOIN pol_internolegajo le USING(id_persona) LEFT JOIN pol_internofotos fo USING(id_InternoLegajo) WHERE pe.Dni = ? LIMIT 1`,
                [dni],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: true });
                    }

                    const existeMYSQL = results.length > 0;
                    const existeASP = datosASP.length > 0;

                    return res.json({
                        existe: existeMYSQL || existeASP,
                        mysql: existeMYSQL ? results[0] : null,
                        asp: existeASP ? datosASP[0] : null
                    });
                }
            );
        });

    } catch (error) {
        console.error("Error consulta DNI:", error);
        return res.status(500).json({ error: true });
    }
};

module.exports = controller;
