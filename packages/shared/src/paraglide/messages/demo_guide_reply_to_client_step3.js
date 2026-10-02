/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Reply_To_Client_Step3Inputs */

const en_demo_guide_reply_to_client_step3 = /** @type {(inputs: Demo_Guide_Reply_To_Client_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Type a reply and tap Send message.`)
};

const es_demo_guide_reply_to_client_step3 = /** @type {(inputs: Demo_Guide_Reply_To_Client_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe una respuesta y toca Enviar mensaje.`)
};

const en_xa2_demo_guide_reply_to_client_step3 = /** @type {(inputs: Demo_Guide_Reply_To_Client_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Typè à rèply ànd tàp Sènd mèssàgè. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Type a reply and tap Send message." |
*
* @param {Demo_Guide_Reply_To_Client_Step3Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_reply_to_client_step3 = /** @type {((inputs?: Demo_Guide_Reply_To_Client_Step3Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Reply_To_Client_Step3Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_reply_to_client_step3(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_reply_to_client_step3(inputs)
	return en_demo_guide_reply_to_client_step3(inputs)
});