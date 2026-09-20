/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Ticket_Detail_DescInputs */

const en_demo_section_ticket_detail_desc = /** @type {(inputs: Demo_Section_Ticket_Detail_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Every field shown here is decrypted locally by the browser. The server stores and relays ciphertext without access to the content. The view has two modes: a conversation thread and a timeline for reviewing the full history of the case.`)
};

const es_demo_section_ticket_detail_desc = /** @type {(inputs: Demo_Section_Ticket_Detail_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada campo mostrado aquí se descifra localmente en el navegador. El servidor almacena y retransmite texto cifrado sin acceso al contenido. La vista tiene dos modos: un hilo de conversación y una línea de tiempo para revisar el historial completo del caso.`)
};

const en_xa2_demo_section_ticket_detail_desc = /** @type {(inputs: Demo_Section_Ticket_Detail_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èvèry fìèld shòwn hèrè ìs dècryptèd lòcàlly by thè bròwsèr. Thè sèrvèr stòrès ànd rèlàys cìphèrtèxt wìthòùt àccèss tò thè còntènt. Thè vìèw hàs twò mòdès: à cònvèrsàtìòn thrèàd ànd à tìmèlìnè fòr rèvìèwìng thè fùll hìstòry òf thè càsè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Every field shown here is decrypted locally by the browser. The server stores and relays ciphertext without access to the content. The view has two modes: a ..." |
*
* @param {Demo_Section_Ticket_Detail_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_ticket_detail_desc = /** @type {((inputs?: Demo_Section_Ticket_Detail_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Ticket_Detail_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_ticket_detail_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_ticket_detail_desc(inputs)
	return en_demo_section_ticket_detail_desc(inputs)
});