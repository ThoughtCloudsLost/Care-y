/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ current: NonNullable<unknown>, total: NonNullable<unknown> }} Intake_Page_ProgressInputs */

const en_intake_page_progress = /** @type {(inputs: Intake_Page_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Step ${i?.current} of ${i?.total}`)
};

const es_intake_page_progress = /** @type {(inputs: Intake_Page_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Paso ${i?.current} de ${i?.total}`)
};

/**
* | output |
* | --- |
* | "Step {current} of {total}" |
*
* @param {Intake_Page_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_page_progress = /** @type {((inputs: Intake_Page_ProgressInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Page_ProgressInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_page_progress(inputs)
	return es_intake_page_progress(inputs)
});