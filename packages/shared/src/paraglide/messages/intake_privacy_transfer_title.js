/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Transfer_TitleInputs */

const en_intake_privacy_transfer_title = /** @type {(inputs: Intake_Privacy_Transfer_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cross-border data transfer`)
};

const es_intake_privacy_transfer_title = /** @type {(inputs: Intake_Privacy_Transfer_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Transferencia internacional de datos`)
};

const en_xa2_intake_privacy_transfer_title = /** @type {(inputs: Intake_Privacy_Transfer_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cròss-bòrdèr dàtà trànsfèr ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Cross-border data transfer" |
*
* @param {Intake_Privacy_Transfer_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_transfer_title = /** @type {((inputs?: Intake_Privacy_Transfer_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Transfer_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_transfer_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_transfer_title(inputs)
	return en_intake_privacy_transfer_title(inputs)
});