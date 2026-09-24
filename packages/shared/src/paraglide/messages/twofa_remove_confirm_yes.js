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

const en_xa2_twofa_remove_confirm_yes = /** @type {(inputs: Twofa_Remove_Confirm_YesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè ••⟧`)
};

/**
* | output |
* | --- |
* | "Remove" |
*
* @param {Twofa_Remove_Confirm_YesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_remove_confirm_yes = /** @type {((inputs?: Twofa_Remove_Confirm_YesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Remove_Confirm_YesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_remove_confirm_yes(inputs)
	if (locale === "en-XA") return en_xa2_twofa_remove_confirm_yes(inputs)
	return en_twofa_remove_confirm_yes(inputs)
});