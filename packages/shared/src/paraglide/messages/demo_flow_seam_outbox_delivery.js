/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Seam_Outbox_DeliveryInputs */

const en_demo_flow_seam_outbox_delivery = /** @type {(inputs: Demo_Flow_Seam_Outbox_DeliveryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email and text messages are delivered to an outbox inside the handbook. Nothing is sent to a real address or phone number.`)
};

const es_demo_flow_seam_outbox_delivery = /** @type {(inputs: Demo_Flow_Seam_Outbox_DeliveryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los correos y los mensajes de texto se entregan a un buzón dentro del manual. No se envía nada a una dirección o un número real.`)
};

const en_xa2_demo_flow_seam_outbox_delivery = /** @type {(inputs: Demo_Flow_Seam_Outbox_DeliveryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl ànd tèxt mèssàgès àrè dèlìvèrèd tò àn òùtbòx ìnsìdè thè hàndbòòk. Nòthìng ìs sènt tò à rèàl àddrèss òr phònè nùmbèr. •••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Email and text messages are delivered to an outbox inside the handbook. Nothing is sent to a real address or phone number." |
*
* @param {Demo_Flow_Seam_Outbox_DeliveryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_outbox_delivery = /** @type {((inputs?: Demo_Flow_Seam_Outbox_DeliveryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Seam_Outbox_DeliveryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_seam_outbox_delivery(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_seam_outbox_delivery(inputs)
	return en_demo_flow_seam_outbox_delivery(inputs)
});