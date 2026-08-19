/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Share_LinkInputs */

const en_intake_forms_share_link = /** @type {(inputs: Intake_Forms_Share_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Share link`)
};

const es_intake_forms_share_link = /** @type {(inputs: Intake_Forms_Share_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace para compartir`)
};

/**
* | output |
* | --- |
* | "Share link" |
*
* @param {Intake_Forms_Share_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_share_link = /** @type {((inputs?: Intake_Forms_Share_LinkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Share_LinkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_share_link(inputs)
	return es_intake_forms_share_link(inputs)
});