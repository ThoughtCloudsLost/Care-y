/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Share_LinksInputs */

const en_permission_manage_share_links = /** @type {(inputs: Permission_Manage_Share_LinksInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage share links`)
};

const es_permission_manage_share_links = /** @type {(inputs: Permission_Manage_Share_LinksInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar enlaces compartidos`)
};

/**
* | output |
* | --- |
* | "Manage share links" |
*
* @param {Permission_Manage_Share_LinksInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_share_links = /** @type {((inputs?: Permission_Manage_Share_LinksInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Share_LinksInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_share_links(inputs)
	return en_permission_manage_share_links(inputs)
});