/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Role_Permissions_BodyInputs */

const en_demo_narrative_admin_role_permissions_body = /** @type {(inputs: Demo_Narrative_Admin_Role_Permissions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The permission matrix on the people page shows which capabilities each role grants, with fifty permissions arranged across eight capability groups.
**Capability groups.** The permissions are organized by the area they govern rather than by which role holds them. Groups cover the case record, reaching a client, the client's access to a case, client records, the knowledge base, queues, intake, and running the organization. Because grouping and role level are independent, a permission's group does not tell the reader which role holds it by default.
**Defaults and overrides.** Each role ships with a default permission set, and the organization can change any permission that is not locked by toggling its cell. The first two role names are defaults the organization can rename in terminology settings, while administrator is fixed. Toggling a cell takes effect immediately for every user holding that role, and cells that have been changed from their default are marked.
**Locked permissions.** Three permissions stay with the administrator role regardless of overrides and cannot be toggled away. They protect key management, role management, and infrastructure configuration, and the enforcement applies when permissions are written and when they are read, so a row inserted straight into the database granting one of them to another role has no effect.
**Queue membership scope.** Adding a user to a queue grants them read access to every case in that queue, so the scope of granting the Manage queue membership permission is wider than it appears.
**Intake response decryption.** The View intake responses permission controls who receives decryption keys when a form is submitted, and revoking it later does not take back keys already issued.
**Not yet available.** Four permissions are declared but have no feature behind them yet, and granting one changes nothing until the feature is built.
**Reset.** Resetting the matrix returns every permission to its shipped default after a confirmation dialog.
**Permissions.** Changing the matrix requires the Manage roles permission.`)
};

const es_demo_narrative_admin_role_permissions_body = /** @type {(inputs: Demo_Narrative_Admin_Role_Permissions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La matriz de permisos en la página de personas muestra qué capacidades otorga cada rol, con cincuenta permisos distribuidos en ocho grupos de capacidades.
**Grupos de capacidades.** Los permisos se organizan según el área que gobiernan y no según qué rol los tiene. Los grupos cubren el registro del caso, contactar a un cliente, el acceso del cliente al caso, registros de clientes, la base de conocimiento, colas, admisión y gestión de la organización. Como la agrupación y el nivel de rol son ejes independientes, el grupo de un permiso no indica qué rol lo tiene por defecto.
**Valores predeterminados y anulaciones.** Cada rol viene con un conjunto de permisos predeterminados, y la organización puede cambiar cualquier permiso que no esté bloqueado activando o desactivando su celda. Los dos primeros nombres de rol son predeterminados que la organización puede renombrar en la configuración de terminología, mientras que administrador es fijo. Activar o desactivar una celda surte efecto inmediatamente para todas las personas usuarias con ese rol, y las celdas modificadas respecto a su valor predeterminado quedan marcadas.
**Permisos bloqueados.** Tres permisos permanecen con el rol de administrador sin importar las anulaciones y no se pueden desactivar. Protegen la gestión de claves, la gestión de roles y la configuración de infraestructura, y la restricción se aplica tanto al escribir como al leer, de modo que una fila insertada manualmente en la base de datos otorgando uno de ellos a otro rol no tiene efecto.
**Alcance de la membresía de colas.** Añadir a una persona usuaria a una cola le otorga acceso de lectura a todos los casos en ella, por lo que el alcance de otorgar el permiso Gestionar membresía de colas es más amplio de lo que aparenta.
**Descifrado de respuestas de admisión.** El permiso Ver respuestas de admisión controla quién recibe claves de descifrado cuando se envía un formulario, y revocarlo después no retira claves ya emitidas.
**Aún no disponible.** Cuatro permisos están declarados pero aún no tienen funcionalidad detrás, y otorgar uno no cambia nada hasta que la función se construya.
**Restablecer.** Restablecer la matriz devuelve todos los permisos a sus valores predeterminados de fábrica tras un diálogo de confirmación.
**Permisos.** Cambiar la matriz requiere el permiso Gestionar roles.`)
};

/**
* | output |
* | --- |
* | "The permission matrix on the people page shows which capabilities each role grants, with fifty permissions arranged across eight capability groups. **Capabil..." |
*
* @param {Demo_Narrative_Admin_Role_Permissions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_role_permissions_body = /** @type {((inputs?: Demo_Narrative_Admin_Role_Permissions_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Role_Permissions_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_role_permissions_body(inputs)
	return en_demo_narrative_admin_role_permissions_body(inputs)
});