/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ index: NonNullable<unknown> }} Admin_Invite_Link_Card_LabelInputs */

const en_admin_invite_link_card_label = /** @type {(inputs: Admin_Invite_Link_Card_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Invite link ${i?.index}`)
};

const es_admin_invite_link_card_label = /** @type {(inputs: Admin_Invite_Link_Card_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Enlace de invitación ${i?.index}`)
};

const en_xa2_admin_invite_link_card_label = /** @type {(inputs: Admin_Invite_Link_Card_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtè lìnk  ••••${i?.index}⟧`)
};

/**
* | output |
* | --- |
* | "Invite link {index}" |
*
* @param {Admin_Invite_Link_Card_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_card_label = /** @type {((inputs: Admin_Invite_Link_Card_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_Card_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_invite_link_card_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_invite_link_card_label(inputs)
	return en_admin_invite_link_card_label(inputs)
});