/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Group_CommunicationsInputs */

const en_panel_group_communications = /** @type {(inputs: Panel_Group_CommunicationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Communications`)
};

const es_panel_group_communications = /** @type {(inputs: Panel_Group_CommunicationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comunicaciones`)
};

/**
* | output |
* | --- |
* | "Communications" |
*
* @param {Panel_Group_CommunicationsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_group_communications = /** @type {((inputs?: Panel_Group_CommunicationsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Group_CommunicationsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_group_communications(inputs)
	return es_panel_group_communications(inputs)
});