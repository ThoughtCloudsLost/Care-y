/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Reply_To_Client_Step1Inputs */

const en_demo_guide_reply_to_client_step1 = /** @type {(inputs: Demo_Guide_Reply_To_Client_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open a ticket.`)
};

const es_demo_guide_reply_to_client_step1 = /** @type {(inputs: Demo_Guide_Reply_To_Client_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre un ticket.`)
};

const en_xa2_demo_guide_reply_to_client_step1 = /** @type {(inputs: Demo_Guide_Reply_To_Client_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn à tìckèt. •••••⟧`)
};

/**
* | output |
* | --- |
* | "Open a ticket." |
*
* @param {Demo_Guide_Reply_To_Client_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_reply_to_client_step1 = /** @type {((inputs?: Demo_Guide_Reply_To_Client_Step1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Reply_To_Client_Step1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_reply_to_client_step1(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_reply_to_client_step1(inputs)
	return en_demo_guide_reply_to_client_step1(inputs)
});