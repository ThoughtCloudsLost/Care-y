/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Phone_EditInputs */

const en_phone_edit = /** @type {(inputs: Phone_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit phone number`)
};

const es_phone_edit = /** @type {(inputs: Phone_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar número de teléfono`)
};

const en_xa2_phone_edit = /** @type {(inputs: Phone_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt phònè nùmbèr ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Edit phone number" |
*
* @param {Phone_EditInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const phone_edit = /** @type {((inputs?: Phone_EditInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Phone_EditInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_phone_edit(inputs)
	if (locale === "en-XA") return en_xa2_phone_edit(inputs)
	return en_phone_edit(inputs)
});