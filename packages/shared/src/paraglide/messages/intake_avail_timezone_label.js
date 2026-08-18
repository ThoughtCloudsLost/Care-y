/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ timezone: NonNullable<unknown> }} Intake_Avail_Timezone_LabelInputs */

const en_intake_avail_timezone_label = /** @type {(inputs: Intake_Avail_Timezone_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Timezone: ${i?.timezone}`)
};

const es_intake_avail_timezone_label = /** @type {(inputs: Intake_Avail_Timezone_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Zona horaria: ${i?.timezone}`)
};

/**
* | output |
* | --- |
* | "Timezone: {timezone}" |
*
* @param {Intake_Avail_Timezone_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_timezone_label = /** @type {((inputs: Intake_Avail_Timezone_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Avail_Timezone_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_avail_timezone_label(inputs)
	return es_intake_avail_timezone_label(inputs)
});