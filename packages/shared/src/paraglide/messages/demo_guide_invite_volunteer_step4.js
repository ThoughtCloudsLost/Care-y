/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Invite_Volunteer_Step4Inputs */

const en_demo_guide_invite_volunteer_step4 = /** @type {(inputs: Demo_Guide_Invite_Volunteer_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the permission matrix to review what the role grants.`)
};

const es_demo_guide_invite_volunteer_step4 = /** @type {(inputs: Demo_Guide_Invite_Volunteer_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre la matriz de permisos para revisar lo que otorga el rol.`)
};

const en_xa2_demo_guide_invite_volunteer_step4 = /** @type {(inputs: Demo_Guide_Invite_Volunteer_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè pèrmìssìòn màtrìx tò rèvìèw whàt thè ròlè grànts. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the permission matrix to review what the role grants." |
*
* @param {Demo_Guide_Invite_Volunteer_Step4Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_invite_volunteer_step4 = /** @type {((inputs?: Demo_Guide_Invite_Volunteer_Step4Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Invite_Volunteer_Step4Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_invite_volunteer_step4(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_invite_volunteer_step4(inputs)
	return en_demo_guide_invite_volunteer_step4(inputs)
});