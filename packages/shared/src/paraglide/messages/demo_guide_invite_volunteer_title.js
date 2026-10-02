/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Invite_Volunteer_TitleInputs */

const en_demo_guide_invite_volunteer_title = /** @type {(inputs: Demo_Guide_Invite_Volunteer_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite a volunteer`)
};

const es_demo_guide_invite_volunteer_title = /** @type {(inputs: Demo_Guide_Invite_Volunteer_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitar a un voluntario`)
};

const en_xa2_demo_guide_invite_volunteer_title = /** @type {(inputs: Demo_Guide_Invite_Volunteer_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtè à vòlùntèèr ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Invite a volunteer" |
*
* @param {Demo_Guide_Invite_Volunteer_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_invite_volunteer_title = /** @type {((inputs?: Demo_Guide_Invite_Volunteer_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Invite_Volunteer_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_invite_volunteer_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_invite_volunteer_title(inputs)
	return en_demo_guide_invite_volunteer_title(inputs)
});