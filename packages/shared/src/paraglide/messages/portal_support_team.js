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

const en_xa2_portal_support_team = /** @type {(inputs: Portal_Support_TeamInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sùppòrt tèàm ••••⟧`)
};

/**
* | output |
* | --- |
* | "Support team" |
*
* @param {Portal_Support_TeamInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_support_team = /** @type {((inputs?: Portal_Support_TeamInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Support_TeamInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_support_team(inputs)
	if (locale === "en-XA") return en_xa2_portal_support_team(inputs)
	return en_portal_support_team(inputs)
});