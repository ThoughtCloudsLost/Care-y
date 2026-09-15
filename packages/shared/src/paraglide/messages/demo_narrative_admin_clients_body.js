/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Clients_BodyInputs */

const en_demo_narrative_admin_clients_body = /** @type {(inputs: Demo_Narrative_Admin_Clients_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The client list shows all clients who have contacted the organization, and each record links to the client's associated tickets.
**Encryption.** Client identifiers are encrypted with the organization key before storage, so the server cannot read them and a database breach reveals no names.
**Visibility.** The alias is visible to any user who holds the organization key, but full contact details such as phone number and email address are separately gated by the View client PII permission.
**Permissions.** Viewing the client list requires the View clients permission, editing contact information and aliases each require their own permission, and merging requires the Merge clients permission.`)
};

const es_demo_narrative_admin_clients_body = /** @type {(inputs: Demo_Narrative_Admin_Clients_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de clientes muestra todos los clientes que han contactado a la organización, y cada registro enlaza a los tickets asociados del cliente.
**Cifrado.** Los identificadores de los clientes se cifran con la clave de la organización antes de almacenarse, de modo que el servidor no puede leerlos y una filtración de la base de datos no revela nombres.
**Visibilidad.** El alias es visible para cualquier persona usuaria que tenga la clave de la organización, pero los datos de contacto completos como número de teléfono y correo electrónico están controlados por separado mediante el permiso Ver datos personales del cliente.
**Permisos.** Ver la lista de clientes requiere el permiso Ver clientes, editar la información de contacto y los alias requiere cada uno su propio permiso, y fusionar requiere el permiso Fusionar clientes.`)
};

/**
* | output |
* | --- |
* | "The client list shows all clients who have contacted the organization, and each record links to the client's associated tickets. **Encryption.** Client ident..." |
*
* @param {Demo_Narrative_Admin_Clients_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_clients_body = /** @type {((inputs?: Demo_Narrative_Admin_Clients_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Clients_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_clients_body(inputs)
	return en_demo_narrative_admin_clients_body(inputs)
});