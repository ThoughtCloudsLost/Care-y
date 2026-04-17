/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Admin_Deactivate_TitleInputs */

const en_admin_deactivate_title = /** @type {(inputs: Admin_Deactivate_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Deactivate ${i?.name}?`)
};

const es_admin_deactivate_title = /** @type {(inputs: Admin_Deactivate_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Desactivar a ${i?.name}?`)
};

/**
* | output |
* | --- |
* | "Deactivate {name}?" |
*
* @param {Admin_Deactivate_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_title = /** @type {((inputs: Admin_Deactivate_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Deactivate_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_deactivate_title(inputs)
	return es_admin_deactivate_title(inputs)
});