/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Link_ErrorInputs */

const en_admin_invite_link_error = /** @type {(inputs: Admin_Invite_Link_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to generate invite link`)
};

const es_admin_invite_link_error = /** @type {(inputs: Admin_Invite_Link_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error al generar el enlace de invitación`)
};

const en_xa2_admin_invite_link_error = /** @type {(inputs: Admin_Invite_Link_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fàìlèd tò gènèràtè ìnvìtè lìnk •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Failed to generate invite link" |
*
* @param {Admin_Invite_Link_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_error = /** @type {((inputs?: Admin_Invite_Link_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_link_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_link_error(inputs)
	return en_admin_invite_link_error(inputs)
});