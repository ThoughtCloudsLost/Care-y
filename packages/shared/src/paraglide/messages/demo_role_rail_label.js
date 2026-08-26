/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Rail_LabelInputs */

const en_demo_role_rail_label = /** @type {(inputs: Demo_Role_Rail_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Role switcher`)
};

const es_demo_role_rail_label = /** @type {(inputs: Demo_Role_Rail_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selector de rol`)
};

/**
* | output |
* | --- |
* | "Role switcher" |
*
* @param {Demo_Role_Rail_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_rail_label = /** @type {((inputs?: Demo_Role_Rail_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Rail_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_role_rail_label(inputs)
	return es_demo_role_rail_label(inputs)
});