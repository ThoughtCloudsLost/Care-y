/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Contact_BodyInputs */

const en_demo_narrative_client_intake_contact_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Contact_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The default form's contact step asks the visitor how the organization should reach them, with options for phone, email, and a choice to submit without leaving contact information.
**Account opt-in.** The intake form offers the visitor the option to create an account during submission by choosing a username and password. There is no way to recover a forgotten password, and if the password is ever reset the visitor's message history is permanently lost, so the choice is irreversible in a way a typical account is not. The option appears on both the default form and on custom forms, and expanding it collapses the continuation link option.
**Continuation link.** The intake form also offers a continuation link the visitor can use to return and follow up later without creating an account. The link carries the key material that unlocks the conversation in its URL fragment, so anyone who has the link can read and reply, and losing it means losing access with no recovery path. Expanding this option collapses the account option.`)
};

const es_demo_narrative_client_intake_contact_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Contact_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El paso de contacto del formulario predeterminado pregunta al visitante cómo debería contactarlo la organización, con opciones de teléfono, correo electrónico y la posibilidad de enviar sin dejar información de contacto.
**Opción de cuenta.** El formulario de admisión ofrece al visitante la opción de crear una cuenta durante el envío eligiendo un nombre de usuario y contraseña. No existe forma de recuperar una contraseña olvidada, y si la contraseña se restablece alguna vez el historial de mensajes del visitante se pierde de forma permanente, por lo que la elección es irreversible de un modo que una cuenta típica no lo es. La opción aparece tanto en el formulario predeterminado como en los formularios personalizados, y expandirla contrae la opción de enlace de continuación.
**Enlace de continuación.** El formulario de admisión también ofrece un enlace de continuación que el visitante puede usar para regresar y dar seguimiento más adelante sin crear una cuenta. El enlace lleva el material criptográfico que desbloquea la conversación en el fragmento de la URL, por lo que cualquier persona que tenga el enlace puede leer y responder, y perderlo significa perder el acceso sin forma de recuperarlo. Expandir esta opción contrae la opción de cuenta.`)
};

const en_xa2_demo_narrative_client_intake_contact_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Contact_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè dèfàùlt fòrm's còntàct stèp àsks thè vìsìtòr hòw thè òrgànìzàtìòn shòùld rèàch thèm, wìth òptìòns fòr phònè, èmàìl, ànd à chòìcè tò sùbmìt wìthòùt lèàvìng còntàct ìnfòrmàtìòn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àccòùnt òpt-ìn. •••••** Thè ìntàkè fòrm òffèrs thè vìsìtòr thè òptìòn tò crèàtè àn àccòùnt dùrìng sùbmìssìòn by chòòsìng à ùsèrnàmè ànd pàsswòrd. Thèrè ìs nò wày tò rècòvèr à fòrgòttèn pàsswòrd, ànd ìf thè pàsswòrd ìs èvèr rèsèt thè vìsìtòr's mèssàgè hìstòry ìs pèrmànèntly lòst, sò thè chòìcè ìs ìrrèvèrsìblè ìn à wày à typìcàl àccòùnt ìs nòt. Thè òptìòn àppèàrs òn bòth thè dèfàùlt fòrm ànd òn cùstòm fòrms, ànd èxpàndìng ìt còllàpsès thè còntìnùàtìòn lìnk òptìòn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còntìnùàtìòn lìnk. ••••••** Thè ìntàkè fòrm àlsò òffèrs à còntìnùàtìòn lìnk thè vìsìtòr càn ùsè tò rètùrn ànd fòllòw ùp làtèr wìthòùt crèàtìng àn àccòùnt. Thè lìnk càrrìès thè kèy màtèrìàl thàt ùnlòcks thè cònvèrsàtìòn ìn ìts ÙRL fràgmènt, sò ànyònè whò hàs thè lìnk càn rèàd ànd rèply, ànd lòsìng ìt mèàns lòsìng àccèss wìth nò rècòvèry pàth. Èxpàndìng thìs òptìòn còllàpsès thè àccòùnt òptìòn. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The default form's contact step asks the visitor how the organization should reach them, with options for phone, email, and a choice to submit without leavin..." |
*
* @param {Demo_Narrative_Client_Intake_Contact_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_contact_body = /** @type {((inputs?: Demo_Narrative_Client_Intake_Contact_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Contact_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_contact_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_intake_contact_body(inputs)
	return en_demo_narrative_client_intake_contact_body(inputs)
});