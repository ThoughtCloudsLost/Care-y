/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ index: NonNullable<unknown> }} Admin_Invite_Link_Card_LabelInputs */

const en_admin_invite_link_card_label = /** @type {(inputs: Admin_Invite_Link_Card_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Invite link ${i?.index}`)
};

const es_admin_invite_link_card_label = /** @type {(inputs: Admin_Invite_Link_Card_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Enlace de invitacion ${i?.index}`)
};

/**
* | output |
* | --- |
* | "Invite link {index}" |
*
* @param {Admin_Invite_Link_Card_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_card_label = /** @type {((inputs: Admin_Invite_Link_Card_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Invite_Link_Card_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_invite_link_card_label(inputs)
	return es_admin_invite_link_card_label(inputs)
});