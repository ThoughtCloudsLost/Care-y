/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_2fa_BodyInputs */

const en_onboarding_briefing_choice_2fa_body = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An authenticator app code can be stolen by a fake login page. A hardware security key checks the site address before responding and will not work on a fake site. For orgs with high-risk clients, hardware security keys prevent this entire category of attack.`)
};

const es_onboarding_briefing_choice_2fa_body = /** @type {(inputs: Onboarding_Briefing_Choice_2fa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un codigo de aplicacion autenticadora puede ser robado por una pagina de inicio de sesion falsa. Una llave de seguridad fisica verifica la direccion del sitio antes de responder y no funcionara en un sitio falso. Para organizaciones con clientes de alto riesgo, las llaves fisicas previenen toda esta categoria de ataques.`)
};

/**
* | output |
* | --- |
* | "An authenticator app code can be stolen by a fake login page. A hardware security key checks the site address before responding and will not work on a fake s..." |
*
* @param {Onboarding_Briefing_Choice_2fa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_2fa_body = /** @type {((inputs?: Onboarding_Briefing_Choice_2fa_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_2fa_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_2fa_body(inputs)
	return es_onboarding_briefing_choice_2fa_body(inputs)
});