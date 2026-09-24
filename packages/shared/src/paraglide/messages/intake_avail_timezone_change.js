/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Avail_Timezone_ChangeInputs */

const en_intake_avail_timezone_change = /** @type {(inputs: Intake_Avail_Timezone_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change`)
};

const es_intake_avail_timezone_change = /** @type {(inputs: Intake_Avail_Timezone_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar`)
};

const en_xa2_intake_avail_timezone_change = /** @type {(inputs: Intake_Avail_Timezone_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngè ••⟧`)
};

/**
* | output |
* | --- |
* | "Change" |
*
* @param {Intake_Avail_Timezone_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_timezone_change = /** @type {((inputs?: Intake_Avail_Timezone_ChangeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Timezone_ChangeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_avail_timezone_change(inputs)
	if (locale === "en-XA") return en_xa2_intake_avail_timezone_change(inputs)
	return en_intake_avail_timezone_change(inputs)
});