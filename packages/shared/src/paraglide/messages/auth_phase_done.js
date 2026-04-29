/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Phase_DoneInputs */

const en_auth_phase_done = /** @type {(inputs: Auth_Phase_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ready`)
};

const es_auth_phase_done = /** @type {(inputs: Auth_Phase_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Listo`)
};

/**
* | output |
* | --- |
* | "Ready" |
*
* @param {Auth_Phase_DoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_phase_done = /** @type {((inputs?: Auth_Phase_DoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Phase_DoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_phase_done(inputs)
	return es_auth_phase_done(inputs)
});