/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Group_PeopleInputs */

const en_panel_group_people = /** @type {(inputs: Panel_Group_PeopleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`People`)
};

const es_panel_group_people = /** @type {(inputs: Panel_Group_PeopleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personas`)
};

/**
* | output |
* | --- |
* | "People" |
*
* @param {Panel_Group_PeopleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_group_people = /** @type {((inputs?: Panel_Group_PeopleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Group_PeopleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_group_people(inputs)
	return es_panel_group_people(inputs)
});