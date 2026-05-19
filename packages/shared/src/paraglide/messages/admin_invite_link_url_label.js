/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Link_Url_LabelInputs */

const en_admin_invite_link_url_label = /** @type {(inputs: Admin_Invite_Link_Url_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite link`)
};

const es_admin_invite_link_url_label = /** @type {(inputs: Admin_Invite_Link_Url_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace de invitacion`)
};

/**
* | output |
* | --- |
* | "Invite link" |
*
* @param {Admin_Invite_Link_Url_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_url_label = /** @type {((inputs?: Admin_Invite_Link_Url_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_Url_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_link_url_label(inputs)
	return es_admin_invite_link_url_label(inputs)
});