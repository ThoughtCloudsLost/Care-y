/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Invite_Volunteer_Step2Inputs */

const en_demo_guide_invite_volunteer_step2 = /** @type {(inputs: Demo_Guide_Invite_Volunteer_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap Invite and create the account directly or generate an invite link.`)
};

const es_demo_guide_invite_volunteer_step2 = /** @type {(inputs: Demo_Guide_Invite_Volunteer_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca Invitar y crea la cuenta directamente o genera un enlace de invitación.`)
};

const en_xa2_demo_guide_invite_volunteer_step2 = /** @type {(inputs: Demo_Guide_Invite_Volunteer_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàp Ìnvìtè ànd crèàtè thè àccòùnt dìrèctly òr gènèràtè àn ìnvìtè lìnk. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tap Invite and create the account directly or generate an invite link." |
*
* @param {Demo_Guide_Invite_Volunteer_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_invite_volunteer_step2 = /** @type {((inputs?: Demo_Guide_Invite_Volunteer_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Invite_Volunteer_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_invite_volunteer_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_invite_volunteer_step2(inputs)
	return en_demo_guide_invite_volunteer_step2(inputs)
});