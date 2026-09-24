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

const en_xa2_permission_manage_share_links = /** @type {(inputs: Permission_Manage_Share_LinksInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè shàrè lìnks ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage share links" |
*
* @param {Permission_Manage_Share_LinksInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_share_links = /** @type {((inputs?: Permission_Manage_Share_LinksInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Share_LinksInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_share_links(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_share_links(inputs)
	return en_permission_manage_share_links(inputs)
});