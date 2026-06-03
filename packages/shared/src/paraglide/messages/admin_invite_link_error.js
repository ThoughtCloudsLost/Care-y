/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Link_ErrorInputs */

const en_admin_invite_link_error = /** @type {(inputs: Admin_Invite_Link_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to generate invite link`)
};

const es_admin_invite_link_error = /** @type {(inputs: Admin_Invite_Link_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error al generar el enlace de invitacion`)
};

/**
* | output |
* | --- |
* | "Failed to generate invite link" |
*
* @param {Admin_Invite_Link_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_error = /** @type {((inputs?: Admin_Invite_Link_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_link_error(inputs)
	return es_admin_invite_link_error(inputs)
});