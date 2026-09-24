/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Remove_ConfirmInputs */

const en_twofa_remove_confirm = /** @type {(inputs: Twofa_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove this method?`)
};

const es_twofa_remove_confirm = /** @type {(inputs: Twofa_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Eliminar este método?`)
};

const en_xa2_twofa_remove_confirm = /** @type {(inputs: Twofa_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè thìs mèthòd? ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Remove this method?" |
*
* @param {Twofa_Remove_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_remove_confirm = /** @type {((inputs?: Twofa_Remove_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Remove_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_remove_confirm(inputs)
	if (locale === "en-XA") return en_xa2_twofa_remove_confirm(inputs)
	return en_twofa_remove_confirm(inputs)
});