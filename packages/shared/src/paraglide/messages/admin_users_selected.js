/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Users_SelectedInputs */

const en_admin_users_selected = /** @type {(inputs: Admin_Users_SelectedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} selected`)
};

const es_admin_users_selected = /** @type {(inputs: Admin_Users_SelectedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} seleccionados`)
};

/**
* | output |
* | --- |
* | "{count} selected" |
*
* @param {Admin_Users_SelectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_selected = /** @type {((inputs: Admin_Users_SelectedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_SelectedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_selected(inputs)
	return es_admin_users_selected(inputs)
});