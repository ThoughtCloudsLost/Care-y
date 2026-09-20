/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Closed_BodyInputs */

const en_demo_narrative_client_intake_closed_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The closed form state replaces the form fields with the organization's configured closing message and prevents submission.
**Custom message.** Administrators can write a closing message in the form builder's content section, and if no custom message is set a default notice tells the visitor that the form is no longer accepting submissions.`)
};

const es_demo_narrative_client_intake_closed_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El estado de formulario cerrado reemplaza los campos del formulario con el mensaje de cierre configurado por la organización e impide el envío.
**Mensaje personalizado.** Los administradores pueden escribir un mensaje de cierre en la sección de contenido del constructor de formularios, y si no se establece un mensaje personalizado un aviso predeterminado le dice al visitante que el formulario ya no acepta envíos.`)
};

const en_xa2_demo_narrative_client_intake_closed_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Closed_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè clòsèd fòrm stàtè rèplàcès thè fòrm fìèlds wìth thè òrgànìzàtìòn's cònfìgùrèd clòsìng mèssàgè ànd prèvènts sùbmìssìòn.
 •••••••••••••••••••••••••••••••••••••**Cùstòm mèssàgè. •••••** Àdmìnìstràtòrs càn wrìtè à clòsìng mèssàgè ìn thè fòrm bùìldèr's còntènt sèctìòn, ànd ìf nò cùstòm mèssàgè ìs sèt à dèfàùlt nòtìcè tèlls thè vìsìtòr thàt thè fòrm ìs nò lòngèr àccèptìng sùbmìssìòns. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The closed form state replaces the form fields with the organization's configured closing message and prevents submission. **Custom message.** Administrators..." |
*
* @param {Demo_Narrative_Client_Intake_Closed_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_closed_body = /** @type {((inputs?: Demo_Narrative_Client_Intake_Closed_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Closed_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_closed_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_intake_closed_body(inputs)
	return en_demo_narrative_client_intake_closed_body(inputs)
});