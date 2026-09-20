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

const en_xa2_admin_users_selected = /** @type {(inputs: Admin_Users_SelectedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} sèlèctèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} selected" |
*
* @param {Admin_Users_SelectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_selected = /** @type {((inputs: Admin_Users_SelectedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_SelectedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_selected(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_selected(inputs)
	return en_admin_users_selected(inputs)
});