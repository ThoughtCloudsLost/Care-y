/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Quick_Actions_BodyInputs */

const en_demo_narrative_topic_quick_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Common operations on a ticket without opening it, accessed by swiping a ticket row.
**Swipe directions.** Swipe right to reply. Swipe left to assign or place a ticket on hold. A short swipe peeks the action tray, and a longer swipe fires the action directly.
**Available actions.** Reply, assign, and hold. The specific actions shown depend on the ticket's current state and the volunteer's permissions.
**Cards view.** In cards view the same actions also appear as a visible button row on each card, so no swipe is needed to reach them.
**Encryption.** Actions that modify ticket data encrypt the changes in the browser before sending them to the server.`)
};

const es_demo_narrative_topic_quick_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Operaciones comunes en un ticket sin abrirlo, accesibles deslizando una fila de ticket.
**Direcciones de deslizamiento.** Deslizar a la derecha para responder. Deslizar a la izquierda para asignar o poner un ticket en espera. Un deslizamiento corto muestra la bandeja de acciones, y un deslizamiento más largo ejecuta la acción directamente.
**Acciones disponibles.** Responder, asignar y poner en espera. Las acciones específicas mostradas dependen del estado actual del ticket y los permisos del voluntario.
**Vista de tarjetas.** En la vista de tarjetas las mismas acciones también aparecen como una fila de botones visibles en cada tarjeta, por lo que no se necesita deslizar para acceder a ellas.
**Cifrado.** Las acciones que modifican datos del ticket cifran los cambios en el navegador antes de enviarlos al servidor.`)
};

const en_xa2_demo_narrative_topic_quick_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmmòn òpèràtìòns òn à tìckèt wìthòùt òpènìng ìt, àccèssèd by swìpìng à tìckèt ròw.
 ••••••••••••••••••••••••••**Swìpè dìrèctìòns. ••••••** Swìpè rìght tò rèply. Swìpè lèft tò àssìgn òr plàcè à tìckèt òn hòld. À shòrt swìpè pèèks thè àctìòn trày, ànd à lòngèr swìpè fìrès thè àctìòn dìrèctly.
 •••••••••••••••••••••••••••••••••••••••••••••••**Àvàìlàblè àctìòns. ••••••** Rèply, àssìgn, ànd hòld. Thè spècìfìc àctìòns shòwn dèpènd òn thè tìckèt's cùrrènt stàtè ànd thè vòlùntèèr's pèrmìssìòns.
 •••••••••••••••••••••••••••••••••••••**Càrds vìèw. ••••** Ìn càrds vìèw thè sàmè àctìòns àlsò àppèàr às à vìsìblè bùttòn ròw òn èàch càrd, sò nò swìpè ìs nèèdèd tò rèàch thèm.
 ••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Àctìòns thàt mòdìfy tìckèt dàtà èncrypt thè chàngès ìn thè bròwsèr bèfòrè sèndìng thèm tò thè sèrvèr. •••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Common operations on a ticket without opening it, accessed by swiping a ticket row. **Swipe directions.** Swipe right to reply. Swipe left to assign or place..." |
*
* @param {Demo_Narrative_Topic_Quick_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_quick_actions_body = /** @type {((inputs?: Demo_Narrative_Topic_Quick_Actions_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Quick_Actions_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_quick_actions_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_quick_actions_body(inputs)
	return en_demo_narrative_topic_quick_actions_body(inputs)
});