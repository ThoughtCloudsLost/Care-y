/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Phone_EditInputs */

const en_phone_edit = /** @type {(inputs: Phone_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit phone number`)
};

const es_phone_edit = /** @type {(inputs: Phone_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar numero de telefono`)
};

/**
* | output |
* | --- |
* | "Edit phone number" |
*
* @param {Phone_EditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const phone_edit = /** @type {((inputs?: Phone_EditInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Phone_EditInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_phone_edit(inputs)
	return es_phone_edit(inputs)
});