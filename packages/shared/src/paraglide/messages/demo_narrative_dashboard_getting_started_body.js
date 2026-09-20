/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Getting_Started_BodyInputs */

const en_demo_narrative_dashboard_getting_started_body = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A card at the top of the overview lists setup tasks, each linking to the relevant admin page.
**Visibility.** The checklist is visible only to administrators. Volunteers and managers never see it.
**Dismissal.** Once setup is complete, the checklist can be permanently dismissed. Dismissal is recorded at the organization level, so it applies to all administrators at once.`)
};

const es_demo_narrative_dashboard_getting_started_body = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una tarjeta en la parte superior del resumen lista las tareas de configuración, cada una enlazando a la página de administración correspondiente.
**Visibilidad.** La lista solo es visible para las personas administradoras. Los voluntarios y gestores nunca la ven.
**Descarte.** Una vez completada la configuración, la lista puede descartarse permanentemente. El descarte se registra a nivel de organización, por lo que se aplica a todas las personas administradoras a la vez.`)
};

const en_xa2_demo_narrative_dashboard_getting_started_body = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À càrd àt thè tòp òf thè òvèrvìèw lìsts sètùp tàsks, èàch lìnkìng tò thè rèlèvànt àdmìn pàgè.
 •••••••••••••••••••••••••••••**Vìsìbìlìty. ••••** Thè chècklìst ìs vìsìblè ònly tò àdmìnìstràtòrs. Vòlùntèèrs ànd mànàgèrs nèvèr sèè ìt.
 •••••••••••••••••••••••••••**Dìsmìssàl. •••** Òncè sètùp ìs còmplètè, thè chècklìst càn bè pèrmànèntly dìsmìssèd. Dìsmìssàl ìs rècòrdèd àt thè òrgànìzàtìòn lèvèl, sò ìt àpplìès tò àll àdmìnìstràtòrs àt òncè. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A card at the top of the overview lists setup tasks, each linking to the relevant admin page. **Visibility.** The checklist is visible only to administrators..." |
*
* @param {Demo_Narrative_Dashboard_Getting_Started_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_getting_started_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Getting_Started_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Getting_Started_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_getting_started_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_getting_started_body(inputs)
	return en_demo_narrative_dashboard_getting_started_body(inputs)
});