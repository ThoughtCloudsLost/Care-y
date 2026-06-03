/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Pending_Invited_By_UnknownInputs */

const en_admin_invite_pending_invited_by_unknown = /** @type {(inputs: Admin_Invite_Pending_Invited_By_UnknownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invited by unknown`)
};

const es_admin_invite_pending_invited_by_unknown = /** @type {(inputs: Admin_Invite_Pending_Invited_By_UnknownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitado por desconocido`)
};

/**
* | output |
* | --- |
* | "Invited by unknown" |
*
* @param {Admin_Invite_Pending_Invited_By_UnknownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_invited_by_unknown = /** @type {((inputs?: Admin_Invite_Pending_Invited_By_UnknownInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Pending_Invited_By_UnknownInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_pending_invited_by_unknown(inputs)
	return es_admin_invite_pending_invited_by_unknown(inputs)
});