/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Rights_TitleInputs */

const en_intake_privacy_rights_title = /** @type {(inputs: Intake_Privacy_Rights_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your rights`)
};

const es_intake_privacy_rights_title = /** @type {(inputs: Intake_Privacy_Rights_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus derechos`)
};

/**
* | output |
* | --- |
* | "Your rights" |
*
* @param {Intake_Privacy_Rights_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_rights_title = /** @type {((inputs?: Intake_Privacy_Rights_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Rights_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_rights_title(inputs)
	return es_intake_privacy_rights_title(inputs)
});