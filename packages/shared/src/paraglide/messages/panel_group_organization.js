/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Group_OrganizationInputs */

const en_panel_group_organization = /** @type {(inputs: Panel_Group_OrganizationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization`)
};

const es_panel_group_organization = /** @type {(inputs: Panel_Group_OrganizationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organización`)
};

/**
* | output |
* | --- |
* | "Organization" |
*
* @param {Panel_Group_OrganizationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_group_organization = /** @type {((inputs?: Panel_Group_OrganizationInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Group_OrganizationInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_group_organization(inputs)
	return en_panel_group_organization(inputs)
});