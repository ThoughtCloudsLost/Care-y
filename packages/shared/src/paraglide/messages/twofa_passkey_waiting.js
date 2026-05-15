/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Passkey_WaitingInputs */

const en_twofa_passkey_waiting = /** @type {(inputs: Twofa_Passkey_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Waiting for authenticator...`)
};

const es_twofa_passkey_waiting = /** @type {(inputs: Twofa_Passkey_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esperando al autenticador...`)
};

/**
* | output |
* | --- |
* | "Waiting for authenticator..." |
*
* @param {Twofa_Passkey_WaitingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_passkey_waiting = /** @type {((inputs?: Twofa_Passkey_WaitingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Passkey_WaitingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_passkey_waiting(inputs)
	return es_twofa_passkey_waiting(inputs)
});