/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_EditInputs */

const en_admin_funds_edit = /** @type {(inputs: Admin_Funds_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit fund`)
};

const es_admin_funds_edit = /** @type {(inputs: Admin_Funds_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar fondo`)
};

const en_xa2_admin_funds_edit = /** @type {(inputs: Admin_Funds_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt fùnd •••⟧`)
};

/**
* | output |
* | --- |
* | "Edit fund" |
*
* @param {Admin_Funds_EditInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_edit = /** @type {((inputs?: Admin_Funds_EditInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_EditInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_edit(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_edit(inputs)
	return en_admin_funds_edit(inputs)
});