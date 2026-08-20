/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Volunteer_LabelInputs */

const en_demo_role_volunteer_label = /** @type {(inputs: Demo_Role_Volunteer_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer user`)
};

const es_demo_role_volunteer_label = /** @type {(inputs: Demo_Role_Volunteer_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario voluntario`)
};

/**
* | output |
* | --- |
* | "Volunteer user" |
*
* @param {Demo_Role_Volunteer_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_volunteer_label = /** @type {((inputs?: Demo_Role_Volunteer_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Volunteer_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_role_volunteer_label(inputs)
	return es_demo_role_volunteer_label(inputs)
});