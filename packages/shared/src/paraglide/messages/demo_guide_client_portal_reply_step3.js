/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Client_Portal_Reply_Step3Inputs */

const en_demo_guide_client_portal_reply_step3 = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Type a reply and send it.`)
};

const es_demo_guide_client_portal_reply_step3 = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe una respuesta y envíala.`)
};

const en_xa2_demo_guide_client_portal_reply_step3 = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Typè à rèply ànd sènd ìt. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Type a reply and send it." |
*
* @param {Demo_Guide_Client_Portal_Reply_Step3Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_client_portal_reply_step3 = /** @type {((inputs?: Demo_Guide_Client_Portal_Reply_Step3Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Client_Portal_Reply_Step3Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_client_portal_reply_step3(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_client_portal_reply_step3(inputs)
	return en_demo_guide_client_portal_reply_step3(inputs)
});