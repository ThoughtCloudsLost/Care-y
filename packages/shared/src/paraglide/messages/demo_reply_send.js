/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Reply_SendInputs */

const en_demo_reply_send = /** @type {(inputs: Demo_Reply_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send`)
};

const es_demo_reply_send = /** @type {(inputs: Demo_Reply_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar`)
};

const en_xa2_demo_reply_send = /** @type {(inputs: Demo_Reply_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd ••⟧`)
};

/**
* | output |
* | --- |
* | "Send" |
*
* @param {Demo_Reply_SendInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_reply_send = /** @type {((inputs?: Demo_Reply_SendInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Reply_SendInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_reply_send(inputs)
	if (locale === "en-XA") return en_xa2_demo_reply_send(inputs)
	return en_demo_reply_send(inputs)
});