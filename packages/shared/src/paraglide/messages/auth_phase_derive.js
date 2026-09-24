/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Phase_DeriveInputs */

const en_auth_phase_derive = /** @type {(inputs: Auth_Phase_DeriveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlocking your keys...`)
};

const es_auth_phase_derive = /** @type {(inputs: Auth_Phase_DeriveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desbloqueando tus claves...`)
};

const en_xa2_auth_phase_derive = /** @type {(inputs: Auth_Phase_DeriveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnlòckìng yòùr kèys... •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Unlocking your keys..." |
*
* @param {Auth_Phase_DeriveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_phase_derive = /** @type {((inputs?: Auth_Phase_DeriveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Phase_DeriveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_phase_derive(inputs)
	if (locale === "en-XA") return en_xa2_auth_phase_derive(inputs)
	return en_auth_phase_derive(inputs)
});