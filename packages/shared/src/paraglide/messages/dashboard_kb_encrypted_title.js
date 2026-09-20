/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Kb_Encrypted_TitleInputs */

const en_dashboard_kb_encrypted_title = /** @type {(inputs: Dashboard_Kb_Encrypted_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Updated article`)
};

const es_dashboard_kb_encrypted_title = /** @type {(inputs: Dashboard_Kb_Encrypted_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Artículo actualizado`)
};

const en_xa2_dashboard_kb_encrypted_title = /** @type {(inputs: Dashboard_Kb_Encrypted_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùpdàtèd àrtìclè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Updated article" |
*
* @param {Dashboard_Kb_Encrypted_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_encrypted_title = /** @type {((inputs?: Dashboard_Kb_Encrypted_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Kb_Encrypted_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_kb_encrypted_title(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_kb_encrypted_title(inputs)
	return en_dashboard_kb_encrypted_title(inputs)
});