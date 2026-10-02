/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Invite_Volunteer_Step3Inputs */

const en_demo_guide_invite_volunteer_step3 = /** @type {(inputs: Demo_Guide_Invite_Volunteer_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the Roles tab to see the role the new account holds.`)
};

const es_demo_guide_invite_volunteer_step3 = /** @type {(inputs: Demo_Guide_Invite_Volunteer_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre la pestaña Roles para ver el rol que tiene la nueva cuenta.`)
};

const en_xa2_demo_guide_invite_volunteer_step3 = /** @type {(inputs: Demo_Guide_Invite_Volunteer_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè Ròlès tàb tò sèè thè ròlè thè nèw àccòùnt hòlds. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the Roles tab to see the role the new account holds." |
*
* @param {Demo_Guide_Invite_Volunteer_Step3Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_invite_volunteer_step3 = /** @type {((inputs?: Demo_Guide_Invite_Volunteer_Step3Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Invite_Volunteer_Step3Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_invite_volunteer_step3(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_invite_volunteer_step3(inputs)
	return en_demo_guide_invite_volunteer_step3(inputs)
});