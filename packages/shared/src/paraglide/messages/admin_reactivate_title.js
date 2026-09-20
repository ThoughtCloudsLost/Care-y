/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Admin_Reactivate_TitleInputs */

const en_admin_reactivate_title = /** @type {(inputs: Admin_Reactivate_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Reactivate ${i?.name}?`)
};

const es_admin_reactivate_title = /** @type {(inputs: Admin_Reactivate_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`¿Reactivar a ${i?.name}?`)
};

const en_xa2_admin_reactivate_title = /** @type {(inputs: Admin_Reactivate_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rèàctìvàtè  ••••${i?.name}? •⟧`)
};

/**
* | output |
* | --- |
* | "Reactivate {name}?" |
*
* @param {Admin_Reactivate_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reactivate_title = /** @type {((inputs: Admin_Reactivate_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reactivate_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reactivate_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_reactivate_title(inputs)
	return en_admin_reactivate_title(inputs)
});