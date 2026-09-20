/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Kb_No_ArticlesInputs */

const en_dashboard_kb_no_articles = /** @type {(inputs: Dashboard_Kb_No_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No recent articles`)
};

const es_dashboard_kb_no_articles = /** @type {(inputs: Dashboard_Kb_No_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin artículos recientes`)
};

const en_xa2_dashboard_kb_no_articles = /** @type {(inputs: Dashboard_Kb_No_ArticlesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò rècènt àrtìclès ••••••⟧`)
};

/**
* | output |
* | --- |
* | "No recent articles" |
*
* @param {Dashboard_Kb_No_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_no_articles = /** @type {((inputs?: Dashboard_Kb_No_ArticlesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Kb_No_ArticlesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_kb_no_articles(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_kb_no_articles(inputs)
	return en_dashboard_kb_no_articles(inputs)
});