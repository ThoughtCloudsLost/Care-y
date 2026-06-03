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

/**
* | output |
* | --- |
* | "Waiting for approval..." |
*
* @param {Twofa_Push_WaitingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_push_waiting = /** @type {((inputs?: Twofa_Push_WaitingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Push_WaitingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_push_waiting(inputs)
	return es_twofa_push_waiting(inputs)
});