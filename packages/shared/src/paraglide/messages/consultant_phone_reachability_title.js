/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Reachability_TitleInputs */

const en_consultant_phone_reachability_title = /** @type {(inputs: Consultant_Phone_Reachability_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reachability`)
};

const es_consultant_phone_reachability_title = /** @type {(inputs: Consultant_Phone_Reachability_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alcanzabilidad`)
};

/**
* | output |
* | --- |
* | "Reachability" |
*
* @param {Consultant_Phone_Reachability_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_reachability_title = /** @type {((inputs?: Consultant_Phone_Reachability_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Reachability_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_reachability_title(inputs)
	return es_consultant_phone_reachability_title(inputs)
});