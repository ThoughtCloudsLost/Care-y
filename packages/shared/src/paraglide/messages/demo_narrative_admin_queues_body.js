/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Queues_BodyInputs */

const en_demo_narrative_admin_queues_body = /** @type {(inputs: Demo_Narrative_Admin_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queues control how tickets are organized and routed. Administrators create queues, assign volunteers to them, and configure sort order and appearance.
**Lifecycle.** Deleting a queue prompts for another queue to receive its tickets, so nothing is orphaned. One queue can be designated as the intake queue that receives tickets from incoming calls.
**Encryption.** Queue names, colors, and icons are encrypted with the organization key before storage. The server stores ciphertext and the browser decrypts them locally for display.`)
};

const es_demo_narrative_admin_queues_body = /** @type {(inputs: Demo_Narrative_Admin_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las colas controlan como se organizan y enrutan los tickets. Los administradores crean colas, asignan voluntarios a ellas y configuran el orden y la apariencia.
**Ciclo de vida.** Eliminar una cola solicita otra cola para recibir sus tickets, para que nada quede huérfano. Una cola puede designarse como la cola de recepción que recibe tickets de llamadas entrantes.
**Cifrado.** Los nombres, colores e iconos de las colas se cifran con la clave de la organización antes de almacenarse. El servidor almacena texto cifrado y el navegador los descifra localmente para mostrarlos.`)
};

/**
* | output |
* | --- |
* | "Queues control how tickets are organized and routed. Administrators create queues, assign volunteers to them, and configure sort order and appearance. **Life..." |
*
* @param {Demo_Narrative_Admin_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_queues_body = /** @type {((inputs?: Demo_Narrative_Admin_Queues_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Queues_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_queues_body(inputs)
	return es_demo_narrative_admin_queues_body(inputs)
});