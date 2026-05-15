/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Push_SendInputs */

const en_twofa_push_send = /** @type {(inputs: Twofa_Push_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send notification`)
};

const es_twofa_push_send = /** @type {(inputs: Twofa_Push_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar notificación`)
};

/**
* | output |
* | --- |
* | "Send notification" |
*
* @param {Twofa_Push_SendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_push_send = /** @type {((inputs?: Twofa_Push_SendInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Push_SendInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_push_send(inputs)
	return es_twofa_push_send(inputs)
});