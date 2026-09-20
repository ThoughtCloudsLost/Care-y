/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Link_GeneratedInputs */

const en_admin_invite_link_generated = /** @type {(inputs: Admin_Invite_Link_GeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite link generated`)
};

const es_admin_invite_link_generated = /** @type {(inputs: Admin_Invite_Link_GeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace de invitación generado`)
};

const en_xa2_admin_invite_link_generated = /** @type {(inputs: Admin_Invite_Link_GeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtè lìnk gènèràtèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Invite link generated" |
*
* @param {Admin_Invite_Link_GeneratedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_generated = /** @type {((inputs?: Admin_Invite_Link_GeneratedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_GeneratedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_link_generated(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_link_generated(inputs)
	return en_admin_invite_link_generated(inputs)
});