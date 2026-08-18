/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Basis_TitleInputs */

const en_intake_privacy_basis_title = /** @type {(inputs: Intake_Privacy_Basis_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lawful basis for processing`)
};

const es_intake_privacy_basis_title = /** @type {(inputs: Intake_Privacy_Basis_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Base legal del tratamiento`)
};

/**
* | output |
* | --- |
* | "Lawful basis for processing" |
*
* @param {Intake_Privacy_Basis_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_basis_title = /** @type {((inputs?: Intake_Privacy_Basis_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Basis_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_basis_title(inputs)
	return es_intake_privacy_basis_title(inputs)
});