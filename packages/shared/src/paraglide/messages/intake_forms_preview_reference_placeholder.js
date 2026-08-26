/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Preview_Reference_PlaceholderInputs */

const en_intake_forms_preview_reference_placeholder = /** @type {(inputs: Intake_Forms_Preview_Reference_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`XXXX-XXXX`)
};

/** @type {(inputs: Intake_Forms_Preview_Reference_PlaceholderInputs) => LocalizedString} */
const es_intake_forms_preview_reference_placeholder = en_intake_forms_preview_reference_placeholder;

/**
* | output |
* | --- |
* | "XXXX-XXXX" |
*
* @param {Intake_Forms_Preview_Reference_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_preview_reference_placeholder = /** @type {((inputs?: Intake_Forms_Preview_Reference_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Preview_Reference_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_preview_reference_placeholder(inputs)
	return es_intake_forms_preview_reference_placeholder(inputs)
});