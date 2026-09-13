/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Reverify_ExplainerInputs */

const en_consultant_phone_reverify_explainer = /** @type {(inputs: Consultant_Phone_Reverify_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enabling SMS pings again requires re-verification because the server no longer has your number.`)
};

const es_consultant_phone_reverify_explainer = /** @type {(inputs: Consultant_Phone_Reverify_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activar las notificaciones SMS de nuevo requiere re-verificacion porque el servidor ya no tiene tu numero.`)
};

/**
* | output |
* | --- |
* | "Enabling SMS pings again requires re-verification because the server no longer has your number." |
*
* @param {Consultant_Phone_Reverify_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_reverify_explainer = /** @type {((inputs?: Consultant_Phone_Reverify_ExplainerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Reverify_ExplainerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_reverify_explainer(inputs)
	return es_consultant_phone_reverify_explainer(inputs)
});