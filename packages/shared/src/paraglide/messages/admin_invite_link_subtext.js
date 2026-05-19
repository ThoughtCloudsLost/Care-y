/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Link_SubtextInputs */

const en_admin_invite_link_subtext = /** @type {(inputs: Admin_Invite_Link_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generate a single-use invite link. Share it with the new team member to create their own account.`)
};

const es_admin_invite_link_subtext = /** @type {(inputs: Admin_Invite_Link_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Genere un enlace de invitacion de un solo uso. Compartalo con el nuevo miembro del equipo para que cree su propia cuenta.`)
};

/**
* | output |
* | --- |
* | "Generate a single-use invite link. Share it with the new team member to create their own account." |
*
* @param {Admin_Invite_Link_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_subtext = /** @type {((inputs?: Admin_Invite_Link_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_link_subtext(inputs)
	return es_admin_invite_link_subtext(inputs)
});