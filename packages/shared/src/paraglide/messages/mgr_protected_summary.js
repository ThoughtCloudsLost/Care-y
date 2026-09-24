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

const en_xa2_mgr_protected_summary = /** @type {(inputs: Mgr_Protected_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr ìdèntìty ànd clìènt dàtà àrè ènd-tò-ènd èncryptèd. Thè sèrvèr nèvèr hòlds plàìntèxt. •••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your identity and client data are end-to-end encrypted. The server never holds plaintext." |
*
* @param {Mgr_Protected_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_protected_summary = /** @type {((inputs?: Mgr_Protected_SummaryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Protected_SummaryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mgr_protected_summary(inputs)
	if (locale === "en-XA") return en_xa2_mgr_protected_summary(inputs)
	return en_mgr_protected_summary(inputs)
});