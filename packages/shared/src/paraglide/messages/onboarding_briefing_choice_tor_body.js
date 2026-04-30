/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Tor_BodyInputs */

const en_onboarding_briefing_choice_tor_body = /** @type {(inputs: Onboarding_Briefing_Choice_Tor_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Without Tor, your internet provider and anyone with access to their records can see that your volunteers and clients are using your service. With Tor enabled, users who connect through Tor Browser hide their connection entirely. The trade-off: Tor is slower.`)
};

const es_onboarding_briefing_choice_tor_body = /** @type {(inputs: Onboarding_Briefing_Choice_Tor_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin Tor, tu proveedor de internet y cualquier persona con acceso a sus registros pueden ver que tus voluntarios y clientes usan tu servicio. Con Tor habilitado, los usuarios que se conectan a traves del Navegador Tor ocultan su conexion completamente. El compromiso: Tor es mas lento.`)
};

/**
* | output |
* | --- |
* | "Without Tor, your internet provider and anyone with access to their records can see that your volunteers and clients are using your service. With Tor enabled..." |
*
* @param {Onboarding_Briefing_Choice_Tor_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_tor_body = /** @type {((inputs?: Onboarding_Briefing_Choice_Tor_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Tor_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_tor_body(inputs)
	return es_onboarding_briefing_choice_tor_body(inputs)
});