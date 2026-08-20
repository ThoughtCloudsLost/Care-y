/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Support_TeamInputs */

const en_portal_support_team = /** @type {(inputs: Portal_Support_TeamInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Support team`)
};

const es_portal_support_team = /** @type {(inputs: Portal_Support_TeamInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Equipo de apoyo`)
};

/**
* | output |
* | --- |
* | "Support team" |
*
* @param {Portal_Support_TeamInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_support_team = /** @type {((inputs?: Portal_Support_TeamInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Support_TeamInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_support_team(inputs)
	return es_portal_support_team(inputs)
});