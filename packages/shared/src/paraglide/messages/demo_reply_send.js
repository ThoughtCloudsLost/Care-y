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

/**
* | output |
* | --- |
* | "Send" |
*
* @param {Demo_Reply_SendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_reply_send = /** @type {((inputs?: Demo_Reply_SendInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Reply_SendInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_reply_send(inputs)
	return es_demo_reply_send(inputs)
});