//************************************* VISTA HEADER 2 - ESTE ES EL NAVBAR DE TODAS LAS VISTAS *****************************************

// ========================================================= WATERMARK DINÁMICO =============================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("Watermark iniciando..."); // 👈 debug

  const container = document.getElementById("watermark");
  if (!container) {
    console.log("No existe #watermark");
    return;
  }

  const texto = document.body.dataset.usuario;

  console.log("Texto watermark:", texto); // 👈 debug

  if (!texto) return;
  const spacingX = 300;
  const spacingY = 180;
  for (let y = -1000; y < 2000; y += spacingY) {
    for (let x = -1000; x < 2000; x += spacingX) {
      const div = document.createElement("div");
      div.className = "watermark-text";
      div.innerText = texto;
      div.style.top = y + "px";
      div.style.left = x + "px";
      container.appendChild(div);
    }
  }

  console.log(
    "Cantidad generada:",
    document.querySelectorAll(".watermark-text").length,
  );
});


// ========================================================= FIN WATERMARK DINÁMICO ===========================================================


setInterval(async () => {
    try {
      const res = await fetch('/ping', {
        method: 'GET',
        credentials: 'include'
      });

      if (res.status === 401) {
        // 🔥 acá ocurre la magia
        window.location.href = '/login?timeout=1';
      }

    } catch (err) {
      console.error('Ping error', err);
    }
  }, 60000);

// SCRIPT QUE ABRE UNA ALERTA AL PRESIONAR REABRIR CAUSA INGRESANDO UN MOTIVO
window.reabrirCausa = function (
  event,
  index,
  idInternoProntuario,
  id_InternoLegajo,
) {
  Swal.fire({
    title: "¿Estás seguro de reabrir la causa?",
    input: "textarea",
    inputlabel: "Motivo de reapertura",
    inputPlaceholder: "Escriba el motivo aquí...",
    inputAttributes: {
      "aria-label": "Motivo de reapertura",
    },
    showCancelButton: true,
    confirmButtonText: "Sí, reabrir causa",
    cancelButtonText: "Cancelar",
    preConfirm: (motivo) => {
      if (!motivo.trim()) {
        Swal.showValidationMessage("El motivo es obligatorio");
        return false;
      }
      return motivo;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const motivo = result.value;
      event.preventDefault();
      const form = document.querySelector(`#card-${index} form`);
      const originalAction = form.getAttribute("action");

      // Cambia acción a la ruta de reabrir
      form.setAttribute("action", `/reabrir_causa/${idInternoProntuario}`);

      // Agrega campo oculto con el motivo
      const motivoInput = document.createElement("input");
      motivoInput.type = "hidden";
      motivoInput.name = "motivo";
      motivoInput.value = motivo;
      form.appendChild(motivoInput);

      // Marca como acción de reapertura
      const accionInput = document.createElement("input");
      accionInput.type = "hidden";
      accionInput.name = "accion";
      accionInput.value = "reabrir";
      form.appendChild(accionInput);

      form.submit();

      form.setAttribute("action", originalAction);
    }
  });
};
// SCRIPT QUE ABRE UNA ALERTA AL PRESIONAR CERRAR CAUSA INGRESANDO UN MOTIVO
window.cerrarCausa = function (event, index, idInternoProntuario) {
  Swal.fire({
    title: "¿Estás seguro de cerrar la causa?",
    input: "textarea",
    inputLabel: "Motivo de cierre",
    inputPlaceholder: "Escriba el motivo aquí...",
    inputAttributes: {
      "aria-label": "Motivo de cierre",
    },
    showCancelButton: true,
    confirmButtonText: "Sí, cerrar causa",
    cancelButtonText: "Cancelar",
    preConfirm: (motivo) => {
      if (!motivo.trim()) {
        Swal.showValidationMessage("El motivo es obligatorio");
        return false;
      }
      return motivo;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const motivo = result.value;
      event.preventDefault();
      const form = document.querySelector(`#card-${index} form`);
      const originalAction = form.getAttribute("action");

      // Cambia acción a la ruta de cerrar
      form.setAttribute("action", `/cerrar_causa/${idInternoProntuario}`);

      // Agrega campo oculto con el motivo
      const motivoInput = document.createElement("input");
      motivoInput.type = "hidden";
      motivoInput.name = "motivo";
      motivoInput.value = motivo;
      form.appendChild(motivoInput);

      // Marca como acción de anulación
      const accionInput = document.createElement("input");
      accionInput.type = "hidden";
      accionInput.name = "accion";
      accionInput.value = "anular";
      form.appendChild(accionInput);

      form.submit();

      // Restaurar acción original (opcional)
      form.setAttribute("action", originalAction);
    }
  });
};
// SCRIPT QUE ABRE UNA ALERTA AL PRESIONAR ANULAR CAUSA INGRESANDO UN MOTIVO
window.anularCausa = function (event, index, idInternoProntuario) {
  Swal.fire({
    title: "¿Estás seguro de anular la causa?",
    input: "textarea",
    inputLabel: "Motivo de anulación",
    inputPlaceholder: "Escriba el motivo aquí...",
    inputAttributes: {
      "aria-label": "Motivo de anulación",
    },
    showCancelButton: true,
    confirmButtonText: "Sí, anular causa",
    cancelButtonText: "Cancelar",
    preConfirm: (motivo) => {
      if (!motivo.trim()) {
        Swal.showValidationMessage("El motivo es obligatorio");
        return false;
      }
      return motivo;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const motivo = result.value;
      event.preventDefault();
      const form = document.querySelector(`#card-${index} form`);
      const originalAction = form.getAttribute("action");

      // Cambia acción a la ruta de anular
      form.setAttribute("action", `/anular_causa/${idInternoProntuario}`);

      // Agrega campo oculto con el motivo
      const motivoInput = document.createElement("input");
      motivoInput.type = "hidden";
      motivoInput.name = "motivo";
      motivoInput.value = motivo;
      form.appendChild(motivoInput);

      // Marca como acción de anulación
      const accionInput = document.createElement("input");
      accionInput.type = "hidden";
      accionInput.name = "accion";
      accionInput.value = "anular";
      form.appendChild(accionInput);

      form.submit();

      // Restaurar acción original (opcional)
      form.setAttribute("action", originalAction);
    }
  });
};
// SCRIPT PARA HABILITAR LA EDICION DE UNA CAUSA ACTIVANDO LOS CAMPOS DE TEXTO Y BOTONES DE ACTUALIZACION
window.habilitarEdicion = function (index) {
  const card = document.getElementById(`card-${index}`);
  if (!card) return;
  const canEdit = card.dataset.canEdit === "true";
  if (!canEdit) {
    Swal.fire({
      icon: "warning",
      title: "Periodo de edición expirado",
      text: "No es posible modificar esta causa después de 2 minutos.",
    });
    return;
  }
  // 🔥 IMPORTANTE: ahora incluye select
  const campos = card.querySelectorAll("input, select");
  campos.forEach((campo) => {
    if (
      !campo.name?.startsWith("id_InternoLegajo") &&
      !campo.name?.startsWith("id_internoprontuario") &&
      !campo.name?.startsWith("id_Persona") &&
      !campo.name?.startsWith("Fecha_cumple_condena_disabled1")
    ) {
      campo.removeAttribute("readonly");
      campo.removeAttribute("disabled");

      // 🔹 Si es TomSelect → habilitar
      if (campo.tomselect) {
        campo.tomselect.enable();
      }
    }
  });
  // 🔹 Botones
  document.getElementById(`modificar-${index}`).classList.add("d-none");
  document.getElementById(`actualizar-${index}`).classList.remove("d-none");
  document.getElementById(`cancelar-${index}`).classList.remove("d-none");
  // 🔹 Evento situación procesal (ahora con select)
  function cambiarEstadoCampoFecha(index, mostrar) {
    const inputFecha = document.getElementById(`Fecha_cumple_condena-${index}`);
    if (!inputFecha) return;

    console.log("ENTRA EN FUNCION");

    inputFecha.disabled = !mostrar;
    inputFecha.readOnly = !mostrar;
  }

  const situacionSelect = card.querySelector(".tom-situacion");
  if (situacionSelect) {
    situacionSelect.addEventListener("change", function () {
      const valor = this.value;
      const mostrar = valor === "CONDENADO" || valor === "PREVENTIVA";
      cambiarEstadoCampoFecha(index, mostrar);
    });
  }
  function diffFechasIntegrado(fecha1, fecha2) {
    fecha1 = new Date(fecha1);
    fecha2 = new Date(fecha2);
    let diffMs = Math.abs(fecha2 - fecha1);
    let diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    let diffAnios = Math.floor(diffDias / 365);
    let diffMeses = Math.floor((diffDias % 365) / 30);
    let diffDiasRestantes = diffDias - diffAnios * 365 - diffMeses * 30;
    return {
      anios: diffAnios,
      meses: diffMeses,
      dias: diffDiasRestantes,
    };
  }
  function actualizarFechaDesdeCamposTarjeta(index) {
    const dias =
      parseInt(document.getElementById(`Cantidad-dias-${index}`).value) || 0;
    const meses =
      parseInt(document.getElementById(`Cantidad-meses-${index}`).value) || 0;
    const anios =
      parseInt(document.getElementById(`Cantidad-anios-${index}`).value) || 0;
    let fechaBase = new Date();
    fechaBase.setFullYear(fechaBase.getFullYear() + anios);
    fechaBase.setMonth(fechaBase.getMonth() + meses);
    fechaBase.setDate(fechaBase.getDate() + dias);
    document.getElementById(`Fecha_cumple_condena-${index}`).valueAsDate = fechaBase;
    mostrarDiferenciaTiempoTarjeta(index, new Date(), fechaBase);
  }
  document.getElementById(`Fecha_cumple_condena-${index}`).addEventListener("change", function () {
      const fechaBase = new Date();
      const fechaCumple = new Date(this.value);
      if (!isNaN(fechaBase) && !isNaN(fechaCumple)) {
        mostrarDiferenciaTiempoTarjeta(index, fechaBase, fechaCumple);
      }
    });
  // Evento cambio en campos de días/meses/años -> actualiza fecha y diferencia
  // document.getElementById(`Cantidad-dias-${index}`).addEventListener("change", () => actualizarFechaDesdeCamposTarjeta(index));
  // document.getElementById(`Cantidad-meses-${index}`).addEventListener("change", () => actualizarFechaDesdeCamposTarjeta(index));
  // document.getElementById(`Cantidad-anios-${index}`).addEventListener("change", () => actualizarFechaDesdeCamposTarjeta(index));
};
// INHABILITA LOS CAMPOS DE UNA CAUSA Y OCULTA BOTONES DE ACTUALIZACION
window.cancelarEdicion = function (index) {
  const card = document.getElementById(`card-${index}`);
  const campos = card.querySelectorAll("input, select");
  campos.forEach((campo) => {
    if (
      !campo.name?.startsWith("id_InternoLegajo") &&
      !campo.name?.startsWith("id_internoprontuario") &&
      !campo.name?.startsWith("id_Persona")
    ) {
      // 🔹 Restaurar valor original si existe
      const original = campo.dataset.original;
      if (original !== undefined) {
        // 👉 INPUT normal
        if (!campo.tomselect) {
          campo.value = original;
        }
        // 👉 TOMSELECT
        if (campo.tomselect) {
          campo.tomselect.setValue(original, true); // true = silent (sin eventos)
        }
      }
      // 🔹 Bloquear campo
      campo.setAttribute("readonly", true);
      campo.setAttribute("disabled", true);
      // 🔹 Deshabilitar TomSelect
      if (campo.tomselect) {
        campo.tomselect.disable();
      }
    }
  });
  // 🔹 Botones
  document.getElementById(`modificar-${index}`).classList.remove("d-none");
  document.getElementById(`actualizar-${index}`).classList.add("d-none");
  document.getElementById(`cancelar-${index}`).classList.add("d-none");
  // 🔹 Ocultar sección fecha
  const divFecha = document.getElementById(`divFecha-${index}`);
  if (divFecha) divFecha.style.display = "none";
};

