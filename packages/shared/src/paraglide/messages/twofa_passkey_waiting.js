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

const en_xa2_twofa_passkey_waiting = /** @type {(inputs: Twofa_Passkey_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wàìtìng fòr àùthèntìcàtòr... •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Waiting for authenticator..." |
*
* @param {Twofa_Passkey_WaitingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_passkey_waiting = /** @type {((inputs?: Twofa_Passkey_WaitingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Passkey_WaitingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_passkey_waiting(inputs)
	if (locale === "en-XA") return en_xa2_twofa_passkey_waiting(inputs)
	return en_twofa_passkey_waiting(inputs)
});