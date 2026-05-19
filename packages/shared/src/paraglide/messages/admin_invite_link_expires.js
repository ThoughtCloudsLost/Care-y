/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ expiresAt: NonNullable<unknown> }} Admin_Invite_Link_ExpiresInputs */

const en_admin_invite_link_expires = /** @type {(inputs: Admin_Invite_Link_ExpiresInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Expires ${i?.expiresAt}`)
};

const es_admin_invite_link_expires = /** @type {(inputs: Admin_Invite_Link_ExpiresInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Expira ${i?.expiresAt}`)
};

/**
* | output |
* | --- |
* | "Expires {expiresAt}" |
*
* @param {Admin_Invite_Link_ExpiresInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_expires = /** @type {((inputs: Admin_Invite_Link_ExpiresInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_ExpiresInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_link_expires(inputs)
	return es_admin_invite_link_expires(inputs)
});