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

const en_xa2_intake_privacy_rights_title = /** @type {(inputs: Intake_Privacy_Rights_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr rìghts ••••⟧`)
};

/**
* | output |
* | --- |
* | "Your rights" |
*
* @param {Intake_Privacy_Rights_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_rights_title = /** @type {((inputs?: Intake_Privacy_Rights_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Rights_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_rights_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_rights_title(inputs)
	return en_intake_privacy_rights_title(inputs)
});