/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Admin_Reactivate_TitleInputs */

const en_admin_reactivate_title = /** @type {(inputs: Admin_Reactivate_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Reactivate ${i?.name}?`)
};

const es_admin_reactivate_title = /** @type {(inputs: Admin_Reactivate_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Reactivar a ${i?.name}?`)
};

/**
* | output |
* | --- |
* | "Reactivate {name}?" |
*
* @param {Admin_Reactivate_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reactivate_title = /** @type {((inputs: Admin_Reactivate_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reactivate_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reactivate_title(inputs)
	return es_admin_reactivate_title(inputs)
});