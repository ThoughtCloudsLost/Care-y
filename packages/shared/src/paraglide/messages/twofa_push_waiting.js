/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Push_WaitingInputs */

const en_twofa_push_waiting = /** @type {(inputs: Twofa_Push_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Waiting for approval...`)
};

const es_twofa_push_waiting = /** @type {(inputs: Twofa_Push_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esperando aprobación...`)
};

const en_xa2_twofa_push_waiting = /** @type {(inputs: Twofa_Push_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wàìtìng fòr àppròvàl... •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Waiting for approval..." |
*
* @param {Twofa_Push_WaitingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_push_waiting = /** @type {((inputs?: Twofa_Push_WaitingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Push_WaitingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_push_waiting(inputs)
	if (locale === "en-XA") return en_xa2_twofa_push_waiting(inputs)
	return en_twofa_push_waiting(inputs)
});