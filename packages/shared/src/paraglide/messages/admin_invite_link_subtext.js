/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Invite_Link_SubtextInputs */

const en_admin_invite_link_subtext = /** @type {(inputs: Admin_Invite_Link_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generate a single-use invite link. Share it with the new team member to create their own account.`)
};

const es_admin_invite_link_subtext = /** @type {(inputs: Admin_Invite_Link_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Genere un enlace de invitación de un solo uso. Compartalo con el nuevo miembro del equipo para que cree su propia cuenta.`)
};

const en_xa2_admin_invite_link_subtext = /** @type {(inputs: Admin_Invite_Link_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gènèràtè à sìnglè-ùsè ìnvìtè lìnk. Shàrè ìt wìth thè nèw tèàm mèmbèr tò crèàtè thèìr òwn àccòùnt. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Generate a single-use invite link. Share it with the new team member to create their own account." |
*
* @param {Admin_Invite_Link_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_subtext = /** @type {((inputs?: Admin_Invite_Link_SubtextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_SubtextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_link_subtext(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_link_subtext(inputs)
	return en_admin_invite_link_subtext(inputs)
});