/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Retention_TitleInputs */

const en_intake_privacy_retention_title = /** @type {(inputs: Intake_Privacy_Retention_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How long we keep your data`)
};

const es_intake_privacy_retention_title = /** @type {(inputs: Intake_Privacy_Retention_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Por cuanto tiempo conservamos tus datos`)
};

/**
* | output |
* | --- |
* | "How long we keep your data" |
*
* @param {Intake_Privacy_Retention_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_retention_title = /** @type {((inputs?: Intake_Privacy_Retention_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Retention_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_retention_title(inputs)
	return es_intake_privacy_retention_title(inputs)
});