// ========================================================= MENU RESPONSIVO =============================================================

document.addEventListener("DOMContentLoaded", async function () {
  const pageType = document.getElementById("main-container").getAttribute("data-page");

  const Mostrarmenu = (headerToggle, navbarId) => {
    const toggleBtn = document.getElementById(headerToggle);
    const nav = document.getElementById(navbarId);
    if (headerToggle && navbarId) {
      toggleBtn.addEventListener("click", () => {
        nav.classList.toggle("show-menu");
        toggleBtn.classList.toggle("bx-x");
      });
    }
  };
  Mostrarmenu("header-toggle", "navbar");
  // Cerrar menú en móviles al hacer click en cualquier lado (excepto en el toggle)
  document.addEventListener("click", (e) => {
    const nav = document.getElementById("navbar");
    const toggleBtn = document.getElementById("header-toggle");
    if (!nav || !toggleBtn) return;
    const isSmall = window.innerWidth < 768;
    if (isSmall && nav.classList.contains("show-menu")) {
      // Si el click no fue sobre el toggle ni dentro del menú, cerrar el menú
      if (!toggleBtn.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove("show-menu");
        toggleBtn.classList.remove("bx-x");
      }
    }
  });

  //========================================================= FIN MENU RESPONSIVO ===========================================================

  // ===================================================== SISTEMA DE NOTIFICACIONES =======================================================
  const bellIcon = document.getElementById("bellIcon");
  const bellContainer = document.getElementById("notificacionesContainer");
  const notificacionesBadge = document.getElementById("notificacionesBadge");
  const modalNotificaciones = document.getElementById("modalNotificaciones");
  let notificacionesActuales = [];

  // Función para obtener notificaciones del servidor

  async function obtenerNotificaciones() {
    try {
      const response = await fetch("/api/notificaciones");
      const data = await response.json();

      if (data.notificaciones && data.notificaciones.length > 0) {
        notificacionesActuales = data.notificaciones;

        // Mostrar badge con número de notificaciones

        if (data.total_no_leidas > 0) {
          notificacionesBadge.textContent = data.total_no_leidas;
          notificacionesBadge.style.display = "block";
          bellIcon.style.color = "#ff6b6b"; // Rojo para indicar notificaciones activas
        } else {
          notificacionesBadge.style.display = "none";
          bellIcon.style.color = "white"; // Blanco cuando no hay notificaciones
        }
      } else {
        notificacionesActuales = [];
        notificacionesBadge.style.display = "none";
        bellIcon.style.color = "white";
      }
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
    }
  }

  // Función para renderizar notificaciones en el modal

  function mostrarNotificacionesEnModal() {
    const contenedor = document.querySelector(
      "#modalNotificaciones .modal-body",
    );

    if (notificacionesActuales.length === 0) {
      contenedor.innerHTML =
        '<p class="text-black text-center">No hay notificaciones</p>';
      return;
    }

    contenedor.innerHTML = notificacionesActuales
      .map(
        (notif) => `
      <div class="card mb-3 border-warning">
        <div class="card-body">
          <h6 class="card-title text-white fw-bold">${notif.Tipo_Notificacion}</h6>
          <p class="card-text mb-2 text-white">
            <strong>Detenido:</strong> ${notif.Nombre_Detenido} ${notif.Apellido_Detenido}<br>
            <strong>DNI:</strong> ${notif.DNI_Detenido}<br>
            <strong>Trasladado desde:</strong> ${notif.Unidad_Origen} <strong> a </strong> ${notif.Unidad_Destino}<br>
            <small class="text-muted">Recibido: ${new Date(notif.Fecha_Creacion).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", hour12: false })}</small>
          </p>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-success-strong border border-1 border-black aceptar-notif" data-id="${notif.id_Notificacion}">Aceptar</button>
            <button class="btn btn-sm btn-danger-strong border border-1 border-black rechazar-notif" data-id="${notif.id_Notificacion}">Rechazar</button>
          </div>
        </div>
      </div>
    `,
      )
      .join("");

    // Agregar event listeners a los botones

    document.querySelectorAll(".aceptar-notif").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dialogo = document.getElementById("modalNotificaciones");
        dialogo.close();
        responderNotificacion(btn.dataset.id, "aceptada");
      });
    });
    document.querySelectorAll(".rechazar-notif").forEach((btn) => {
      const dialogo = document.getElementById("modalNotificaciones");
      dialogo.close();
      btn.addEventListener("click", () =>
        responderNotificacion(btn.dataset.id, "rechazada"),
      );
    });
  }

  // Función para responder a una notificación

  async function responderNotificacion(id, respuesta) {
    try {
      const response = await fetch(`/api/notificaciones/${id}/responder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ respuesta }),
      });

      if (response.ok) {
        await obtenerNotificaciones();
        mostrarNotificacionesEnModal();

        const mensaje =
          respuesta === "aceptada"
            ? "Traslado aceptado y registrado en base de datos"
            : "Notificación rechazada";
        Swal.fire({
          title: "Éxito",
          text: mensaje,
          icon: "success",
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error al responder notificación:", error);
    }
  }

  // Click en la campana para mostrar notificaciones

  if (bellContainer) {
    bellContainer.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarNotificacionesEnModal();
      modalNotificaciones.showModal();
    });
  }

  // Obtener notificaciones al cargar la página
  obtenerNotificaciones();

  // Polling cada 10 minutos
  setInterval(obtenerNotificaciones, 600000);

  // ======================================================= FIN SISTEMA NOTIFICACIONES ============================================================

  // ============================================ BUSQUEDA DE DETENIDO - CONVERTIR A MAYUSCULAS ===================================================

  document.querySelectorAll('input[type="text"]').forEach(function (input) {
    input.addEventListener("input", function () {
      this.value = this.value.toUpperCase();
    });
  });
  document.querySelectorAll('input[type="email"]').forEach(function (input) {
    input.addEventListener("input", function () {
      this.value = this.value.toUpperCase();
    });
  });

  // ========================================================= FIN BUSQUEDA DE DETENIDO   ========================================================

  // ======================================================== SISTEMA DE CAMBIO DE CLAVE =========================================================
// ======================================================== SISTEMA DE CAMBIO DE CLAVE =========================================================

const modalCambiarClave = document.getElementById("modalCambiarClave");
const formCambiarClave = document.getElementById("formCambiarClave");

// 🔥 ID DEL USUARIO DESDE EL BODY (FIJO)
const userId = document.body.dataset.userid;
const username = document.body.dataset.username;

// 🔹 Abrir modal manual
document.querySelectorAll(".modalCambiarClave").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    if (!userId) {
      Swal.fire("Error", "No se pudo identificar el usuario", "error");
      return;
    }

    formCambiarClave.action = `/cambiar_clave/${userId}`;
    modalCambiarClave.showModal();
  });
});

// 🔹 Cerrar modal (controlado)
document.querySelectorAll(".cerrarModalClave").forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (window.forzarCambioClaveActivo) {

      modalCambiarClave.close();

      await Swal.fire(
        "Obligatorio",
        "Debe cambiar la clave para continuar",
        "warning"
      );

      modalCambiarClave.showModal();
      return;
    }

    modalCambiarClave.close();
  });
});

// 🔹 Submit del formulario
formCambiarClave.addEventListener("submit", async (e) => {
  e.preventDefault();

  const contrasenia = document.getElementById("contrasenia").value.trim();
  const nuevaContrasenia = document.getElementById("nuevaContrasenia").value.trim();
  const confirmaContrasenia = document.getElementById("confirmaContrasenia").value.trim();

  if (!contrasenia || !nuevaContrasenia || !confirmaContrasenia) {
    modalCambiarClave.close();
    await Swal.fire({
      title: "Campos incompletos",
      text: "Debe completar todos los campos.",
      icon: "warning",
    });
    modalCambiarClave.showModal();
    return;
  }

  if (nuevaContrasenia === contrasenia) {
    modalCambiarClave.close();
    await Swal.fire({
      title: "Error",
      text: "La nueva clave no puede ser igual a la actual.",
      icon: "error",
    });
    modalCambiarClave.showModal();
    return;
  }

  if (nuevaContrasenia.length < 8 || nuevaContrasenia.length > 10) {
    modalCambiarClave.close();
    await Swal.fire({
      title: "Longitud inválida",
      text: "Debe tener entre 8 y 10 caracteres.",
      icon: "warning",
    });
    modalCambiarClave.showModal();
    return;
  }

  if (nuevaContrasenia !== confirmaContrasenia) {
    modalCambiarClave.close();
    await Swal.fire({
      title: "Error",
      text: "Las claves no coinciden.",
      icon: "error",
    });
    modalCambiarClave.showModal();
    return;
  }

  if (nuevaContrasenia === username) {
    modalCambiarClave.close();
    await Swal.fire({
      title: "Clave inválida",
      text: "La contraseña no puede ser igual al usuario.",
      icon: "error",
    });
    modalCambiarClave.showModal();
    return;
  }

  modalCambiarClave.close();

  const confirmacion = await Swal.fire({
    title: "¿Confirmar cambio?",
    text: "¿Desea cambiar la contraseña?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, cambiar",
    cancelButtonText: "Cancelar",
  });

    // 🔥 SI CANCELA → REABRIR
  if (!confirmacion.isConfirmed) {
    modalCambiarClave.showModal();
    return;
  }

  if (confirmacion.isConfirmed) {
    // 🔥 ACA ESTÁ LA CLAVE
    formCambiarClave.action = `/cambiar_clave/${userId}`;

    console.log("ACTION FINAL:", formCambiarClave.action);

    formCambiarClave.submit();
  }
});

// ============================================================ FIN SISTEMA =========================================================

  // ============================================================ FIN SISTEMA DE CAMBIO DE CLAVE =========================================================

  // ============================================================ ALERTAS GENERALES CON SWEET ALERTS =========================================================

  const alertDiv = document.querySelector(".alert.alert-danger");

  if (alertDiv) {
    Swal.fire({
      icon: "error",
      title: "Error",
      html: alertDiv.innerHTML,
    });
  }

  const params = new URLSearchParams(window.location.search);

  if (params.get("error") === "existe") {
    Swal.fire({
      icon: "error",
      title: "Detenido existente",
      text: "El detenido ya existe en el sistema",
    });
  }

  const paramsCausa = new URLSearchParams(window.location.search);
  const msg = paramsCausa.get("msg");
  const error = paramsCausa.get("error");
  if (msg) {
    const mensajes = {
      causa_cerrada: {
        titulo: "Causa cerrada",
        texto: "La causa fue cerrada correctamente.",
        icono: "success",
      },

      causa_reabierta: {
        titulo: "Causa reabierta",
        texto: "La causa fue reabierta correctamente.",
        icono: "success",
      },

      causa_anulada: {
        titulo: "Causa anulada",
        texto: "La causa fue anulada correctamente.",
        icono: "success",
      },

      causa_actualizada: {
        titulo: "Causa actualizada",
        texto: "La causa fue actualizada correctamente.",
        icono: "success",
      },

      pedido_traslado: {
        titulo: "Éxito",
        texto: "Pedido de traslado realizado correctamente",
        icono: "success",
      },

      traslado_ok: {
        titulo: "Traslado realizado",
        texto: "El detenido fue trasladado correctamente.",
        icono: "success",
      },

      detenido_actualizado: {
        titulo: "Datos actualizados",
        texto: "Los datos del detenido fueron actualizados.",
        icono: "success",
      },

      detenido_registrado: {
        titulo: "Detenido registrado",
        texto: "El detenido fue registrado correctamente.",
        icono: "success",
      },

      tareaExitosa: {
        titulo: "Accion Realizada",
        texto: "Se ha realizado el movimiento de alojamiento correctamente",
        icono: "success",
      },

      detenido_liberado: {
        titulo: "Éxito",
        texto: "Detenido liberado correctamente.",
        icono: "success",
      },

      cambio_clave_ok: {
        titulo: "Éxito",
        texto: "Clave cambiada correctamente.",
        icono: "success",
      },

      archivo_subido: {
        titulo: "Éxito",
        texto: "Archivo subido correctamente.",
        icono: "success",
      },
    };
    const alerta = mensajes[msg];

    if (alerta) {
      Swal.fire({
        title: alerta.titulo,
        text: alerta.texto,
        icon: alerta.icono,
        confirmButtonColor: "#198754",
      });
    }
  } else if (error) {
    const mensajes = {
      contrasenia_incorrecta: {
        titulo: "Error",
        texto: "La contraseña actual es incorrecta.",
        icono: "error",
      },
      no_coinciden: {
        titulo: "Error",
        texto: "La nueva contraseña y la confirmación no coinciden.",
        icono: "error",
      },
      usuario_no_encontrado: {
        titulo: "Error",
        texto: "Usuario no encontrado.",
        icono: "error",
      },
      update: {
        titulo: "Error",
        texto: "No se pudo actualizar la contraseña.",
        icono: "error",
      },
      conexion: {
        titulo: "Error",
        texto: "Ocurrió un problema con la base de datos.",
        icono: "error",
      },
    };
    const alerta = mensajes[error];

    if (alerta) {
      Swal.fire({
        title: alerta.titulo,
        text: alerta.texto,
        icon: alerta.icono,
        confirmButtonColor: "#dc3545",
      });
    }
  }
  window.history.replaceState({}, document.title, window.location.pathname);

  // =============================================================== FIN ALERTAS GENERALES CON SWEET ALERTS =========================================================

  //************************************* PAGETYPE *****************************************

  //*********************************************************************************************************  */

  if (pageType === "inicio") {
  }

  if (pageType === "listar_usuarios") {
    const params = new URLSearchParams(window.location.search);

    if (params.get("success") === "acceso_actualizado") {
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Los accesos fueron actualizados correctamente.",
        confirmButtonColor: "#198754",
      });

      // limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const btnReset = document.getElementById("btnReset");

    document.querySelectorAll(".formResetClave").forEach((form) => {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        Swal.fire({
          title: "¿Confirma reestabler contraseña?",
          text: "Se reestablecerá la clave del usuario.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, reestablecer",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            form.submit(); // Ahora sí lo enviás
          }
        });
      });
    });

    const msgContainer = document.getElementById("message-container");
    const success = msgContainer.dataset.success;
    const error = msgContainer.dataset.error;
    if (success) {
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: success,
      });
    }
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
      });
    }

    //FILTRO PARA BUSQUEDA TABLA
    document
      .getElementById("filtroBusqueda")
      .addEventListener("keyup", function () {
        const filtro = this.value.toLowerCase().trim();

        // Tabla (desktop)
        const filas = document.querySelectorAll("#tablaUsuarios tbody tr");
        filas.forEach((fila) => {
          const apellido = fila.cells[1].textContent.toLowerCase();
          const nombre = fila.cells[2].textContent.toLowerCase();
          const dni = fila.cells[3].textContent.toLowerCase();

          fila.style.display =
            nombre.includes(filtro) ||
            apellido.includes(filtro) ||
            dni.includes(filtro)
              ? ""
              : "none";
        });
        // Tarjetas (mobile)
        const cards = document.querySelectorAll(".d-block.d-md-none .card");
        cards.forEach((card) => {
          const nombre =
            card.querySelector("p.mb-2")?.textContent.toLowerCase() || "";
          const dni =
            card.querySelector("p:nth-of-type(2)")?.textContent.toLowerCase() ||
            "";

          if (nombre.includes(filtro) || dni.includes(filtro)) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
  }

  if (pageType === "agregar_usuario") {
    // Generar Usuario automáticamente desde DNI

    let inputDni = document.getElementById("Dni");
    let inputUsuario = document.getElementById("Usuario");
    let inputClave = document.getElementById("Clave");

    inputDni.addEventListener("input", function () {
      inputUsuario.value = this.value;
      inputClave.value = this.value;
    });

    // ===== VALIDACIÓN DE APELLIDO Y NOMBRE - SOLO LETRAS =====
    const apellidoInput = document.getElementById("Apellido");
    const nombreInput = document.getElementById("Nombre");

    const validarSoloLetras = (input) => {
      // Prevenir números en tiempo real
      input.addEventListener("keypress", function (e) {
        const char = String.fromCharCode(e.which);
        // Si es un número, prevenir la entrada
        if (/[0-9]/.test(char)) {
          e.preventDefault();
          return false;
        }
      });

      // Limpiar cualquier número que se haya pegado
      input.addEventListener("input", function (e) {
        this.value = this.value.replace(/[0-9]/g, "");
      });

      // Validar al perder el foco (por si acaso)
      input.addEventListener("blur", function () {
        if (this.value && /[0-9]/.test(this.value)) {
          alert("El campo " + this.id + " no puede contener números");
          this.value = this.value.replace(/[0-9]/g, "");
        }
      });
    };

    validarSoloLetras(apellidoInput);
    validarSoloLetras(nombreInput);

    inputDni.addEventListener("blur", async () => {
      const dni = inputDni.value.trim();

      if (dni.length !== 8) return;

      try {
        const response = await fetch(`/verificar_usuario/${dni}`);
        const data = await response.json();

        if (data.existe) {
          await Swal.fire({
            icon: "warning",
            title: "Usuario existente",
            text: "Ya existe un usuario con ese DNI en el sistema",
            confirmButtonText: "Aceptar",
          });

          limpiarCampos();
        }
      } catch (error) {
        console.error("Error verificando usuario:", error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un problema al verificar el usuario",
        });
      }
    });

    function limpiarCampos() {
      inputDni.value = "";
      inputUsuario.value = "";
      inputClave.value = "";
      inputDni.focus();
    }
  }

  if (pageType === "modificar_usuario") {
    // Generar Usuario automáticamente desde DNI
    let inputDni = document.getElementById("Dni");
    let inputUsuario = document.getElementById("Usuario");
    let inputClave = document.getElementById("Clave");

    inputDni.addEventListener("input", function () {
      inputUsuario.value = this.value;
      inputClave.value = this.value;
    });

    // ===== VALIDACIÓN DE APELLIDO Y NOMBRE - SOLO LETRAS =====
    const apellidoInput = document.getElementById("Apellido");
    const nombreInput = document.getElementById("Nombre");

    const validarSoloLetras = (input) => {
      // Prevenir números en tiempo real
      input.addEventListener("keypress", function (e) {
        const char = String.fromCharCode(e.which);
        // Si es un número, prevenir la entrada
        if (/[0-9]/.test(char)) {
          e.preventDefault();
          return false;
        }
      });

      // Limpiar cualquier número que se haya pegado
      input.addEventListener("input", function (e) {
        this.value = this.value.replace(/[0-9]/g, "");
      });

      // Validar al perder el foco (por si acaso)
      input.addEventListener("blur", function () {
        if (this.value && /[0-9]/.test(this.value)) {
          alert("El campo " + this.id + " no puede contener números");
          this.value = this.value.replace(/[0-9]/g, "");
        }
      });
    };

    validarSoloLetras(apellidoInput);
    validarSoloLetras(nombreInput);

    inputDni.addEventListener("blur", async () => {
      const dni = inputDni.value.trim();

      if (dni.length !== 8) return;

      try {
        const response = await fetch(`/verificar_usuario/${dni}`);
        const data = await response.json();

        if (data.existe) {
          await Swal.fire({
            icon: "warning",
            title: "Usuario existente",
            text: "Ya existe un usuario con ese DNI en el sistema",
            confirmButtonText: "Aceptar",
          });

          limpiarCampos();
        }
      } catch (error) {
        console.error("Error verificando usuario:", error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un problema al verificar el usuario",
        });
      }
    });

    function limpiarCampos() {
      inputDni.value = "";
      inputUsuario.value = "";
      inputClave.value = "";
      inputDni.focus();
    }
  }

  if (pageType === "acceso_usuario") {
    // 🔥 TOMSELECT
    const selectInterviene = new TomSelect("#inputInterviene", {
      create: false,
      sortField: { field: "text", direction: "asc" },
      placeholder: "Seleccione dependencia",
      maxOptions: null,
      render: {
        option: function (data, escape) {
          return `<div>${escape(data.text)}</div>`;
        },
      },
    });

    const tablaAccesos = document.querySelector("#tablaPrivilegios tbody");
    const btnAgregar = document.getElementById("btnAgregar");
    const hiddenInputsContainer = document.getElementById(
      "hiddenInputsContainer",
    );
    const form = document.getElementById("formAcceso");
    const selectRol = document.querySelector('select[name="id_rol"]');
    const selectPermiso = document.getElementById("permiso_principal");

    function controlarPermiso() {
      const textoRol =
        selectRol.options[selectRol.selectedIndex]?.text?.toUpperCase();
      const opcionLectura = selectPermiso.querySelector(
        'option[value="LECTURA"]',
      );

      if (textoRol === "ADMINISTRADOR") {
        opcionLectura.style.display = "none";
        selectPermiso.value = "ABM";
      } else {
        opcionLectura.style.display = "block";
      }
    }

    selectRol.addEventListener("change", controlarPermiso);
    document.addEventListener("DOMContentLoaded", controlarPermiso);

    if (!tablaAccesos || !hiddenInputsContainer || !selectRol) return;

    const eliminados = new Set();
    const mensajeRol = document.getElementById("mensajeRolAutomatico");

    // ⚠️ IDS
    const ADMIN_ID = "1";
    const USER_ID = "2";
    const USUARIO_ID = "3";

    const D5_ADMIN_ID = "90";
    const D5_ID = "99";

    const bloquearTabla = (estado) => {
      if (btnAgregar) btnAgregar.disabled = estado;

      // 🔥 TomSelect disable/enable
      if (selectInterviene) {
        estado ? selectInterviene.disable() : selectInterviene.enable();
      }

      tablaAccesos.querySelectorAll("button").forEach((btn) => {
        btn.disabled = estado;
      });

      const tablaContainer = document.getElementById("tablaPrivilegios");

      if (tablaContainer) {
        tablaContainer.style.opacity = estado ? "0.6" : "1";
        tablaContainer.style.pointerEvents = estado ? "none" : "auto";
      }

      if (mensajeRol) {
        mensajeRol.classList.toggle("d-none", !estado);
      }
    };

    const aplicarReglaRol = (rol, esCambioManual = false) => {
      if (esCambioManual) {
        hiddenInputsContainer.innerHTML = "";
        tablaAccesos.innerHTML = "";
        eliminados.clear();
      }

      if (rol === ADMIN_ID) {
        bloquearTabla(true);
        hiddenInputsContainer.innerHTML = "";

        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "dependencias[]";
        input.value = D5_ADMIN_ID;

        hiddenInputsContainer.appendChild(input);
      } else if (rol === USER_ID) {
        bloquearTabla(true);
        hiddenInputsContainer.innerHTML = "";

        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "dependencias[]";
        input.value = D5_ID;

        hiddenInputsContainer.appendChild(input);
      } else if (rol === USUARIO_ID) {
        bloquearTabla(false);
      }
    };

    selectRol.addEventListener("change", function () {
      aplicarReglaRol(this.value, true);
    });

    if (selectRol.value) {
      aplicarReglaRol(selectRol.value, false);
    }

    // 🔥 CARGA INICIAL
    document.querySelectorAll("#tablaPrivilegios tbody tr").forEach((row) => {
      const id = row.dataset.id;

      const inputHidden = document.createElement("input");
      inputHidden.type = "hidden";
      inputHidden.name = "dependencias[]";
      inputHidden.value = id;
      inputHidden.dataset.id = id;

      hiddenInputsContainer.appendChild(inputHidden);
    });

    /* =====================================================
     ➕ AGREGAR DEPENDENCIA
  ====================================================== */

    if (btnAgregar) {
      btnAgregar.addEventListener("click", () => {
        const id = selectInterviene.getValue();
        const detalle = selectInterviene.options[id]?.text;

        if (!id) return alert("Debe seleccionar una dependencia");

        const existe = Array.from(tablaAccesos.rows).some(
          (row) => row.dataset.id === id,
        );

        if (existe) return alert("Ya se agregó esta dependencia.");

        const row = document.createElement("tr");
        row.dataset.id = id;

        row.innerHTML = `
        <td>${id}</td>
        <td>${detalle}</td>
        <td>
          <button type="button" 
                  class="btn btn-sm btn-danger btn-eliminar">
            Eliminar
          </button>
        </td>
      `;

        tablaAccesos.appendChild(row);

        const inputHidden = document.createElement("input");
        inputHidden.type = "hidden";
        inputHidden.name = "dependencias[]";
        inputHidden.value = id;
        inputHidden.dataset.id = id;

        hiddenInputsContainer.appendChild(inputHidden);

        // 🔥 limpiar select
        selectInterviene.clear();
      });
    }

    /* =====================================================
     ❌ ELIMINAR / DESHACER
  ====================================================== */

    tablaAccesos.addEventListener("click", function (e) {
      const btn = e.target;

      if (
        !btn.classList.contains("btn-eliminar") &&
        !btn.classList.contains("btn-deshacer")
      )
        return;

      e.preventDefault();

      const row = btn.closest("tr");
      const id = row.dataset.id;

      if (btn.classList.contains("btn-eliminar")) {
        if (row.dataset.original === "true") {
          row.classList.add("fila-eliminada");

          const inputToRemove = hiddenInputsContainer.querySelector(
            `input[data-id="${id}"]`,
          );

          if (inputToRemove) inputToRemove.remove();

          eliminados.add(id);
        } else {
          const inputToRemove = hiddenInputsContainer.querySelector(
            `input[data-id="${id}"]`,
          );

          if (inputToRemove) inputToRemove.remove();

          row.remove();
        }
      }

      if (btn.classList.contains("btn-deshacer")) {
        row.classList.remove("fila-eliminada");

        const eliminarBtn = row.querySelector(".btn-eliminar");
        if (eliminarBtn) eliminarBtn.style.display = "inline-block";

        btn.remove();

        eliminados.delete(id);

        const inputHidden = document.createElement("input");
        inputHidden.type = "hidden";
        inputHidden.name = "dependencias[]";
        inputHidden.value = id;
        inputHidden.dataset.id = id;

        hiddenInputsContainer.appendChild(inputHidden);
      }
    });

    /* =====================================================
     📤 SUBMIT
  ====================================================== */

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        const rolActual = selectRol.value;

        const filasActivas = tablaAccesos.querySelectorAll(
          "tr:not(.fila-eliminada)",
        );

        if (rolActual === USUARIO_ID && filasActivas.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "No permitido",
            text: "El rol USUARIO debe tener al menos una dependencia asignada.",
          });

          return;
        }

        hiddenInputsContainer
          .querySelectorAll('input[name="eliminados[]"]')
          .forEach((n) => n.remove());

        eliminados.forEach((id) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = "eliminados[]";
          input.value = id;
          hiddenInputsContainer.appendChild(input);
        });

        Swal.fire({
          title: "¿Guardar cambios?",
          text: "Se actualizarán los accesos del usuario.",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#198754",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Sí, guardar",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            form.submit();
          }
        });
      });
    }
  }

  if (pageType === "listar_detenidos") {
    const nuevoAlojamiento = new TomSelect("#nuevoAlojamiento", {
      create: false,
      sortField: { field: "text", direction: "asc" },
      maxOptions: null,
    });

    const nuevodestino = new TomSelect("#Comisaria_destino_id", {
      create: false,
      sortField: { field: "text", direction: "asc" },
      maxOptions: null,
    });

    document.addEventListener("submit", function (e) {
      if (e.target && e.target.id === "formTrasladar") {
        e.preventDefault();

        const dialog = document.getElementById("mimodalTrasladar");

        // 🔴 Cerrar el dialog primero
        if (dialog.open) {
          dialog.close();
        }

        Swal.fire({
          title: "¿Confirmar traslado?",
          text: "¿Estás seguro de solicitar el traslado del detenido?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, trasladar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#198754",
          cancelButtonColor: "#dc3545",
        }).then((result) => {
          if (result.isConfirmed) {
            e.target.submit();
          }
        });
      }
    });

    function funcion1() {
      var inputNombre, filter, table, tr, td, i;
      inputNombre = document.getElementById("inputNombre");
      filter = inputNombre.value.toUpperCase();
      table = document.getElementById("tablaDetenidos");
      tr = table.getElementsByTagName("tr");
      for (i = 0; i < tr.length; i++) {}
    }

    //MODAL OPCIONES DE DETENIDOS DISPOSITIVOS GRANDES

    const abrirModalOpciones = document
      .querySelectorAll(".abrir-modal-opciones")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const modalAcciones = document.getElementById("modalAcciones");
          const id = btn.dataset.id;
          const nombre = btn.dataset.nombre || "";
          const apellido = btn.dataset.apellido || "";
          const dni = btn.dataset.dni || "";
          const Origen = btn.dataset.origen || "";
          const esAdmin = btn.dataset.esadmin;
          console.log("ALOJAMIENTO ORIGEN ", Origen);
          const cantidadCausas = Number(btn.dataset.cantidad_causas) || 0;
          console.log(
            "Cantidad causas:",
            cantidadCausas,
            typeof cantidadCausas,
          );
          console.log(
            "ID:",
            id,
            "Nombre:",
            nombre,
            "Apellido:",
            apellido,
            "DNI:",
            dni,
          );
          const alojamiento = btn.dataset.alojado;

          if (
            alojamiento === "999" ||
            alojamiento === "998" ||
            alojamiento === "997" ||
            alojamiento === "996"
          ) {
            console.log("INGRESAA");
            document.getElementById("btnMover").classList = "d-none";
            document.getElementById("btnRegresar").classList =
              "btn btn-secondary w3-button abrir-modal-regresar border border-1 border-black";
            document.getElementById("btnTrasladar").disabled = true;
          } else {
            document.getElementById("btnMover").classList =
              "btn btn-primary w3-button abrir-modal-mover border border-1 border-black";
            document.getElementById("btnRegresar").classList = "d-none";
            document.getElementById("btnTrasladar").disabled = false;
          }

          // Liberar (solo si existe el botón y cumple la condición)

          console.log("Es admin:", esAdmin);

          const btnLiberar = document.getElementById("btnLiberar");

          if (btnLiberar) {
            if (!esAdmin) {
              btnLiberar.style.display = "none";
            } else {
              btnLiberar.style.display =
                cantidadCausas === 0 ? "inline-block" : "none";
              if (cantidadCausas === 0) {
                btnLiberar.dataset.id = id;
              }
            }
          }

          // Mover / Trasladar
          const btnMover = document.getElementById("btnMover");
          if (btnMover) {
            btnMover.style.display = "inline-block";
            btnMover.dataset.id = id;
            btnMover.dataset.nombre = nombre;
            btnMover.dataset.apellido = apellido;
            btnMover.dataset.dni = dni;
            btnMover.dataset.alojado = alojamiento;
          }
          const btnTrasladar = document.getElementById("btnTrasladar");
          if (btnTrasladar) {
            btnTrasladar.style.display = "inline-block";
            btnTrasladar.dataset.id = id;
            btnTrasladar.dataset.nombre = nombre;
            btnTrasladar.dataset.apellido = apellido;
            btnTrasladar.dataset.dni = dni;
          }

          const btnRegresar = document.getElementById("btnRegresar");
          if (btnRegresar) {
            btnRegresar.style.display = "inline-block";
            btnRegresar.dataset.id = id;
            btnRegresar.dataset.nombre = nombre;
            btnRegresar.dataset.apellido = apellido;
            btnRegresar.dataset.dni = dni;
            btnRegresar.dataset.alojado = alojamiento;
            btnRegresar.dataset.origen = Origen;
          }

          // Links
          const linkModificar = document.getElementById("linkModificar");
          const linkCausas = document.getElementById("linkCausas");
          const linkArchivos = document.getElementById("linkArchivos");
          if (linkModificar) {
            linkModificar.style.display = "inline-block";
            linkModificar.href = `/modificar_detenido/${id}`;
          }
          if (linkCausas) {
            linkCausas.style.display = "inline-block";
            linkCausas.href = `/causa_detenido/${id}`;
          }
          if (linkArchivos) {
            linkArchivos.style.display = "inline-block";
            linkArchivos.href = `/agregar_archivo/${id}`;
          }

          modalAcciones.showModal();
        });
      });

    const cerrarModalAcciones = document
      .querySelectorAll(".cerrarModalAcciones")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const modalAcciones = document.getElementById("modalAcciones");
          modalAcciones.close();
        });
      });

    // //MODAL LIBERAR DETENIDO

    document.querySelectorAll(".abrir-modal").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modalAcciones = document.getElementById("modalAcciones");
        modalAcciones.close();
        const id = btn.dataset.id;

        Swal.fire({
          title: "Liberar detenido",
          text: "¿Está seguro que desea liberar al detenido?",
          icon: "warning",
          input: "text",
          inputLabel: "Motivo de liberación",
          inputPlaceholder: "Escriba el motivo...",
          inputValidator: (value) => {
            if (!value) {
              return "Debe ingresar un motivo";
            }
          },
          showCancelButton: true,
          confirmButtonText: "Sí, liberar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#28a745",
          cancelButtonColor: "#d33",
        }).then((result) => {
          if (result.isConfirmed) {
            const motivo = result.value;

            // 🔥 Opción 1: enviar con fetch (recomendado)
            fetch(`/liberar_detenido/${id}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ motivo }),
            })
              .then((res) => {
                if (res.ok) {
                  Swal.fire(
                    "Liberado",
                    "El detenido fue liberado correctamente",
                    "success",
                  ).then(() => location.reload());
                } else {
                  throw new Error();
                }
              })
              .catch(() => {
                Swal.fire("Error", "No se pudo liberar el detenido", "error");
              });
          }
        });
      });
    });

    //MODAL MOVER DETENIDO
    const mimodalMover = document.getElementById("mimodalMover");
    const formMover = document.getElementById("formMover");
    const datosPersonales = document.getElementById("datosPersonales");
    const selectAlojamiento = document.getElementById("nuevoAlojamiento");
    const lugar = document.getElementById("divHCS");
    const direccion = document.getElementById("divDireccion");
    const oficio = document.getElementById("divOficio");

    document.querySelectorAll(".abrir-modal-mover").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modalAcciones = document.getElementById("modalAcciones");
        modalAcciones.close();
        const id = btn.dataset.id;
        const nombre = btn.dataset.nombre;
        const apellido = btn.dataset.apellido;
        const dni = btn.dataset.dni;
        const nombreyapellido = document.createElement("h6");
        nombreyapellido.textContent = `DETENIDO: ${nombre}, ${apellido}`;
        nombreyapellido.className = "text-black fw-bold fst-italic fs-6";
        datosPersonales.appendChild(nombreyapellido);
        const dniElement = document.createElement("h6");
        dniElement.textContent = `DNI: ${dni}`;
        dniElement.className = "text-black fw-bold fst-italic fs-6";
        datosPersonales.appendChild(dniElement);
        datosPersonales.className = "px-3";
        formMover.action = `/mover_detenido/${id}`;
        mimodalMover.showModal();
      });
    });

    document.querySelectorAll(".cerrarModal").forEach((btn) => {
      btn.addEventListener("click", () => {
        const datosPersonales = document.getElementById("datosPersonales");
        datosPersonales.innerHTML = "";
        mimodalMover.close();
      });
    });

    selectAlojamiento.addEventListener("change", () => {
      const valor = selectAlojamiento.value;
      console.log("VALOR SELECCIONADO: ", valor);

      if (valor === "999") {
        lugar.style.display = "none";
        direccion.style.display = "block";
        oficio.style.display = "block";
      } else if (valor === "50") {
        direccion.style.display = "none";
        oficio.style.display = "none";
        lugar.style.display = "none";
      } else {
        lugar.style.display = "block";
        direccion.style.display = "block";
        oficio.style.display = "block";
      }
    });

    //MODAL REGRESAR DETENIDO

    const mimodalRegresar = document.getElementById("mimodalRegresar");
    const formRegresar = document.getElementById("formRegresar");
    const datosPersonalesRegresar = document.getElementById(
      "datosPersonalesRegresar",
    );
    const origenAlojamiento = document.getElementById("origenAlojamiento");

    document.querySelectorAll(".abrir-modal-regresar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modalAcciones = document.getElementById("modalAcciones");
        modalAcciones.close();
        const id = btn.dataset.id;
        const nombre = btn.dataset.nombre;
        const apellido = btn.dataset.apellido;
        const dni = btn.dataset.dni;
        const alojamiento = btn.dataset.alojado;
        const Origen = btn.dataset.origen;
        console.log(
          "ID:",
          id,
          "Nombre:",
          nombre,
          "Apellido:",
          apellido,
          "DNI:",
          dni,
        );
        console.log("ALOJAMIENTO: ", Origen);
        const nombreyapellido = document.createElement("h6");
        nombreyapellido.textContent = `DETENIDO: ${nombre}, ${apellido}`;
        nombreyapellido.className = "text-black fw-bold fst-italic fs-6";
        datosPersonalesRegresar.appendChild(nombreyapellido);
        const dniElement = document.createElement("h6");
        dniElement.textContent = `DNI: ${dni}`;
        dniElement.className = "text-black fw-bold fst-italic fs-6";
        datosPersonalesRegresar.appendChild(dniElement);
        datosPersonalesRegresar.className = "px-3";
        const unidadAlojado = document.createElement("input");
        unidadAlojado.type = "hidden";
        unidadAlojado.value = Origen;
        unidadAlojado.name = "unidadAlojado";
        unidadAlojado.id = "unidadAlojado";
        origenAlojamiento.appendChild(unidadAlojado);
        formRegresar.action = `/regresar_detenido/${id}`;
        mimodalRegresar.showModal();
      });
    });

    document.querySelectorAll(".cerrarModalRegresar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const datosPersonalesRegresar = document.getElementById(
          "datosPersonalesRegresar",
        );
        datosPersonalesRegresar.innerHTML = "";
        mimodalRegresar.close();
      });
    });

    //MODAL DETALLE DETENIDO
    const mimodalDetalle = document.getElementById("mimodalDetalle");
    const datosColumna1 = document.getElementById("datosColumna1");
    const datosColumna2 = document.getElementById("datosColumna2");
    const datosColumna3 = document.getElementById("datosColumna3");

    document.querySelectorAll(".abrir-modal-detalle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const detalle = document.querySelector(`#detalle-${id}`).value;
        const nombre = btn.dataset.nombre;
        const apellido = btn.dataset.apellido;
        const dni = btn.dataset.dni;
        const dependencia = btn.dataset.dependencia;
        const sexo = btn.dataset.sexo;
        const domicilio = btn.dataset.domicilio;
        const localidad = btn.dataset.localidad;
        const provincia = btn.dataset.provincia;
        const fechaNacimiento = btn.dataset.fechanacimiento;
        const fecha = new Date(fechaNacimiento);
        const fechaformateada =
          fecha.getDate() +
          "/" +
          (fecha.getMonth() + 1) +
          "/" +
          fecha.getFullYear();
        let alojado = btn.dataset.alojado;
        const unidad_destino = btn.dataset.detdestino;
        const frente = btn.dataset.frente;
        console.log("DETALLE CODIFICADO: ", detalle);
        let partes = detalle.split(",");
        let oficio = partes[0];
        let institucion = partes[1];
        let direccion = partes[2];
        let personal = partes[3];
        let observaciones = partes[4];
        const fotoPerfil = document.createElement("img");
        if (frente) {
          fotoPerfil.src = frente;
          fotoPerfil.alt = "Foto de perfil";
          fotoPerfil.classList.add(
            "mb-3",
            "tamanioImagen4",
            "border",
            "border-3",
            "border-primary",
          );
        } else {
          fotoPerfil.src = "/img/perfil.ico";
          fotoPerfil.alt = "Foto de perfil por defecto";
        }
        datosColumna1.appendChild(fotoPerfil);
        const tituloDetenido = document.createElement("h6");
        tituloDetenido.innerHTML = `<strong>APELLIDO Y NOMBRE:</strong> ${apellido}, ${nombre}`;
        datosColumna2.appendChild(tituloDetenido);
        const dniElement = document.createElement("h6");
        dniElement.innerHTML = `<strong>DNI:</strong> ${dni}`;
        datosColumna2.appendChild(dniElement);
        const alojadoElement = document.createElement("h6");
        alojadoElement.innerHTML = `<strong>ALOJADO:</strong> ${unidad_destino}`;
        datosColumna2.appendChild(alojadoElement);
        const sexoElement = document.createElement("h6");
        sexoElement.innerHTML = `<strong>SEXO:</strong> ${sexo}`;
        datosColumna2.appendChild(sexoElement);
        const fechaNacimientoElement = document.createElement("h6");
        fechaNacimientoElement.innerHTML = `<strong>FECHA NACIMIENTO:</strong> ${fechaformateada}`;
        datosColumna2.appendChild(fechaNacimientoElement);
        const domicilioElement = document.createElement("h6");
        domicilioElement.innerHTML = `<strong>DOMICILIO:</strong> ${domicilio}`;
        datosColumna2.appendChild(domicilioElement);
        const localidadElement = document.createElement("h6");
        localidadElement.innerHTML = `<strong>LOCALIDAD:</strong> ${localidad}`;
        datosColumna2.appendChild(localidadElement);
        const provinciaElement = document.createElement("h6");
        provinciaElement.innerHTML = `<strong>PROVINCIA:</strong> ${provincia}`;
        datosColumna2.appendChild(provinciaElement);
        console.log("ALOJADO: ", alojado);
        if (
          alojado.trim() === "HOSPITAL" ||
          alojado.trim() === "CLINICA" ||
          alojado.trim() === "SANATORIO"
        ) {
          const institucionElement = document.createElement("h6");
          institucionElement.textContent = `${institucion}`;
          datosColumna2.appendChild(institucionElement);
          const direccionElement = document.createElement("h6");
          direccionElement.textContent = `${direccion}`;
          datosColumna2.appendChild(direccionElement);
          const observacionesElement = document.createElement("h6");
          observacionesElement.textContent = `${observaciones}`;
          datosColumna2.appendChild(observacionesElement);
        }
        const buttonElement = document.createElement("button");
        buttonElement.type = "button";
        buttonElement.className =
          "btn btn-danger-strong border border-1 border-black px-4";
        buttonElement.textContent = "Cerrar";
        buttonElement.addEventListener("click", () => {
          datosColumna1.innerHTML = "";
          datosColumna2.innerHTML = "";
          datosColumna3.innerHTML = "";
          mimodalDetalle.close();
        });
        datosColumna3.appendChild(buttonElement);
        const enlaceElement = document.createElement("a");
        enlaceElement.href = `/causa_detenido/${id}`;
        enlaceElement.className =
          "btn btn-primary border border-1 border-black";
        enlaceElement.textContent = "Ver causas";
        datosColumna3.appendChild(enlaceElement);
        console.log(id);
        mimodalDetalle.showModal();
        console.log(id);
      });
    });

    document.querySelectorAll(".cerrarModalDetalle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const datosColumna1 = document.getElementById("datosColumna1");
        const datosColumna2 = document.getElementById("datosColumna2");
        datosColumna1.innerHTML = "";
        datosColumna2.innerHTML = "";
        datosColumna3.innerHTML = "";
        mimodalDetalle.close();
      });
    });

    //MODAL TRASLADAR DETENIDO
    const formTrasladar = document.getElementById("formTrasladar");
    const datosPersonales3 = document.getElementById("datosPersonales3");
    const mimodalTrasladar = document.getElementById("mimodalTrasladar");
    document.querySelectorAll(".abrir-modal-trasladar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modalAcciones = document.getElementById("modalAcciones");
        modalAcciones.close();
        const id = btn.dataset.id;
        const nombre = btn.dataset.nombre;
        const apellido = btn.dataset.apellido;
        const dni = btn.dataset.dni;
        const nombreyapellido = document.createElement("h6");
        nombreyapellido.textContent = `DETENIDO: ${nombre}, ${apellido}`;
        nombreyapellido.className = "text-black fw-bold fst-italic fs-6";
        datosPersonales3.appendChild(nombreyapellido);
        const dniElement = document.createElement("h6");
        dniElement.textContent = `DNI: ${dni}`;
        dniElement.className = "text-black fw-bold fst-italic fs-6";
        datosPersonales3.appendChild(dniElement);
        datosPersonales3.className = "px-3";
        formTrasladar.action = `/trasladar_detenido/${id}`;
        mimodalTrasladar.showModal();
      });
    });

    document.querySelectorAll(".cerrarModalTraslado").forEach((btn) => {
      btn.addEventListener("click", () => {
        const datosPersonales3 = document.getElementById("datosPersonales3");
        datosPersonales3.innerHTML = "";
        mimodalTrasladar.close();
      });
    });

    /* CONTROL DE DATOS DE DATALIST */

    function vincularInputConDatalist(inputId, datalistId, hiddenId) {
      const input = document.getElementById(inputId);
      if (!input) return;
      const datalist = document.getElementById(datalistId);
      const hidden = document.getElementById(hiddenId);

      input.addEventListener("input", function () {
        const inputText = this.value;
        const option = datalist
          ? Array.from(datalist.options).find((opt) => opt.value === inputText)
          : null;
        if (hidden) hidden.value = option ? option.dataset.id : "";
      });
    }
    vincularInputConDatalist(
      "Comisaria_destino_nombre",
      "lista_comisarias_destino",
      "Comisaria_destino_id",
    );

    //FILTRO PARA BUSQUEDA TABLA
    document
      .getElementById("filtroBusqueda")
      .addEventListener("keyup", function () {
        const filtro = this.value.toLowerCase().trim();

        // Tabla (desktop)
        const filas = document.querySelectorAll("#tablaDetenidos tbody tr");
        filas.forEach((fila) => {
          const apellido = fila.cells[2].textContent.toLowerCase();
          const nombre = fila.cells[3].textContent.toLowerCase();
          const dni = fila.cells[4].textContent.toLowerCase();
          const dependencia = fila.cells[5].textContent.toLowerCase();
          const alojamiento = fila.cells[6].textContent.toLowerCase();

          fila.style.display =
            nombre.includes(filtro) ||
            apellido.includes(filtro) ||
            dni.includes(filtro) ||
            dependencia.includes(filtro) ||
            alojamiento.includes(filtro)
              ? ""
              : "none";
        });

        // Tarjetas (mobile)
        const cards = document.querySelectorAll(".d-block.d-md-none .card");
        cards.forEach((card) => {
          const nombre =
            card.querySelector("p.mb-2")?.textContent.toLowerCase() || "";
          const dni =
            card.querySelector("p:nth-of-type(2)")?.textContent.toLowerCase() ||
            "";
          const dependencia =
            card.querySelector("p:nth-of-type(3)")?.textContent.toLowerCase() ||
            "";

          if (
            nombre.includes(filtro) ||
            dni.includes(filtro) ||
            dependencia.includes(filtro)
          ) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
  }

  if (pageType === "agregar_detenido") {
    // ================= TOM SELECT =================
    document.addEventListener("DOMContentLoaded", function () {
      const provinciaSelect = new TomSelect("#Provincia_id", {
        create: false,
        sortField: { field: "text", direction: "asc" },
      });

      const localidadSelect = new TomSelect("#Localidad_id", {
        create: false,
        sortField: { field: "text", direction: "asc" },
      });

      const autoridadSelect = new TomSelect("#Autoridad_judicial_id", {
        create: false,
      });

      const comisariaDepSelect = new TomSelect("#Comisaria_dependiente_id", {
        create: false,
      });

      const comisariaAlojSelect = new TomSelect("#Comisaria_alojamiento_id", {
        create: false,
      });

      // ===== FILTRO LOCALIDAD SEGÚN PROVINCIA =====
      provinciaSelect.on("change", function (value) {
        const allOptions = { ...localidadSelect.options };

        localidadSelect.clear();
        localidadSelect.clearOptions();

        Object.values(allOptions).forEach((opt) => {
          if (!value || opt.$option.dataset.provincia == value) {
            localidadSelect.addOption({
              value: opt.value,
              text: opt.text,
            });
          }
        });

        localidadSelect.refreshOptions(false);
      });
    });

    // ================= VALIDACIONES (SE MANTIENEN) =================

    const apellidoInput = document.getElementById("Apellido");
    const nombreInput = document.getElementById("Nombre");
    const apellidoVictimaInput = document.getElementById("Apellido_victima");
    const nombreVictimaInput = document.getElementById("Nombre_victima");

    const validarSoloLetras = (input) => {
      input.addEventListener("keypress", function (e) {
        const char = String.fromCharCode(e.which);
        if (/[0-9]/.test(char)) e.preventDefault();
      });

      input.addEventListener("input", function () {
        this.value = this.value.replace(/[0-9]/g, "");
      });
    };

    if (apellidoInput) validarSoloLetras(apellidoInput);
    if (nombreInput) validarSoloLetras(nombreInput);
    if (apellidoVictimaInput) validarSoloLetras(apellidoVictimaInput);
    if (nombreVictimaInput) validarSoloLetras(nombreVictimaInput);

    // ================= CONFIRMACIÓN SUBMIT =================

    document.getElementById("formDetenido")?.addEventListener("submit", function (e) {
        e.preventDefault();

        Swal.fire({
          title: "¿Deseas guardar este detenido?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, guardar",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            e.target.submit();
          }
        });
      });

    // ================= FECHAS (TODO IGUAL) =================

    function diffFechasIntegrado(fecha1, fecha2) {
      fecha1 = new Date(fecha1);
      fecha2 = new Date(fecha2);
      let diffMs = Math.abs(fecha2 - fecha1);
      let diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      let diffAnios = Math.floor(diffDias / 365);
      let diffMeses = Math.floor((diffDias % 365) / 30);
      let diffDiasRestantes = diffDias - diffAnios * 365 - diffMeses * 30;

      return { anios: diffAnios, meses: diffMeses, dias: diffDiasRestantes };
    }

    function mostrarDiferenciaTiempo(fechaBase, fechaCumpleCondena) {
      let diff = diffFechasIntegrado(fechaBase, fechaCumpleCondena);

      document.getElementById("Diferencia-total").textContent =
        `${diff.anios} años, ${diff.meses} meses y ${diff.dias} días`;

      document.getElementById("Cantidad-dias").value = diff.dias;
      document.getElementById("Cantidad-meses").value = diff.meses;
      document.getElementById("Cantidad-anios").value = diff.anios;
    }

    // 🔹 Eventos de cambio en fecha y campos de cantidad
    document.getElementById("Fecha_cumple_condena2").addEventListener("change", function () {
        console.log("INGRESAA AL EVENTO DE CAMBIO DE FECHA");
        let fechaBase = new Date();
        fechaBase.setFullYear(fechaBase.getFullYear());
        fechaBase.setMonth(fechaBase.getMonth());
        fechaBase.setDate(fechaBase.getDate());

        let fechaCumpleCondena = new Date(this.value);
        console.log(fechaBase, fechaCumpleCondena);
        if (
          !isNaN(fechaBase.getTime()) &&
          !isNaN(fechaCumpleCondena.getTime())
        ) {
          mostrarDiferenciaTiempo(fechaBase, fechaCumpleCondena);
        }
      });
    document.getElementById("Cantidad-dias").addEventListener("change", actualizarFechaDesdeCampos);
    document.getElementById("Cantidad-meses").addEventListener("change", actualizarFechaDesdeCampos);
    document.getElementById("Cantidad-anios").addEventListener("change", actualizarFechaDesdeCampos);

    function actualizarFechaDesdeCampos() {
      let dias = parseInt(document.getElementById("Cantidad-dias").value) || 0;
      let meses = parseInt(document.getElementById("Cantidad-meses").value) || 0;
      let anios = parseInt(document.getElementById("Cantidad-anios").value) || 0;
      let fechaBase = new Date();
      fechaBase.setFullYear(fechaBase.getFullYear() + anios);
      fechaBase.setMonth(fechaBase.getMonth() + meses);
      fechaBase.setDate(fechaBase.getDate() + dias);
      document.getElementById("Fecha_cumple_condena2").valueAsDate = fechaBase;
      mostrarDiferenciaTiempo(new Date(), fechaBase);
    }

    // 🔹 Función para mostrar u ocultar campos de fecha (recibe ID)
    function toggleCamposFecha(mostrar, idDiv) {
      const divFecha = document.getElementById(idDiv);
      if (!divFecha) return;
      const campos = divFecha.querySelectorAll("input");
      if (mostrar) {
        divFecha.style.display = "block";
        campos.forEach((campo) => (campo.disabled = false));
      } else {
        divFecha.style.display = "none";
        campos.forEach((campo) => (campo.disabled = true));
      }
    }

    // 🔹 Función para mostrar u ocultar campos de fecha de cada tarjeta (recibe ID)
    function toggleCamposFechaTarjeta(index, mostrar) {
      const divFecha = document.getElementById(`divFecha-${index}`);
      if (!divFecha) return;
      const campos = divFecha.querySelectorAll("input");
      if (mostrar) {
        divFecha.style.display = "block";
        campos.forEach((campo) => (campo.disabled = false));
      } else {
        divFecha.style.display = "none";
        campos.forEach((campo) => (campo.disabled = true));
      }
    }

    // ================= SITUACIÓN PROCESAL =================

    const input = document.getElementById("Situacion_procesal");

    input?.addEventListener("change", function () {
      const val = this.value;
      const mostrar = val === "CONDENADO" || val === "PREVENTIVA";
      document.getElementById("divFecha").style.display = mostrar
        ? "block"
        : "none";
    });

    // ================= FECHA NACIMIENTO =================

    const fechaNacimientoInput = document.getElementById("Fecha_nacimiento");

    if (fechaNacimientoInput) {
      const hoy = new Date();
      const max = new Date(
        hoy.getFullYear() - 14,
        hoy.getMonth(),
        hoy.getDate(),
      );

      fechaNacimientoInput.max = max.toISOString().split("T")[0];
      fechaNacimientoInput.addEventListener("change", function () {
        const fecha = new Date(this.value);
        const edad = hoy.getFullYear() - fecha.getFullYear();
        if (edad < 14) {
          alert("Debe tener al menos 14 años");
          this.value = "";
        }
      });
    }

    // ========================   BUSQUEDA DE DETENIDO   ==========================

    let detenidoExistente = false;

    async function consultaDetenido(dni) {
      console.log("Consultando detenido con DNI:", dni); // 👈 debug
      if (dni.length === 8) {
        try {
          const consulta = await fetch(`/api/interleg/${dni}`);
          const data = await consulta.json();

          if (data.existe) {
            detenidoExistente = true;
            console.log("Detenido encontrado:", data); // 👈 debug
            let html = "";

            if (data.mysql) {
              const foto = data.mysql.frente
                ? data.mysql.frente
                : "/img/perfil.ico";

              html += `
              <p><b>Encontrado en SISPOL:</b><br>
              ${data.mysql.Nombre} ${data.mysql.Apellido}</p>
              <div class="mb-3">
                <img src="${foto}" alt="Frente" style="max-width: 50%; height: auto;">
              </div>
              <a href="/causa_detenido/${data.mysql.id_InternoLegajo}" class="btn btn-primary mb-2">Ver en sistema</a>
            `;
            }

            if (data.asp) {
              html += `
              <p><b>Encontrado en SISPENAL:</b><br>
              ${data.asp.nombre} ${data.asp.apellido}</p>
            `;
            }

            await Swal.fire({
              title: "Detenido encontrado",
              html: html,
              icon: "info",
              showDenyButton: true,
              denyButtonText: "Volver",
              showConfirmButton: false,
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isDenied) {
                window.location.href = "/detenidos";
              }
            });
          } else {
            console.log("No se encontró detenido con DNI:", dni); // 👈 debug
            detenidoExistente = false;
          }
        } catch (error) {
          console.error("Error al consultar detenido:", error);
        }
      }
    }

    let timeout;

    document.getElementById("Dni")?.addEventListener("blur", function () {
      clearTimeout(timeout);

      const dni = this.value.trim();

      timeout = setTimeout(() => {
        consultaDetenido(dni);
      }, 300);
    });
  }

  if (pageType === "modificar_detenido") {
    // ===== VALIDACIÓN DE APELLIDO Y NOMBRE - SOLO LETRAS =====
    const apellidoInput = document.getElementById("Apellido");
    const nombreInput = document.getElementById("Nombre");
    const apellidoVictimaInput = document.getElementById("Apellido_victima");
    const nombreVictimaInput = document.getElementById("Nombre_victima");

    const validarSoloLetras = (input) => {
      // Prevenir números en tiempo real
      input.addEventListener("keypress", function (e) {
        const char = String.fromCharCode(e.which);
        // Si es un número, prevenir la entrada
        if (/[0-9]/.test(char)) {
          e.preventDefault();
          return false;
        }
      });

      // Limpiar cualquier número que se haya pegado
      input.addEventListener("input", function (e) {
        this.value = this.value.replace(/[0-9]/g, "");
      });

      // Validar al perder el foco (por si acaso)
      input.addEventListener("blur", function () {
        if (this.value && /[0-9]/.test(this.value)) {
          alert("El campo " + this.id + " no puede contener números");
          this.value = this.value.replace(/[0-9]/g, "");
        }
      });
    };

    if (apellidoInput) validarSoloLetras(apellidoInput);
    if (nombreInput) validarSoloLetras(nombreInput);
    if (apellidoVictimaInput) validarSoloLetras(apellidoVictimaInput);
    if (nombreVictimaInput) validarSoloLetras(nombreVictimaInput);

    document.querySelectorAll("form.validar-datalists").forEach((form) => {
      const actualizarBtn = form.querySelector("button[type='submit']");

      if (!actualizarBtn) return;

      form.addEventListener("submit", function (e) {
        let valido = true;

        const validarCampoDatalist = (
          inputSelector,
          datalistId,
          hiddenSelector,
        ) => {
          const input = form.querySelector(inputSelector);
          const datalist = document.getElementById(datalistId);
          const hidden = form.querySelector(hiddenSelector);

          if (!input || !datalist || !hidden) return;

          const valor = input.value.trim();
          const match = Array.from(datalist.options).find(
            (opt) => opt.value === valor,
          );

          if (!match) {
            input.classList.add("is-invalid");
            hidden.value = "";
            valido = false;
          } else {
            input.classList.remove("is-invalid");
            hidden.value = match.dataset.id;
          }
        };

        // Validar solo si los campos están habilitados
        const camposValidables = [
          {
            input: ".input-comisaria-dependiente",
            datalist: "lista_comisarias_dependientes",
            hidden: ".hidden-comisaria-dependiente",
          },
          {
            input: ".input-comisaria-alojamiento",
            datalist: "lista_comisarias_alojamiento",
            hidden: ".hidden-comisaria-alojamiento",
          },
          {
            input: ".input-autoridad",
            datalist: "lista_autoridades",
            hidden: ".hidden-autoridad",
          },
        ];

        camposValidables.forEach((campo) => {
          const inputField = form.querySelector(campo.input);
          if (inputField && !inputField.hasAttribute("disabled")) {
            validarCampoDatalist(campo.input, campo.datalist, campo.hidden);
          }
        });

        if (!valido) {
          e.preventDefault();
          e.stopPropagation();
          alert(
            "Por favor seleccione opciones válidas de las listas desplegables.",
          );
          return;
        }

        // Si todo es válido, pedir confirmación
        e.preventDefault();
        Swal.fire({
          title: "¿Deseas actualizar datos del detenido?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, actualizar",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            form.submit();
          }
        });
      });
    });

    // ===== RESTRICCIÓN DE FECHA DE NACIMIENTO - MÍNIMO 14 AÑOS =====
    const fechaNacimientoInput = document.getElementById("Fecha_nacimiento");

    if (fechaNacimientoInput) {
      // Calcular la fecha máxima (hace 14 años desde hoy)
      const hoy = new Date();
      const fechaMaxima = new Date(
        hoy.getFullYear() - 14,
        hoy.getMonth(),
        hoy.getDate(),
      );

      // Convertir a formato YYYY-MM-DD para el atributo max
      const año = fechaMaxima.getFullYear();
      const mes = String(fechaMaxima.getMonth() + 1).padStart(2, "0");
      const día = String(fechaMaxima.getDate()).padStart(2, "0");

      fechaNacimientoInput.max = `${año}-${mes}-${día}`;

      // Validar al cambiar la fecha
      fechaNacimientoInput.addEventListener("change", function () {
        const fechaSeleccionada = new Date(this.value);
        const edad = hoy.getFullYear() - fechaSeleccionada.getFullYear();
        const mesActual = hoy.getMonth();
        const mesNacimiento = fechaSeleccionada.getMonth();

        // Ajustar si aún no ha cumplido años
        const edadReal =
          mesNacimiento > mesActual ||
          (mesNacimiento === mesActual &&
            hoy.getDate() < fechaSeleccionada.getDate())
            ? edad - 1
            : edad;

        if (edadReal < 14) {
          alert("La persona debe tener mínimo 14 años de edad.");
          this.value = "";
        }
      });
    }


  }

  if (pageType === "causa_detenido") {
    console.log("Script SweetAlert actualizar cargado");

    // Seleccion de situacion procesal y calculo de fecha de cumplimiento de condena ///////
    // LLAMO AL ELEMENTO DE SITUACIÓN PROCESAL PARA MOSTRAR U OCULTAR CAMPOS DE FECHA
    const input23 = document.getElementById("Situacion_procesal");
    input23?.addEventListener("change", function () {
      const val = this.value;
      const mostrar = val === "CONDENADO" || val === "PREVENTIVA";
      document.getElementById("divFecha").style.display = mostrar ? "block" : "none";
    });
    // LLAMO AL ELEMENTO DE FECHA DE CUMPLIMIENTO DE CONDENA PARA CALCULAR LA DIFERENCIA DE TIEMPO
    document.getElementById("Fecha_cumple_condena").addEventListener("change", function () {
        console.log("INGRESAA AL EVENTO DE CAMBIO DE FECHA");
        let fechaBase = new Date();
        fechaBase.setFullYear(fechaBase.getFullYear());
        fechaBase.setMonth(fechaBase.getMonth());
        fechaBase.setDate(fechaBase.getDate());

        let fechaCumpleCondena = new Date(this.value);
        console.log(fechaBase, fechaCumpleCondena);
        if (
          !isNaN(fechaBase.getTime()) &&
          !isNaN(fechaCumpleCondena.getTime())
        ) {
          mostrarDiferenciaTiempo(fechaBase, fechaCumpleCondena);
        }
      });

    // LLAMO A LOS ELEMENTOS DE CANTIDAD DE TIEMPO PARA CALCULAR LA FECHA DE CUMPLIMIENTO DE CONDENA
    document.getElementById("Cantidad-dias").addEventListener("change", actualizarFechaDesdeCampos);
    document.getElementById("Cantidad-meses").addEventListener("change", actualizarFechaDesdeCampos);
    document.getElementById("Cantidad-anios").addEventListener("change", actualizarFechaDesdeCampos);

    // FUNCION PARA CALCULAR LA FECHA DE CUMPLIMIENTO DE CONDENA A PARTIR DE LOS CAMPOS DE CANTIDAD DE TIEMPO
    function actualizarFechaDesdeCampos() {
      console.log("INGRESA AL EVENTO DE CAMBIO DE CANTIDAD");
      let dias = parseInt(document.getElementById("Cantidad-dias").value) || 0;
      let meses = parseInt(document.getElementById("Cantidad-meses").value) || 0;
      let anios = parseInt(document.getElementById("Cantidad-anios").value) || 0;
      let fechaBase = new Date();

      fechaBase.setFullYear(fechaBase.getFullYear() + anios);
      fechaBase.setMonth(fechaBase.getMonth() + meses);
      fechaBase.setDate(fechaBase.getDate() + dias);
      document.getElementById("Fecha_cumple_condena").valueAsDate = fechaBase;
      mostrarDiferenciaTiempo(new Date(), fechaBase);
    }
    // FUNCION PARA CALCULAR LA DIFERENCIA DE TIEMPO ENTRE DOS FECHAS Y MOSTRARLA EN EL HTML
    function mostrarDiferenciaTiempo(fechaBase, fechaCumpleCondena) {
      let diff = diffFechasIntegrado(fechaBase, fechaCumpleCondena);

      document.getElementById("Diferencia-total").textContent = `${diff.anios} años, ${diff.meses} meses y ${diff.dias} días`;
      document.getElementById("Cantidad-dias").value = diff.dias;
      document.getElementById("Cantidad-meses").value = diff.meses;
      document.getElementById("Cantidad-anios").value = diff.anios;
    }

    
    
    document.querySelectorAll(".form-actualizar-causa").forEach((form) => {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        Swal.fire({
          title: "¿Deseas actualizar esta causa?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, actualizar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#28a745",
          cancelButtonColor: "#d33",
        }).then((result) => {
          if (result.isConfirmed) {
            form.submit();
          }
        });
      });
    });

    // ================= SITUACIÓN PROCESAL =================

    
    const hoya = new Date().toISOString().split("T")[0];
    document.querySelectorAll("input[type='date']").forEach((input) => {
      if (!input.classList.contains("no-max-date")) {
        input.max = hoya;
      }else{
        input.min = hoya;
      }
    });

    const role = document.getElementById("main-container")?.dataset.role;
    const isAdmin = role === "ADMINISTRADOR";

    // Admin no debe recibir bloqueo automático porque a él se le permite editar siempre.
    if (isAdmin) return;

    const EDIT_WINDOW_MS = 120000; // 2 minutos

    document.querySelectorAll(".card[data-fecha-alta]").forEach((card) => {
      const canEdit = card.dataset.canEdit === "true";
      const fechaAlta = card.dataset.fechaAlta;
      if (!fechaAlta || !canEdit) return;

      const fechaAltaMs = new Date(fechaAlta).getTime();
      if (isNaN(fechaAltaMs)) return;

      const remaining = EDIT_WINDOW_MS - (Date.now() - fechaAltaMs);
      if (remaining <= 0) {
        if (card.dataset.expirationAlertShown === "true") return;

        card.dataset.expirationAlertShown = "true";
        Swal.fire({
          icon: "warning",
          title: "Tiempo expirado",
          text: "El periodo de edición de esta causa ha expirado. Recargue la pantalla para bloquear la edición.",
          confirmButtonText: "Recargar pantalla",
        }).then((result) => {
          if (result.isConfirmed) {
            location.reload();
          }
        });
        return;
      }
      setTimeout(() => {
        Swal.fire({
          icon: "warning",
          title: "Tiempo expirado",
          text: "El periodo de edición de esta causa ha expirado. Debes recargar para bloquear.",
          confirmButtonText: "Recargar pantalla",
        }).then((result) => {
          if (result.isConfirmed) location.reload();
        });
      }, remaining);
    });

    // FUNCION PARA PODER TENER CONTROL DE FECHAS DE CUMPLIMIENTO DE CONDENA

    // ================= FECHAS (TODO IGUAL) =================

    function diffFechasIntegrado(fecha1, fecha2) {
      fecha1 = new Date(fecha1);
      fecha2 = new Date(fecha2);
      let diffMs = Math.abs(fecha2 - fecha1);
      let diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      let diffAnios = Math.floor(diffDias / 365);
      let diffMeses = Math.floor((diffDias % 365) / 30);
      let diffDiasRestantes = diffDias - diffAnios * 365 - diffMeses * 30;

      return { anios: diffAnios, meses: diffMeses, dias: diffDiasRestantes };
    }

    

    // 🔹 Función para mostrar u ocultar campos de fecha (recibe ID)
    function toggleCamposFecha(mostrar, idDiv) {
      const divFecha = document.getElementById(idDiv);
      if (!divFecha) return;
      const campos = divFecha.querySelectorAll("input");
      if (mostrar) {
        divFecha.style.display = "block";
        campos.forEach((campo) => (campo.disabled = false));
      } else {
        divFecha.style.display = "none";
        campos.forEach((campo) => (campo.disabled = true));
      }
    }

    // 🔹 Función para mostrar u ocultar campos de fecha de cada tarjeta (recibe ID)
    function toggleCamposFechaTarjeta(index, mostrar) {
      const divFecha = document.getElementById(`divFecha-${index}`);
      if (!divFecha) return;
      const campos = divFecha.querySelectorAll("input");
      if (mostrar) {
        divFecha.style.display = "block";
        campos.forEach((campo) => (campo.disabled = false));
      } else {
        divFecha.style.display = "none";
        campos.forEach((campo) => (campo.disabled = true));
      }
    }

    // 🔹 Modal (campo único con ID fijo)
    const inputModal = document.getElementById("Situacion_procesal");
    if (inputModal) {
      inputModal.addEventListener("keyup", function () {
        const valor = this.value.trim().toUpperCase();
        if (valor === "CONDENADO" || valor === "PREVENTIVA") {
          toggleCamposFecha(true, "divFecha");
        } else {
          toggleCamposFecha(false, "divFecha");
        }
      });
    }

    const hoy = new Date().toISOString().split("T")[0];
    const fechaHecho = document.querySelector("#Fecha_hecho");
    const fechaDetencion = document.querySelector("#Fecha_Detencion");
    const fechaOficio = document.querySelector("#Oficio_Fecha");

    if (fechaHecho) fechaHecho.max = hoy;
    if (fechaDetencion) fechaDetencion.max = hoy;
    if (fechaOficio) fechaOficio.max = hoy;

    const input = document.getElementById("Situacion_procesal");
    const opciones = ["CONDENADO", "PROCESADO", "PREVENTIVA"];

    input.addEventListener("input", function () {
      this.value = this.value.toUpperCase();
      if (!opciones.some((op) => op.startsWith(this.value))) {
        this.value = "";
      }
    });
  }

  if (pageType === "foto_detenido") {
    // =========================
    // 📸 PREVIEW DE IMÁGENES
    // =========================
    window.mostrarVistaPrevia = function (event, previewId) {
      var input = event.target;
      var reader = new FileReader();

      reader.onload = function () {
        var dataURL = reader.result;
        var previewElement = document.getElementById(previewId);
        previewElement.innerHTML = "";
        var image = document.createElement("img");
        image.src = dataURL;
        image.style.width = "100%";
        image.style.maxWidth = "100%";
        image.style.height = "auto";
        image.style.borderRadius = "10px";
        image.classList.add("preview-img");
        previewElement.appendChild(image);
      };

      if (input.files && input.files[0]) {
        reader.readAsDataURL(input.files[0]);
      }
    };

    async function comprimirImagen(file, calidad = 0.7, maxWidth = 1200) {
      return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
          img.src = e.target.result;
        };

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = maxWidth / img.width;

          canvas.width = maxWidth;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            calidad,
          );
        };

        reader.readAsDataURL(file);
      });
    }

    // =========================
    // 🧠 FORM + VALIDACIONES
    // =========================
    const form = document.getElementById("form-fotos");
    const btnGuardar = document.getElementById("btnGuardar");

    if (form) {
      const canEditPhotos = form.dataset.canEdit === "true";
      const hasExistingPhotos = form.dataset.allPhotos === "true";

      const campos = [
        { name: "frente", label: "Frente" },
        { name: "izquierdo", label: "Izquierdo" },
        { name: "derecho", label: "Derecho" },
        { name: "espalda", label: "Espalda" },
      ];

      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      for (const c of campos) {
        const input = form.querySelector(`input[name="${c.name}"]`);
        if (input.files.length > 0) {
          const compressed = await comprimirImagen(input.files[0]);

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(compressed);
          input.files = dataTransfer.files;
        }
      }

      // =========================
      // 🔒 VALIDAR BOTÓN
      // =========================
      function validarEstadoBoton() {
        if (!canEditPhotos) {
          btnGuardar.disabled = true;
          return;
        }

        let anyNewFile = false;
        let requiredFilled = true;

        campos.forEach((c) => {
          const input = form.querySelector(`input[name="${c.name}"]`);

          if (input) {
            if (input.files && input.files.length > 0) {
              anyNewFile = true;
            }

            if (input.required && (!input.files || input.files.length === 0)) {
              requiredFilled = false;
            }
          }
        });

        // Si ya hay fotos y no se cambió ninguna, no habilitar guardar.
        if (hasExistingPhotos && !anyNewFile) {
          btnGuardar.disabled = true;
          return;
        }

        btnGuardar.disabled = !(requiredFilled && anyNewFile);
      }

      // =========================
      // 🎧 ESCUCHAR CAMBIOS
      // =========================
      const inputs = form.querySelectorAll('input[type="file"]');

      inputs.forEach((input) => {
        input.addEventListener("change", validarEstadoBoton);
      });

      // Ejecutar al cargar
      validarEstadoBoton();

      // =========================
      // 🚀 SUBMIT
      // =========================
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        const errores = [];

        campos.forEach((c) => {
          const input = form.querySelector(`input[name="${c.name}"]`);

          if (!input || !input.files || input.files.length === 0) {
            errores.push(`Falta la imagen: ${c.label}`);
          } else {
            const file = input.files[0];

            if (!allowedTypes.includes(file.type)) {
              errores.push(`${c.label}: formato no permitido (${file.type})`);
            }

            if (file.size > maxSize) {
              errores.push(`${c.label}: supera 5MB`);
            }
          }
        });

        // ❌ Si hay errores
        if (errores.length) {
          btnGuardar.disabled = true;

          Swal.fire({
            icon: "error",
            title: "Error en las fotos",
            html: errores.map((e) => `<div>${e}</div>`).join(""),
          });

          return;
        }

        // ✅ Confirmación
        Swal.fire({
          title: "Confirmar subida",
          text: "¿Querés guardar las 4 fotos del detenido?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, guardar",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            form.submit();
          }
        });
      });

      // =========================
      // 🚨 ERROR DESDE BACKEND
      // =========================
      const alertDiv = document.querySelector(".alert.alert-danger");

      if (alertDiv) {
        Swal.fire({
          icon: "error",
          title: "Error",
          html: alertDiv.innerHTML,
        });
      }
    }
  }

  if (pageType === "movimientos_comisarias"){
    //FILTRO PARA BUSQUEDA TABLA
    document.getElementById("filtroBusqueda").addEventListener("keyup", function () {
        const filtro = this.value.toLowerCase().trim();
        // Tabla (desktop)
        const filas = document.querySelectorAll("#tablaMovimientos tbody tr");
        filas.forEach((fila) => {
          const apellido = fila.cells[1].textContent.toLowerCase();
          const dni = fila.cells[2].textContent.toLowerCase();
          const alojamiento = fila.cells[3].textContent.toLowerCase();
          const destino = fila.cells[4].textContent.toLowerCase();
          const tipo = fila.cells[6].textContent.toLowerCase();
          const usuario = fila.cells[7].textContent.toLowerCase();

          fila.style.display =
            apellido.includes(filtro) ||
            dni.includes(filtro) ||
            alojamiento.includes(filtro) ||
            destino.includes(filtro) ||
            tipo.includes(filtro) ||
            usuario.includes(filtro)
              ? ""
              : "none";
        });
      });
  }
  
});
