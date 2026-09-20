/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Link_CopiedInputs */

const en_admin_invite_link_copied = /** @type {(inputs: Admin_Invite_Link_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link copied to clipboard`)
};

const es_admin_invite_link_copied = /** @type {(inputs: Admin_Invite_Link_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace copiado al portapapeles`)
};

const en_xa2_admin_invite_link_copied = /** @type {(inputs: Admin_Invite_Link_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìnk còpìèd tò clìpbòàrd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Link copied to clipboard" |
*
* @param {Admin_Invite_Link_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_copied = /** @type {((inputs?: Admin_Invite_Link_CopiedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_CopiedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_link_copied(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_link_copied(inputs)
	return en_admin_invite_link_copied(inputs)
});