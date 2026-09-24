/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Review_BriefingInputs */

const en_settings_review_briefing = /** @type {(inputs: Settings_Review_BriefingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Review security briefing`)
};

const es_settings_review_briefing = /** @type {(inputs: Settings_Review_BriefingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revisar resumen de seguridad`)
};

const en_xa2_settings_review_briefing = /** @type {(inputs: Settings_Review_BriefingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèvìèw sècùrìty brìèfìng ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Review security briefing" |
*
* @param {Settings_Review_BriefingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_review_briefing = /** @type {((inputs?: Settings_Review_BriefingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Review_BriefingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_review_briefing(inputs)
	if (locale === "en-XA") return en_xa2_settings_review_briefing(inputs)
	return en_settings_review_briefing(inputs)
});