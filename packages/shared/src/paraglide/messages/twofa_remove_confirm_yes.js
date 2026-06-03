/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Remove_Confirm_YesInputs */

const en_twofa_remove_confirm_yes = /** @type {(inputs: Twofa_Remove_Confirm_YesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove`)
};

const es_twofa_remove_confirm_yes = /** @type {(inputs: Twofa_Remove_Confirm_YesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar`)
};

/**
* | output |
* | --- |
* | "Remove" |
*
* @param {Twofa_Remove_Confirm_YesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_remove_confirm_yes = /** @type {((inputs?: Twofa_Remove_Confirm_YesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Remove_Confirm_YesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_remove_confirm_yes(inputs)
	return es_twofa_remove_confirm_yes(inputs)
});