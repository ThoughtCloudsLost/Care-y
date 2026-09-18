/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Queues_BodyInputs */

const en_demo_narrative_admin_queues_body = /** @type {(inputs: Demo_Narrative_Admin_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queues control how tickets are organized and routed.
**Lifecycle.** Deleting a queue prompts for another queue to receive its tickets, so nothing is orphaned, and one queue can be designated as the intake queue that receives tickets from incoming calls.
**Encryption.** Queue names, colors, and icons are encrypted with the organization key before storage, so the server cannot read them and the browser decrypts them locally for display.
**Permissions.** Queue management requires the Manage queues permission. Separately, the Manage queue membership permission controls who can assign users to queues, and adding someone to a queue grants them read access to every case in it.`)
};

const es_demo_narrative_admin_queues_body = /** @type {(inputs: Demo_Narrative_Admin_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las colas controlan cómo se organizan y enrutan los tickets.
**Ciclo de vida.** Eliminar una cola solicita otra cola para recibir sus tickets, para que nada quede huérfano, y una cola puede designarse como la cola de recepción que recibe tickets de llamadas entrantes.
**Cifrado.** Los nombres, colores e iconos de las colas se cifran con la clave de la organización antes de almacenarse, de modo que el servidor no puede leerlos y el navegador los descifra localmente para mostrarlos.
**Permisos.** La gestión de colas requiere el permiso Gestionar colas. Por separado, el permiso Gestionar membresía de colas controla quién puede asignar personas a colas, y añadir a alguien a una cola le otorga acceso de lectura a todos los casos en ella.`)
};

/**
* | output |
* | --- |
* | "Queues control how tickets are organized and routed. **Lifecycle.** Deleting a queue prompts for another queue to receive its tickets, so nothing is orphaned..." |
*
* @param {Demo_Narrative_Admin_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_queues_body = /** @type {((inputs?: Demo_Narrative_Admin_Queues_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Queues_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_queues_body(inputs)
	return en_demo_narrative_admin_queues_body(inputs)
});