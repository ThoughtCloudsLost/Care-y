/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Quick_Actions_BodyInputs */

const en_demo_narrative_topic_quick_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quick actions let volunteers perform common operations on a ticket without opening it. Swipe a ticket row to access them.
**Swipe directions.** Swipe right to reply or start a call. Swipe left to assign or place on hold. A short swipe peeks the action tray, and a longer swipe fires the action directly.
**Available actions.** Reply, call, assign, and hold. The specific actions shown depend on the ticket's current state and the volunteer's permissions.
**Cards view.** In cards view the same actions also appear as a visible button row on each card, so no swipe is needed to reach them.
**Encryption.** Actions that modify ticket data encrypt the changes in the browser before sending them to the server.`)
};

const es_demo_narrative_topic_quick_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las acciones rapidas permiten a los voluntarios realizar operaciones comunes en un ticket sin abrirlo. Desliza una fila de ticket para acceder a ellas.
**Direcciones de deslizamiento.** Desliza a la derecha para responder o iniciar una llamada. Desliza a la izquierda para asignar o poner en espera. Un deslizamiento corto muestra la bandeja de acciones, y un deslizamiento mas largo ejecuta la accion directamente.
**Acciones disponibles.** Responder, llamar, asignar y poner en espera. Las acciones especificas mostradas dependen del estado actual del ticket y los permisos del voluntario.
**Vista de tarjetas.** En la vista de tarjetas las mismas acciones tambien aparecen como una fila de botones visibles en cada tarjeta, por lo que no se necesita deslizar para acceder a ellas.
**Cifrado.** Las acciones que modifican datos del ticket cifran los cambios en el navegador antes de enviarlos al servidor.`)
};

/**
* | output |
* | --- |
* | "Quick actions let volunteers perform common operations on a ticket without opening it. Swipe a ticket row to access them. **Swipe directions.** Swipe right t..." |
*
* @param {Demo_Narrative_Topic_Quick_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_quick_actions_body = /** @type {((inputs?: Demo_Narrative_Topic_Quick_Actions_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Quick_Actions_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_quick_actions_body(inputs)
	return es_demo_narrative_topic_quick_actions_body(inputs)
});