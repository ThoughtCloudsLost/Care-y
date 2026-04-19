/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Protected_SummaryInputs */

const en_mgr_protected_summary = /** @type {(inputs: Mgr_Protected_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your identity and client data are end-to-end encrypted. The server never holds plaintext.`)
};

const es_mgr_protected_summary = /** @type {(inputs: Mgr_Protected_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu identidad y los datos de clientes estan cifrados de extremo a extremo. El servidor nunca tiene texto plano.`)
};

/**
* | output |
* | --- |
* | "Your identity and client data are end-to-end encrypted. The server never holds plaintext." |
*
* @param {Mgr_Protected_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_protected_summary = /** @type {((inputs?: Mgr_Protected_SummaryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Protected_SummaryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_protected_summary(inputs)
	return es_mgr_protected_summary(inputs)
});