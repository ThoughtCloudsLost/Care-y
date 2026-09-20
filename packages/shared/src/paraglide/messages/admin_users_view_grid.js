/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_View_GridInputs */

const en_admin_users_view_grid = /** @type {(inputs: Admin_Users_View_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Grid view`)
};

const es_admin_users_view_grid = /** @type {(inputs: Admin_Users_View_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista de cuadrícula`)
};

const en_xa2_admin_users_view_grid = /** @type {(inputs: Admin_Users_View_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Grìd vìèw •••⟧`)
};

/**
* | output |
* | --- |
* | "Grid view" |
*
* @param {Admin_Users_View_GridInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_view_grid = /** @type {((inputs?: Admin_Users_View_GridInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_View_GridInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_view_grid(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_view_grid(inputs)
	return en_admin_users_view_grid(inputs)
});