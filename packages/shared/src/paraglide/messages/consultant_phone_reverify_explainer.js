/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Reverify_ExplainerInputs */

const en_consultant_phone_reverify_explainer = /** @type {(inputs: Consultant_Phone_Reverify_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enabling SMS pings again requires re-verification because the server no longer has your number.`)
};

const es_consultant_phone_reverify_explainer = /** @type {(inputs: Consultant_Phone_Reverify_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activar las notificaciones SMS de nuevo requiere re-verificación porque el servidor ya no tiene tu número.`)
};

const en_xa2_consultant_phone_reverify_explainer = /** @type {(inputs: Consultant_Phone_Reverify_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ènàblìng SMS pìngs àgàìn rèqùìrès rè-vèrìfìcàtìòn bècàùsè thè sèrvèr nò lòngèr hàs yòùr nùmbèr. •••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enabling SMS pings again requires re-verification because the server no longer has your number." |
*
* @param {Consultant_Phone_Reverify_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_reverify_explainer = /** @type {((inputs?: Consultant_Phone_Reverify_ExplainerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Reverify_ExplainerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_reverify_explainer(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_reverify_explainer(inputs)
	return en_consultant_phone_reverify_explainer(inputs)
});