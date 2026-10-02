/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Client_Portal_Reply_Step2Inputs */

const en_demo_guide_client_portal_reply_step2 = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Read the message thread.`)
};

const es_demo_guide_client_portal_reply_step2 = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lee el hilo de mensajes.`)
};

const en_xa2_demo_guide_client_portal_reply_step2 = /** @type {(inputs: Demo_Guide_Client_Portal_Reply_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèàd thè mèssàgè thrèàd. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Read the message thread." |
*
* @param {Demo_Guide_Client_Portal_Reply_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_client_portal_reply_step2 = /** @type {((inputs?: Demo_Guide_Client_Portal_Reply_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Client_Portal_Reply_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_client_portal_reply_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_client_portal_reply_step2(inputs)
	return en_demo_guide_client_portal_reply_step2(inputs)
});