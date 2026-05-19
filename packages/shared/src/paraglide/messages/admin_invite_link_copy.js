/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Link_CopyInputs */

const en_admin_invite_link_copy = /** @type {(inputs: Admin_Invite_Link_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copy Link`)
};

const es_admin_invite_link_copy = /** @type {(inputs: Admin_Invite_Link_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copiar enlace`)
};

/**
* | output |
* | --- |
* | "Copy Link" |
*
* @param {Admin_Invite_Link_CopyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_copy = /** @type {((inputs?: Admin_Invite_Link_CopyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_CopyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_link_copy(inputs)
	return es_admin_invite_link_copy(inputs)
});